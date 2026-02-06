import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});


const RSS_SOURCES = {
  general: [
    {
      name: "Hindustan Times",
      url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
    },
    {
      name: "NDTV",
      url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    },
    {
      name: "Google News",
      url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
    },
  ],

  business: [
    {
      name: "TOI Business",
      url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    },
    {
      name: "Economic Times",
      url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    },
  ],

  technology: [
    {
      name: "TOI Tech",
      url: "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
    },
    {
      name: "Gadgets360",
      url: "https://feeds.feedburner.com/gadgets360-latest",
    },
  ],

  sports: [
    {
      name: "TOI Sports",
      url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    },
    {
      name: "ESPN Cricinfo",
      url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    },
  ],
};


const fetchSingleFeed = async (source, category) => {
  try {
  
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const url = source.url.includes('?') 
      ? `${source.url}&_t=${timestamp}&_r=${random}` 
      : `${source.url}?_t=${timestamp}&_r=${random}`;

    const response = await axios.get(url, {
      httpsAgent: agent,
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    const $ = cheerio.load(response.data, {
      xmlMode: true,
    });

    const items = $("item");
    const news = [];

    items.each((i, el) => {
      const title = $(el).find("title").text();

      let desc = $(el).find("description").text();
      desc = desc
        .replace(/<img[^>]*>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim();

      const link = $(el).find("link").text();
      const date = $(el).find("pubDate").text();

      if (title) {
        news.push({
  
          title,
          description: desc || "No description",
          link,

          time: date
            ? new Date(date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),

          source: source.name,
          category: category.toUpperCase(),
          image: "",
        });
      }
    });

    return news;
  } catch (err) {
    console.log(`❌ ${source.name} Error:`, err.message);
    return [];
  }
};

const fetchNews = async (category = "general") => {
  try {
    console.log(`🔄 Fetching ${category} news at ${new Date().toLocaleTimeString()}...`);

    const sources = RSS_SOURCES[category] || RSS_SOURCES.general;

    const requests = sources.map((src) =>
      fetchSingleFeed(src, category)
    );

    const results = await Promise.all(requests);

    const mergedNews = results.flat();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentNews = mergedNews.filter((article) => {
      try {
        const articleDate = new Date(article.time);
        return articleDate >= sevenDaysAgo;
      } catch (err) {

        return true;
      }
    });

    recentNews.sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return dateB - dateA;
    });

    console.log(
      `✅ Fetched ${recentNews.length} ${category} articles (last 7 days) at ${new Date().toLocaleTimeString()}`
    );

    return {
      news: recentNews, 
    };
  } catch (err) {
    console.log("❌ Fetch Error:", err.message);
    return { news: [] };
  }
};

export default fetchNews;