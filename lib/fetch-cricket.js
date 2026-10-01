import axios from "axios";

const RAPID_KEY = "fb88d4ed2amsh30f08779f746d71p186ca8jsn8a01463966fc";
const RAPID_HOST = "cricbuzz-cricket.p.rapidapi.com";

const formatScore = (score) => {
  if (!score) return "Yet to bat";
  const parts = [];
  if (score.inngs1) {
    const runs = score.inngs1.runs || 0;
    const wkts = score.inngs1.wickets !== undefined ? `/${score.inngs1.wickets}` : "";
    const ovs = score.inngs1.overs !== undefined ? ` (${score.inngs1.overs} ov)` : "";
    parts.push(`${runs}${wkts}${ovs}`);
  }
  if (score.inngs2) {
    const runs = score.inngs2.runs || 0;
    const wkts = score.inngs2.wickets !== undefined ? `/${score.inngs2.wickets}` : "";
    const ovs = score.inngs2.overs !== undefined ? ` (${score.inngs2.overs} ov)` : "";
    parts.push(`& ${runs}${wkts}${ovs}`);
  }
  return parts.length ? parts.join(" ") : "Yet to bat";
};

const formatMatchDate = (epoch) => {
  if (!epoch) return "Recent Match";
  const d = new Date(parseInt(epoch));
  if (isNaN(d.getTime())) return "Recent Match";

  const dateStr = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr}, ${timeStr.toUpperCase()} IST`;
};

const extractMatchesFromCricbuzz = (data, defaultState) => {
  const list = [];
  if (!data || !data.typeMatches) return list;

  for (const t of data.typeMatches) {
    const seriesList = t.seriesMatches || [];
    for (const sm of seriesList) {
      const wrapper = sm.seriesAdWrapper;
      if (wrapper && wrapper.matches) {
        for (const m of wrapper.matches) {
          const info = m.matchInfo;
          if (!info) continue;

          const matchScore = m.matchScore || {};
          const t1 = info.team1 || {};
          const t2 = info.team2 || {};
          const t1Name = t1.teamName || "Team 1";
          const t1Short = t1.teamSName || t1Name;
          const t2Name = t2.teamName || "Team 2";
          const t2Short = t2.teamSName || t2Name;

          const t1ScoreStr = formatScore(matchScore.team1Score);
          const t2ScoreStr = formatScore(matchScore.team2Score);

          const rawState = (info.state || defaultState || "LIVE").toUpperCase();
          const isLive =
            rawState.includes("PROGRESS") ||
            rawState.includes("LUNCH") ||
            rawState.includes("TEA") ||
            rawState.includes("INNINGS BREAK") ||
            rawState.includes("RAIN");

          const stateLabel = isLive ? "LIVE" : rawState.includes("COMPLETE") ? "RESULT" : rawState;

          const venue = [info.venueInfo?.ground, info.venueInfo?.city].filter(Boolean).join(", ");
          const matchDate = formatMatchDate(info.startDate || info.seriesStartDt);

          list.push({
            id: `cb_${info.matchId}`,
            matchId: info.matchId,
            series: info.seriesName || "Cricket Tournament",
            matchDesc: info.matchDesc || "",
            matchTitle: `${t1Name} vs ${t2Name}`,
            format: info.matchFormat || "CRICKET",
            state: stateLabel,
            team1: `${t1Name} (${t1Short})`,
            team2: `${t2Name} (${t2Short})`,
            score1: `${t1Short}: ${t1ScoreStr}`,
            score2: `${t2Short}: ${t2ScoreStr}`,
            summary: `${t1Short} ${t1ScoreStr} vs ${t2Short} ${t2ScoreStr}`,
            status: info.status || "Match scheduled",
            venue: venue || "International Cricket Ground",
            matchDate: matchDate,
            link: `https://www.cricbuzz.com/live-cricket-scores/${info.matchId}`,
            time: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase() + " IST",
          });
        }
      }
    }
  }

  return list;
};

let cachedCricketData = null;
let lastCricketTime = 0;
let isCricketRefreshing = false;
const CRICKET_CACHE_TTL = 45 * 1000;

const fetchCricketScoresInternal = async () => {
  try {
    console.log(`🏏 Fetching Cricbuzz Live & Recent Cricket at ${new Date().toLocaleTimeString()}...`);

    // 1. Fetch Live & Recent from Cricbuzz RapidAPI
    try {
      const [liveRes, recentRes] = await Promise.all([
        axios.get(`https://${RAPID_HOST}/matches/v1/live`, {
          timeout: 3500,
          headers: {
            "x-rapidapi-key": RAPID_KEY,
            "x-rapidapi-host": RAPID_HOST,
          },
        }).catch((e) => {
          console.error("❌ Cricbuzz Live API error:", e.response ? e.response.status : e.message);
          return null;
        }),
        axios.get(`https://${RAPID_HOST}/matches/v1/recent`, {
          timeout: 3500,
          headers: {
            "x-rapidapi-key": RAPID_KEY,
            "x-rapidapi-host": RAPID_HOST,
          },
        }).catch((e) => {
          console.error("❌ Cricbuzz Recent API error:", e.response ? e.response.status : e.message);
          return null;
        }),
      ]);

      const liveMatches = extractMatchesFromCricbuzz(liveRes?.data, "In Progress");
      const recentMatches = extractMatchesFromCricbuzz(recentRes?.data, "Complete");

      // Merge avoiding duplicates
      const seenIds = new Set();
      const combined = [];

      for (const m of liveMatches) {
        if (!seenIds.has(m.matchId)) {
          seenIds.add(m.matchId);
          combined.push(m);
        }
      }

      for (const m of recentMatches) {
        if (!seenIds.has(m.matchId) && combined.length < 30) {
          seenIds.add(m.matchId);
          combined.push(m);
        }
      }

      if (combined.length > 0) {
        cachedCricketData = combined;
        lastCricketTime = Date.now();
        console.log(`✅ Cricbuzz RapidAPI: Loaded & cached ${combined.length} matches`);
        return combined;
      }
    } catch (rapidErr) {
      console.error("❌ Cricbuzz RapidAPI fetch error:", rapidErr.message);
    }

    // 2. Fallback to Cricinfo RSS if RapidAPI fails or limits are exceeded
    const fallbackRes = await axios.get("https://static.cricinfo.com/rss/livescores.xml", { timeout: 3500 });
    const fallbackList = [];
    const cheerio = (await import("cheerio")).default || (await import("cheerio"));
    const $ = cheerio.load(fallbackRes.data, { xmlMode: true });

    $("item").each((i, el) => {
      const rawTitle = $(el).find("title").text().trim();
      const desc = $(el).find("description").text().trim();
      const link = $(el).find("link").text().trim();

      if (rawTitle) {
        fallbackList.push({
          id: `cric_fb_${i + 1}`,
          matchId: i + 1,
          series: "International Cricket",
          matchDesc: "",
          matchTitle: rawTitle,
          format: "MATCH",
          state: rawTitle.includes("*") ? "LIVE" : "RESULT",
          team1: rawTitle.split(" v ")[0] || rawTitle,
          team2: rawTitle.split(" v ")[1] || "",
          score1: desc || rawTitle,
          score2: "",
          summary: rawTitle,
          status: desc || rawTitle,
          venue: "International Venue",
          link: link || "https://www.espncricinfo.com",
          time: new Date().toLocaleTimeString("en-IN"),
        });
      }
    });

    cachedCricketData = fallbackList;
    lastCricketTime = Date.now();
    return fallbackList;
  } catch (error) {
    console.error("❌ Main Cricket Fetch Error:", error.message);
    if (cachedCricketData) return cachedCricketData;
    return [];
  }
};

export const fetchCricketScores = async () => {
  const now = Date.now();

  // Fresh cache hit (< 45s): 0ms response
  if (cachedCricketData && now - lastCricketTime < CRICKET_CACHE_TTL) {
    return cachedCricketData;
  }

  // Stale cache hit: return immediately and refresh in background
  if (cachedCricketData) {
    if (!isCricketRefreshing) {
      isCricketRefreshing = true;
      fetchCricketScoresInternal().finally(() => {
        isCricketRefreshing = false;
      });
    }
    return cachedCricketData;
  }

  return await fetchCricketScoresInternal();
};

export default fetchCricketScores;
