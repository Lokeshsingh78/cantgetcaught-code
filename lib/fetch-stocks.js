import axios from "axios";


const STOCK_SYMBOLS = {
  nifty50: [
    "RELIANCE",
    "TCS",
    "HDFCBANK",
    "INFY",
    "ICICIBANK",
    "HINDUNILVR",
    "ITC",
    "SBIN",
    "BHARTIARTL",
    "KOTAKBANK",
    "LT",
    "AXISBANK",
    "ASIANPAINT",
    "MARUTI",
    "SUNPHARMA",
    "TITAN",
    "ULTRACEMCO",
    "BAJFINANCE",
    "NESTLEIND",
    "WIPRO",
    "HCLTECH",
    "POWERGRID",
    "NTPC",
    "M&M",
    "ADANIPORTS",
    "BAJAJFINSV",
    "ONGC",
    "TECHM",
    "JSWSTEEL",
    "HINDALCO",
    "DIVISLAB",
    "TATASTEEL",
    "DRREDDY",
    "INDUSINDBK",
    "COALINDIA",
    "GRASIM",
    "EICHERMOT",
    "BRITANNIA",
    "CIPLA",
    "HEROMOTOCO",
    "APOLLOHOSP",
    "BAJAJ-AUTO",
    "BPCL",
    "SHREECEM",
    "UPL",
    "TATACONSUM",
    "ADANIENT",
    "SBILIFE",
    "LTIM",
  ],

  midcap: [
    "IRCTC",
    "PAYTM",
    "NYKAA",
    "DMART",
    "ADANIGREEN",
    "LICI",
    "TATAELXSI",
    "PERSISTENT",
    "TRENT",
    "POLYCAB",
    "HAVELLS",
    "PAGEIND",
    "SIEMENS",
    "ABB",
    "MPHASIS",
    "COFORGE",
    "DEEPAKNTR",
  ],

  psu: [
    "IOC",
    "GAIL",
    "PNB",
    "BANKBARODA",
    "CANBK",
    "NMDC",
    "SAIL",
    "BHEL",
    "NHPC",
    "RECLTD",
  ],

  it: ["LTTS", "KPITTECH", "OFSS", "TCS", "INFY", "WIPRO"],

  pharma: [
    "LUPIN",
    "AUROPHARMA",
    "ALKEM",
    "BIOCON",
    "TORNTPHARM",
    "GLENMARK",
    "ZYDUSLIFE",
  ],
};

const fetchStockFromYahoo = async (symbol) => {
  try {
    const yahooSymbol = `${symbol}.NS`;

  
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?_t=${timestamp}&_r=${random}`;

    const response = await axios.get(url, {
      timeout: 3500,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    const quote = response.data.chart.result?.[0];
    if (!quote) return null;

    const meta = quote.meta;

    const currentPrice = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || 0;

    const change = currentPrice - previousClose;
    const changePercent =
      previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      name: symbol,
      price: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      high: meta.regularMarketDayHigh?.toFixed(2) || "N/A",
      low: meta.regularMarketDayLow?.toFixed(2) || "N/A",
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || "N/A",
    };
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error.message);
    return null;
  }
};

const fetchIndices = async () => {
  const indices = [];
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  try {
    const nifty = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?_t=${timestamp}&_r=${random}`,
      {
        timeout: 3500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );

    const niftyMeta = nifty.data.chart.result[0].meta;

    const niftyChange = niftyMeta.regularMarketPrice - niftyMeta.previousClose;

    indices.push({
      symbol: "NIFTY 50",
      name: "NIFTY 50",
      price: niftyMeta.regularMarketPrice.toFixed(2),
      change: niftyChange.toFixed(2),
      changePercent: ((niftyChange / niftyMeta.previousClose) * 100).toFixed(2),
      high: niftyMeta.regularMarketDayHigh?.toFixed(2),
      low: niftyMeta.regularMarketDayLow?.toFixed(2),
      volume: "Index",
      isIndex: true,
    });
  } catch (err) {
    console.error("❌ NIFTY Error:", err.message);
  }

  try {
    // SENSEX
    const sensex = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?_t=${timestamp}&_r=${random}`,
      {
        timeout: 3500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );

    const sensexMeta = sensex.data.chart.result[0].meta;

    const sensexChange =
      sensexMeta.regularMarketPrice - sensexMeta.previousClose;

    indices.push({
      symbol: "SENSEX",
      name: "SENSEX",
      price: sensexMeta.regularMarketPrice.toFixed(2),
      change: sensexChange.toFixed(2),
      changePercent: ((sensexChange / sensexMeta.previousClose) * 100).toFixed(
        2,
      ),
      high: sensexMeta.regularMarketDayHigh?.toFixed(2),
      low: sensexMeta.regularMarketDayLow?.toFixed(2),
      volume: "Index",
      isIndex: true,
    });
  } catch (err) {
    console.error("❌ SENSEX Error:", err.message);
  }

  return indices;
};

let cachedStocksData = null;
let lastStocksTime = 0;
let isStocksRefreshing = false;
const STOCKS_CACHE_TTL = 90 * 1000;

const fetchStocksInternal = async () => {
  try {
    const indices = await fetchIndices();
    const symbols = Object.values(STOCK_SYMBOLS).flat();
    const uniqueSymbols = [...new Set(symbols)];

    // Fetch top 30 prominent stocks concurrently without artificial sleeps
    const selected = uniqueSymbols.slice(0, 30);
    const stockPromises = selected.map((s) => fetchStockFromYahoo(s));
    const results = await Promise.all(stockPromises);
    const validStocks = results.filter(Boolean);

    const allData = [...indices, ...validStocks];

    allData.sort((a, b) => {
      if (a.isIndex && !b.isIndex) return -1;
      if (!a.isIndex && b.isIndex) return 1;
      return a.symbol.localeCompare(b.symbol);
    });

    const data = {
      stocks: allData,
      lastUpdated: new Date().toLocaleString("en-IN"),
    };

    cachedStocksData = data;
    lastStocksTime = Date.now();
    console.log(`✅ Stocks: Cached ${allData.length} quotes instantly`);
    return data;
  } catch (error) {
    console.error("❌ Stock fetch error:", error.message);
    if (cachedStocksData) return cachedStocksData;
    return { stocks: [], lastUpdated: new Date().toISOString() };
  }
};

const fetchStocks = async () => {
  const now = Date.now();

  // 1. Fresh cache hit (< 90s): return in 0ms
  if (cachedStocksData && now - lastStocksTime < STOCKS_CACHE_TTL) {
    return cachedStocksData;
  }

  // 2. Stale cache: return immediately and update in background
  if (cachedStocksData) {
    if (!isStocksRefreshing) {
      isStocksRefreshing = true;
      fetchStocksInternal().finally(() => {
        isStocksRefreshing = false;
      });
    }
    return cachedStocksData;
  }

  // 3. First cold start: fetch directly
  return await fetchStocksInternal();
};

export default fetchStocks;
