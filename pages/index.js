import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import fetchNews from '../lib/fetch-news'
import fetchStocks from '../lib/fetch-stocks'
import fetchCricketScores from '../lib/fetch-cricket'

// High-Performance In-Memory Cache (Sub-millisecond page loads)
let cachedPageProps = null;
let lastPageCacheTime = 0;
let isRefreshingPageInBackground = false;
const PAGE_CACHE_TTL = 60 * 1000; // 60 seconds fresh

async function fetchFullPageData() {
  let globalCounter = 1;
  const getNextId = () => globalCounter++;

  const [
    generalNews,
    businessNews,
    techNews,
    sportsNews,
    stockData,
    cricketData,
  ] = await Promise.all([
    fetchNews('general').catch(() => ({ news: [] })),
    fetchNews('business').catch(() => ({ news: [] })),
    fetchNews('technology').catch(() => ({ news: [] })),
    fetchNews('sports').catch(() => ({ news: [] })),
    fetchStocks().catch(() => ({ stocks: [] })),
    fetchCricketScores().catch(() => []),
  ]);

  const allNews = [
    ...(generalNews?.news || []),
    ...(businessNews?.news || []),
    ...(techNews?.news || []),
    ...(sportsNews?.news || []),
  ].map((item) => ({
    ...item,
    id: getNextId(),
  }));

  const shuffledNews = allNews
    .sort(() => Math.random() - 0.5)
    .slice(0, 100);

  const payload = {
    news: shuffledNews,
    stocks: stockData?.stocks || [],
    cricket: cricketData || [],
    timestamp: new Date().toISOString(),
  };

  cachedPageProps = payload;
  lastPageCacheTime = Date.now();
  console.log(`⚡ Page cache primed (${shuffledNews.length} news, ${payload.stocks.length} stocks, ${payload.cricket.length} cricket)`);
  return payload;
}

export async function getServerSideProps({ res }) {
  if (res) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  const now = Date.now();

  // 1. Fresh cache hit: Return in < 1ms
  if (cachedPageProps && now - lastPageCacheTime < PAGE_CACHE_TTL) {
    return { props: cachedPageProps };
  }

  // 2. Stale cache: Return cached instantly so user NEVER waits, refresh in background
  if (cachedPageProps) {
    if (!isRefreshingPageInBackground) {
      isRefreshingPageInBackground = true;
      fetchFullPageData().catch(console.error).finally(() => {
        isRefreshingPageInBackground = false;
      });
    }
    return { props: cachedPageProps };
  }

  // 3. First cold start: Fetch and populate cache
  try {
    const data = await fetchFullPageData();
    return { props: data };
  } catch (error) {
    console.error('❌ Server Side Props Error:', error);
    return {
      props: {
        news: [],
        stocks: [],
        cricket: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
}

const TERMINAL_LOCATION = 'C:\\workspaces\\enterprise\\core-services';

export default function Home({ news, stocks, cricket = [], timestamp }) {
  const [expandedNews, setExpandedNews] = useState(null);
  const [activeTab, setActiveTab] = useState('index.js');
  const [openTabs, setOpenTabs] = useState(['index.js', 'fetch.js', 'cricket.py']);

  // Terminal State
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(260);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isStreamingLogs, setIsStreamingLogs] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEndRef = useRef(null);
  const terminalInputRef = useRef(null);
  const streamIntervalRef = useRef(null);

  const toggleTerminalSize = () => {
    setIsTerminalMaximized((prev) => {
      const next = !prev;
      setTerminalHeight(next ? 460 : 260);
      return next;
    });
  };

  const toggleNews = (id) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  const openTab = (tabName) => {
    if (!openTabs.includes(tabName)) {
      setOpenTabs([...openTabs, tabName]);
    }
    setActiveTab(tabName);
  };

  const closeTab = (tabName, e) => {
    e.stopPropagation();
    const updated = openTabs.filter((t) => t !== tabName);
    if (updated.length > 0) {
      setOpenTabs(updated);
      if (activeTab === tabName) {
        setActiveTab(updated[updated.length - 1]);
      }
    }
  };

  // Line counts
  const newsBaseLines = 19;
  const newsLinesPerItem = 9;
  const newsExpandedExtraLines = 3;
  const newsEndLines = 15;
  const expandedCount = expandedNews ? 1 : 0;
  const newsTotalLines = newsBaseLines + (news?.length || 0) * newsLinesPerItem + expandedCount * newsExpandedExtraLines + newsEndLines;
  const newsLineCount = Math.max(newsTotalLines, 30);

  const stocksBaseLines = 11;
  const stocksLinesPerItem = 11;
  const stocksEndLines = 8;
  const stocksTotalLines = stocksBaseLines + (stocks?.length || 0) * stocksLinesPerItem + stocksEndLines;
  const stocksLineCount = Math.max(stocksTotalLines, 30);

  const cricketLineCount = Math.max(14 + (cricket?.length || 0) * 11 + 6, 30);

  const currentLineCount =
    activeTab === 'index.js'
      ? newsLineCount
      : activeTab === 'fetch.js'
        ? stocksLineCount
        : cricketLineCount;

  const currentLanguage =
    activeTab === 'cricket.py'
      ? 'Python'
      : 'JavaScript';

  // Realistic PM2 Log Generator
  const generatePm2Log = () => {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 23);
    const services = [
      { id: 0, name: 'api-gateway' },
      { id: 1, name: 'worker-pool' },
      { id: 2, name: 'feed-sync  ' },
      { id: 3, name: 'auth-daemon' },
    ];
    const s = services[Math.floor(Math.random() * services.length)];
    const types = ['http', 'redis', 'db', 'kafka', 'metrics'];
    const logType = types[Math.floor(Math.random() * types.length)];

    if (logType === 'http') {
      const endpoints = [
        '/v1/telemetry/live',
        '/api/sports/cricket/live',
        '/api/feed/market?sort=top',
        '/v2/market/tickers/NSE?limit=60',
        '/healthz/liveness',
        '/metrics/prometheus',
      ];
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const status = Math.random() > 0.15 ? 200 : Math.random() > 0.5 ? 304 : 204;
      const ms = (Math.random() * 32 + 7).toFixed(1);
      const mem = Math.floor(Math.random() * 35 + 135);
      return `${s.id}|${s.name} | ${time}: [HTTP] GET ${ep} ${status} - ${ms}ms [heap: ${mem}MB]`;
    } else if (logType === 'redis') {
      const keys = ['cache:nifty_50', 'cache:cricket_live', 'cache:hn_front', 'session:usr_981a'];
      const key = keys[Math.floor(Math.random() * keys.length)];
      const hit = Math.random() > 0.25 ? 'HIT' : 'SET';
      return `${s.id}|${s.name} | ${time}: [REDIS] Cache ${hit} key='${key}' [ttl: 60s]`;
    } else if (logType === 'db') {
      const queries = [
        'SELECT symbol, price, change FROM ticker_quotes WHERE active = true',
        'UPDATE sync_heartbeat SET last_seen = NOW() WHERE worker_id = 1',
        'SELECT id, points, title FROM hn_articles ORDER BY points DESC LIMIT 25',
      ];
      const q = queries[Math.floor(Math.random() * queries.length)];
      const ms = (Math.random() * 5 + 1.2).toFixed(2);
      return `${s.id}|${s.name} | ${time}: [POSTGRES] Pool conn #12 acquired (${ms}ms) -> "${q}"`;
    } else if (logType === 'kafka') {
      const partition = Math.floor(Math.random() * 8);
      const offset = Math.floor(Math.random() * 900000 + 1000000);
      return `${s.id}|${s.name} | ${time}: [KAFKA] Committed offset ${offset} on partition ${partition} [lag: 0]`;
    } else {
      const cpu = (Math.random() * 3 + 1.1).toFixed(1);
      const mem = Math.floor(Math.random() * 15 + 140);
      return `${s.id}|${s.name} | ${time}: [SYSTEM] GC completed in 1.8ms | EventLoop lag: 0.6ms | RSS: ${mem}MB | CPU: ${cpu}%`;
    }
  };

  // Keyboard shortcut listener: Ctrl + ~ and Ctrl + C
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.ctrlKey && (e.key === '`' || e.key === '~' || e.code === 'Backquote')) {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
          setIsStreamingLogs(false);
          setTerminalLines((prev) => [
            ...prev,
            { text: '^C', type: 'cmd' },
            { text: '[SIGINT] Log streaming paused. Type commands or "help".', type: 'system' },
          ]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Auto focus input when terminal opens
  useEffect(() => {
    if (showTerminal) {
      setTimeout(() => {
        terminalInputRef.current?.focus();
      }, 100);
    }
  }, [showTerminal]);

  // Auto-scroll terminal on new lines
  useEffect(() => {
    if (showTerminal && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLines, showTerminal]);

  // Terminal Submit Handler
  const handleTerminalSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const rawCmd = terminalInput;
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setTerminalInput('');

    const newLines = [...terminalLines, { text: rawCmd, type: 'cmd', isPrompt: true }];

    const cleanCmd = cmd.toLowerCase().replace(/\s+/g, ' ');

    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setTerminalLines([]);
      return;
    }

    if (cleanCmd === 'exit') {
      setShowTerminal(false);
      return;
    }

    if (cleanCmd === 'stop') {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setIsStreamingLogs(false);
      newLines.push({ text: '[STREAM STOPPED] Tailing stopped.', type: 'system' });
      setTerminalLines(newLines);
      return;
    }

    // pm2 logs command support: pm2 logs --lines 1000, pm2 logs--lines 1000, pm2 logs
    if (
      cleanCmd === 'pm2 logs--lines 1000' ||
      cleanCmd.startsWith('pm2 logs --lines') ||
      cleanCmd.startsWith('pm2 logs--lines') ||
      cleanCmd === 'pm2 logs' ||
      cleanCmd === 'pm2 log'
    ) {
      newLines.push({
        text: '[TAILING] Tailing last 1000 lines for [all] processes (change the value with --lines option)',
        type: 'system',
      });
      newLines.push({ text: `${TERMINAL_LOCATION}\\.pm2\\logs\\cluster-api-out.log last 1000 lines:`, type: 'system' });

      // Generate 15 initial past logs
      for (let i = 0; i < 15; i++) {
        newLines.push({ text: generatePm2Log(), type: 'log' });
      }

      newLines.push({
        text: '[STREAMING] Realtime PM2 log tail active. Updating live... (Press Ctrl+C or type "stop" to pause)',
        type: 'info',
      });

      setTerminalLines(newLines);
      setIsStreamingLogs(true);

      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

      streamIntervalRef.current = setInterval(() => {
        setTerminalLines((prev) => {
          const nextLog = generatePm2Log();
          const trimmed = prev.length > 1000 ? prev.slice(prev.length - 850) : prev;
          return [...trimmed, { text: nextLog, type: 'log' }];
        });
      }, 1100);

      return;
    }

    if (cleanCmd === 'pm2 status' || cleanCmd === 'pm2 list') {
      newLines.push({ text: '┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐', type: 'system' });
      newLines.push({ text: '│ id  │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │', type: 'system' });
      newLines.push({ text: '├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤', type: 'system' });
      newLines.push({ text: '│ 0   │ api-gateway  │ default     │ 2.4.0   │ cluster │ 18492    │ 14D    │ 0    │ online    │', type: 'system' });
      newLines.push({ text: '│ 1   │ worker-pool  │ default     │ 2.4.0   │ cluster │ 18493    │ 14D    │ 0    │ online    │', type: 'system' });
      newLines.push({ text: '│ 2   │ feed-sync    │ default     │ 2.4.0   │ fork    │ 18501    │ 14D    │ 0    │ online    │', type: 'system' });
      newLines.push({ text: '│ 3   │ auth-daemon  │ default     │ 2.4.0   │ fork    │ 18512    │ 14D    │ 0    │ online    │', type: 'system' });
      newLines.push({ text: '└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘', type: 'system' });
      setTerminalLines(newLines);
      return;
    }

    if (cleanCmd === 'help') {
      newLines.push({ text: 'Available commands in PowerShell:', type: 'info' });
      newLines.push({ text: '  pm2 logs --lines 1000  : Stream live PM2 cluster logs (continuously updating)', type: 'system' });
      newLines.push({ text: '  stop                   : Stop live log streaming (or press Ctrl + C)', type: 'system' });
      newLines.push({ text: '  pm2 status             : Display active PM2 processes & cluster metrics', type: 'system' });
      newLines.push({ text: '  ls / dir               : List files in current directory', type: 'system' });
      newLines.push({ text: '  cat <file>             : Open/switch file tab in editor (e.g. cat cricket.py)', type: 'system' });
      newLines.push({ text: '  clear / cls            : Clear terminal screen', type: 'system' });
      newLines.push({ text: '  exit                   : Close terminal panel', type: 'system' });
      setTerminalLines(newLines);
      return;
    }

    if (cleanCmd === 'ls' || cleanCmd === 'dir') {
      newLines.push({ text: '', type: 'system' });
      newLines.push({ text: `    Directory: ${TERMINAL_LOCATION}`, type: 'system' });
      newLines.push({ text: '', type: 'system' });
      newLines.push({ text: 'Mode                 LastWriteTime         Length Name', type: 'system' });
      newLines.push({ text: '----                 -------------         ------ ----', type: 'system' });
      newLines.push({ text: 'd-----         01-10-2026    12:00                pages', type: 'system' });
      newLines.push({ text: 'd-----         01-10-2026    12:00                lib', type: 'system' });
      newLines.push({ text: '-a----         01-10-2026    12:00          36346 index.js', type: 'system' });
      newLines.push({ text: '-a----         01-10-2026    12:00           6767 fetch.js', type: 'system' });
      newLines.push({ text: '-a----         01-10-2026    12:00           4566 cricket.py', type: 'system' });
      newLines.push({ text: '-a----         01-10-2026    12:00            534 package.json', type: 'system' });
      newLines.push({ text: '', type: 'system' });
      setTerminalLines(newLines);
      return;
    }

    if (cleanCmd.startsWith('cat ') || cleanCmd.startsWith('code ')) {
      const target = cleanCmd.split(' ')[1];
      if (['index.js', 'fetch.js', 'cricket.py'].includes(target)) {
        openTab(target);
        newLines.push({ text: `[WORKSPACE] Switched editor to ${target}.`, type: 'info' });
      } else {
        newLines.push({ text: `cat : Cannot find path '${TERMINAL_LOCATION}\\${target}' because it does not exist.`, type: 'error' });
      }
      setTerminalLines(newLines);
      return;
    }

    newLines.push({
      text: `${cmd} : The term '${cmd}' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.`,
      type: 'error',
    });
    setTerminalLines(newLines);
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.py')) return { text: 'PY', color: '#3572A5' };
    return { text: 'JS', color: '#f1c40f' };
  };

  return (
    <div className="container">
      <Head>
        <title>Cantgetcaught-Code : Surf news and stocks ~ don't get caught</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Browse latest news in VS Code style interface" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* Top Navigation Bar */}
      <div className="topBar">
        <div className="menuBar">
          <div className="menuItem">File</div>
          <div className="menuItem">Edit</div>
          <div className="menuItem">Selection</div>
          <div className="menuItem">View</div>
          <div className="menuItem">Go</div>
          <div className="menuItem">Run</div>
          <div
            className={`menuItem ${showTerminal ? 'activeMenu' : ''}`}
            onClick={() => setShowTerminal((prev) => !prev)}
            title="Toggle Terminal (Ctrl + ~)"
          >
            Terminal
          </div>
          <div className="menuItem">Help</div>
        </div>
        <div className="titleBar">
          <span className="fileName">{activeTab} — cantgetcaught-code</span>
        </div>
        <div className="windowControls">
          <div className="control minimize">−</div>
          <div className="control maximize">□</div>
          <div className="control close">×</div>
        </div>
      </div>

      {/* Activity Bar - 12 icons matching user's VS Code */}
      <div className="activityBar">
        {/* 1. Explorer / Files */}
        <div className="activityIcon active" title="Explorer (Ctrl + Shift + E)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="3" width="13" height="15" rx="2"></rect>
            <path d="M4 7v13a2 2 0 0 0 2 2h11"></path>
            <path d="M15 3v5h5"></path>
          </svg>
        </div>

        {/* 2. Search */}
        <div className="activityIcon" title="Search (Ctrl + Shift + F)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16" y2="16"></line>
          </svg>
        </div>

        {/* 3. Source Control */}
        <div className="activityIcon" title="Source Control (Ctrl + Shift + G)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="18" r="2.5"></circle>
            <circle cx="6" cy="6" r="2.5"></circle>
            <circle cx="18" cy="8" r="2.5"></circle>
            <path d="M6 8.5v7"></path>
            <path d="M6 13a6 6 0 0 0 9.5-3.5"></path>
          </svg>
        </div>

        {/* 4. Run & Debug */}
        <div className="activityIcon" title="Run and Debug (Ctrl + Shift + D)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="10 3 18 8 10 13 10 3"></polygon>
            <rect x="6" y="11" width="10" height="9" rx="3"></rect>
            <path d="M3 13h3M3 16h3M3 19h3M16 13h3M16 16h3M16 19h3"></path>
          </svg>
        </div>

        {/* 5. Extensions (with sync badge) */}
        <div className="activityIcon" title="Extensions (Ctrl + Shift + X)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1" transform="rotate(45 17.5 17.5)"></rect>
          </svg>
          <span className="syncBadge">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
          </span>
        </div>

        {/* 6. Remote Explorer / Terminal (Active rounded container with sync badge) */}
        <div
          className={`activityIcon activeContainer ${showTerminal ? 'activeTerm' : ''}`}
          title="Terminal (Ctrl + ~)"
          onClick={() => setShowTerminal((prev) => !prev)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="4" width="20" height="13" rx="2.5"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span className="syncBadge">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
          </span>
        </div>

        {/* 7. ChatGPT */}
        <div className="activityIcon" title="ChatGPT">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a4.5 4.5 0 0 1 4 2.4l.4.8a4.5 4.5 0 0 1 2.2 4.1l-.1.9a4.5 4.5 0 0 1 .6 4.6l-.5.7a4.5 4.5 0 0 1-2.4 3.7l-.8.4a4.5 4.5 0 0 1-4.6.6l-.7-.5a4.5 4.5 0 0 1-3.7-2.4l-.4-.8a4.5 4.5 0 0 1-.6-4.6l.5-.7a4.5 4.5 0 0 1 2.4-3.7l.8-.4A4.5 4.5 0 0 1 12 2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>

        {/* 8. Thunder Client */}
        <div className="activityIcon" title="Thunder Client">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9.5"></circle>
            <path d="M13 6.5l-4.5 6.5h4l-1.5 5 5.5-7.5h-4l1.5-4z" fill="currentColor"></path>
          </svg>
        </div>

        {/* 9. Python (with sync badge) */}
        <div className="activityIcon" title="Python (cricket.py)" onClick={() => openTab('cricket.py')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3c-3 0-5 .6-5 2.5v2h5.5v.8H5C3 8.3 1.8 9.8 1.8 12.2s1.2 3.9 3.2 3.9h1.5v-2c0-2 1.8-3.6 3.8-3.6h5.2V8.5C15.5 5.5 14.5 3 12 3z"></path>
            <circle cx="10" cy="5" r=".7" fill="currentColor"></circle>
            <path d="M12 21c3 0 5-.6 5-2.5v-2h-5.5v-.8h7.5c2 0 3.2-1.5 3.2-3.9s-1.2-3.9-3.2-3.9h-1.5v2c0 2-1.8 3.6-3.8 3.6H8.5v2c0 3 1 5.5 3.5 5.5z"></path>
            <circle cx="14" cy="19" r=".7" fill="currentColor"></circle>
          </svg>
          <span className="syncBadge">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebarHeader">
          <div className="sidebarTitle">EXPLORER</div>
          <div className="sidebarActions">•••</div>
        </div>
        <div className="fileTree">
          <div className="folder expanded">
            <span className="folderIcon">▼</span>
            <span className="folderName">Cantgetcaught</span>
          </div>
          <div className="fileTreeContent">
            <div className="folder">
              <span className="folderIcon">▶</span>
              <span className="folderName">.next</span>
            </div>
            <div className="folder">
              <span className="folderIcon">▶</span>
              <span className="folderName">lib</span>
            </div>
            <div className="folder">
              <span className="folderIcon">▶</span>
              <span className="folderName">node_modules</span>
            </div>
            <div className="folder expanded">
              <span className="folderIcon">▼</span>
              <span className="folderName">pages</span>
            </div>
            <div className="fileTreeContent nested">
              <div
                className={`file ${activeTab === 'index.js' ? 'active' : ''}`}
                onClick={() => openTab('index.js')}
              >
                <span className="fileIcon" style={{ color: '#f1c40f' }}>JS</span>
                <span className="fileName">index.js</span>
              </div>
              <div
                className={`file ${activeTab === 'fetch.js' ? 'active' : ''}`}
                onClick={() => openTab('fetch.js')}
              >
                <span className="fileIcon" style={{ color: '#f1c40f' }}>JS</span>
                <span className="fileName">fetch.js</span>
              </div>
              <div
                className={`file ${activeTab === 'cricket.py' ? 'active' : ''}`}
                onClick={() => openTab('cricket.py')}
              >
                <span className="fileIcon" style={{ color: '#3572A5' }}>PY</span>
                <span className="fileName">cricket.py</span>
              </div>
            </div>
            <div className="folder">
              <span className="folderIcon">▶</span>
              <span className="folderName">public</span>
            </div>
            <div className="file">
              <span className="fileIcon">•</span>
              <span className="fileName">.gitignore</span>
            </div>
            <div className="file">
              <span className="fileIcon">📄</span>
              <span className="fileName">package.json</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tabBar">
        {openTabs.map((tab) => {
          const icon = getFileIcon(tab);
          return (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tabIcon" style={{ color: icon.color }}>{icon.text}</span>
              <span className="tabName">{tab}</span>
              <span
                className="tabClose"
                onClick={(e) => closeTab(tab, e)}
                title="Close tab"
              >
                ×
              </span>
            </div>
          );
        })}
      </div>

      {/* Editor Area - NEWS TAB (index.js) */}
      {activeTab === 'index.js' && (
        <div className="editor" style={{ bottom: showTerminal ? `${terminalHeight + 22}px` : '22px' }}>
          <div className="lineNumbers">
            {Array.from({ length: newsLineCount }, (_, i) => (
              <div key={i} className="lineNumber">{i + 1}</div>
            ))}
          </div>

          <div className="codeContent">
            <div className="codeLine">
              <span className="keyword">import</span> <span className="variable">Head</span> <span className="keyword">from</span> <span className="string">'next/head'</span>
            </div>
            <div className="codeLine">
              <span className="keyword">import</span> {'{ '}<span className="variable">useState</span> {'} '}<span className="keyword">from</span> <span className="string">'react'</span>
            </div>
            <div className="codeLine">
              <span className="keyword">import</span> <span className="variable">fetchNews</span> <span className="keyword">from</span> <span className="string">'../lib/fetch-news'</span>
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="keyword">export</span> <span className="keyword">async</span> <span className="keyword">function</span> <span className="function">getServerSideProps</span>() {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;<span className="keyword">try</span> {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">// ✅ Real-time data - fetches on every request</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">let</span> <span className="variable">globalCounter</span> = <span className="number">1</span>;
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="function">getNextId</span> = () <span className="operator">=&gt;</span> <span className="variable">globalCounter</span>++;
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">// Fetch all news categories in parallel</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">generalNews</span> = <span className="keyword">await</span> <span className="function">fetchNews</span>(<span className="string">'general'</span>);
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">businessNews</span> = <span className="keyword">await</span> <span className="function">fetchNews</span>(<span className="string">'business'</span>);
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">techNews</span> = <span className="keyword">await</span> <span className="function">fetchNews</span>(<span className="string">'technology'</span>);
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">sportsNews</span> = <span className="keyword">await</span> <span className="function">fetchNews</span>(<span className="string">'sports'</span>);
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">allNews</span> = [
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...<span className="variable">generalNews</span>.<span className="property">news</span>, ...<span className="variable">businessNews</span>.<span className="property">news</span>, ...<span className="variable">techNews</span>.<span className="property">news</span>, ...<span className="variable">sportsNews</span>.<span className="property">news</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;];
            </div>
            <div className="codeLine"></div>

            {news && news.length > 0 ? (
              news.map((item, index) => (
                <div key={item.id || index}>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">/* [{item.category}] {item.source} */</span>
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">article</span> = {'{'}
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">headline</span>: <span className="string">"{item.title.replace(/"/g, '\\"')}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">published_at</span>: <span className="string">"{item.time}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">source</span>: <span className="string">"{item.source}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">category</span>: <span className="string">"{item.category}"</span>,
                  </div>
                  <div
                    className="codeLine clickable"
                    onClick={() => toggleNews(item.id)}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">read_full</span>: <span className="string clickableText">"{expandedNews === item.id ? 'Click to collapse ▲' : 'Click to expand ▼'}"</span>,
                  </div>

                  {expandedNews === item.id && (
                    <>
                      <div className="codeLine">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">// Full Story</span>
                      </div>
                      <div className="codeLine">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">description</span>: <span className="string">"{item.description.replace(/"/g, '\\"')}"</span>,
                      </div>
                      <div className="codeLine">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">link</span>: <a href={item.link} target="_blank" rel="noopener noreferrer" className="link">"Read full article →"</a>,
                      </div>
                    </>
                  )}

                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;{'}'};
                  </div>
                  <div className="codeLine"></div>
                </div>
              ))
            ) : (
              <div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">/* No news available */</span>
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">error</span> = {'{'}
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">message</span>: <span className="string">"Unable to fetch news"</span>,
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;{'}'};
                </div>
                <div className="codeLine"></div>
              </div>
            )}

            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> {'{'} <span className="property">props</span>: {'{'} <span className="property">news</span>: <span className="variable">allNews</span> {'}'} {'}'};
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;{'}'} <span className="keyword">catch</span> (<span className="variable">error</span>) {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">console</span>.<span className="function">error</span>(<span className="string">'Error:'</span>, <span className="variable">error</span>);
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;{'}'}
            </div>
            <div className="codeLine">
              {'}'}
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="comment">/* 📰 Last updated: {new Date(timestamp).toLocaleString('en-IN')} */</span>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area - STOCKS TAB (fetch.js) */}
      {activeTab === 'fetch.js' && (
        <div className="editor" style={{ bottom: showTerminal ? `${terminalHeight + 22}px` : '22px' }}>
          <div className="lineNumbers">
            {Array.from({ length: stocksLineCount }, (_, i) => (
              <div key={i} className="lineNumber">{i + 1}</div>
            ))}
          </div>

          <div className="codeContent">
            <div className="codeLine">
              <span className="keyword">import</span> <span className="variable">Head</span> <span className="keyword">from</span> <span className="string">'next/head'</span>
            </div>
            <div className="codeLine">
              <span className="keyword">import</span> {'{ '}<span className="variable">useState</span> {'} '}<span className="keyword">from</span> <span className="string">'react'</span>
            </div>
            <div className="codeLine">
              <span className="keyword">import</span> <span className="variable">fetchStocks</span> <span className="keyword">from</span> <span className="string">'../lib/fetch-stocks'</span>
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="keyword">export</span> <span className="keyword">async</span> <span className="keyword">function</span> <span className="function">getServerSideProps</span>() {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;<span className="keyword">try</span> {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">// 📈 RUNTIME_METRICS :: LIVE_DATA</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">stockData</span> = <span className="keyword">await</span> <span className="function">fetchStocks</span>();
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">allStocks</span> = <span className="variable">stockData</span>?.<span className="property">stocks</span> || [];
            </div>
            <div className="codeLine"></div>

            {stocks && stocks.length > 0 ? (
              stocks.map((stock, index) => {
                const isPositive = parseFloat(stock.change) >= 0;
                const isIndex = stock.isIndex;

                return (
                  <div key={stock.symbol}>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">/* {isIndex ? '⭐ INDEX' : `[${index + 1}]`} - {stock.symbol} */</span>
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">stock_{stock.symbol.replace(/[^a-zA-Z0-9]/g, '_')}</span> = {'{'}
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">name</span>: <span className="string">"{stock.name}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">price</span>: <span className="string">"₹{stock.price}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">change</span>: <span className="string">"{isPositive ? '▲' : '▼'} ₹{Math.abs(stock.change)}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">change_percent</span>: <span className="string">"{isPositive ? '+' : ''}{stock.changePercent}%"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">high</span>: <span className="string">"₹{stock.high}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">low</span>: <span className="string">"₹{stock.low}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">volume</span>: <span className="string">"{stock.volume === 'Index' ? 'Index' : typeof stock.volume === 'number' ? stock.volume.toLocaleString('en-IN') : stock.volume}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;{'}'};
                    </div>
                    <div className="codeLine"></div>
                  </div>
                );
              })
            ) : (
              <div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="comment">/* No stock data available */</span>
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">const</span> <span className="variable">error</span> = {'{'}
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">message</span>: <span className="string">"Unable to fetch stock data"</span>,
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;{'}'};
                </div>
                <div className="codeLine"></div>
              </div>
            )}

            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> {'{'} <span className="property">props</span>: {'{'} <span className="property">stocks</span>: <span className="variable">allStocks</span> {'}'} {'}'};
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;{'}'} <span className="keyword">catch</span> (<span className="variable">error</span>) {'{'}
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">console</span>.<span className="function">error</span>(<span className="string">'Error:'</span>, <span className="variable">error</span>);
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;{'}'}
            </div>
            <div className="codeLine">
              {'}'}
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="comment">/* 📈 Last updated: {new Date(timestamp).toLocaleString('en-IN')} */</span>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area - CRICKET TAB (cricket.py) */}
      {activeTab === 'cricket.py' && (
        <div className="editor" style={{ bottom: showTerminal ? `${terminalHeight + 22}px` : '22px' }}>
          <div className="lineNumbers">
            {Array.from({ length: cricketLineCount }, (_, i) => (
              <div key={i} className="lineNumber">{i + 1}</div>
            ))}
          </div>

          <div className="codeContent">
            <div className="codeLine">
              <span className="comment"># 🏏 LIVE CRICKET & SPORTS TELEMETRY STREAM</span>
            </div>
            <div className="codeLine">
              <span className="keyword">import</span> <span className="variable">sys</span>, <span className="variable">time</span>, <span className="variable">json</span>
            </div>
            <div className="codeLine">
              <span className="keyword">from</span> <span className="variable">datetime</span> <span className="keyword">import</span> <span className="variable">datetime</span>
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="keyword">class</span> <span className="function">CricketTelemetryEngine</span>:
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">def</span> <span className="function">__init__</span>(<span className="variable">self</span>):
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">self</span>.<span className="property">feed_source</span> = <span className="string">"Cricbuzz Cricket Live Engine (RapidAPI)"</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">self</span>.<span className="property">live_poll_interval</span> = <span className="number">10</span>
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">self</span>.<span className="property">last_sync</span> = <span className="string">"{new Date(timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()} IST"</span>
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">def</span> <span className="function">get_live_matches</span>(<span className="variable">self</span>):
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> [
            </div>

            {cricket && cricket.length > 0 ? (
              cricket.map((match, idx) => (
                <div key={match.id || idx}>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="comment"># [{match.state || 'MATCH'}] {match.series} ({match.format || 'CRICKET'}) • {match.matchDate}</span>
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'{'}
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"match"</span>: <span className="string">"{match.matchTitle || match.title}{match.matchDesc ? ` (${match.matchDesc})` : ''}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"match_date"</span>: <span className="string">"{match.matchDate}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"score_1"</span>: <span className="string">"{match.score1 || match.team1 || ''}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"score_2"</span>: <span className="string">"{match.score2 || match.team2 || ''}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"status"</span>: <span className="string">"{match.status || 'Match in progress'}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"venue"</span>: <span className="string">"{match.venue || 'International Ground'}"</span>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">"cricbuzz_url"</span>: <a href={match.link} target="_blank" rel="noopener noreferrer" className="link">"cricbuzz.com/scorecard →"</a>,
                  </div>
                  <div className="codeLine">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'},'}
                  </div>
                  <div className="codeLine"></div>
                </div>
              ))
            ) : (
              <div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="comment"># No matches currently live</span>
                </div>
                <div className="codeLine">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'{'}<span className="property">"status"</span>: <span className="string">"NO_ACTIVE_MATCHES"</span>{'}'},
                </div>
              </div>
            )}

            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;]
            </div>
            <div className="codeLine"></div>
            <div className="codeLine">
              <span className="keyword">if</span> <span className="variable">__name__</span> == <span className="string">"__main__"</span>:
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">engine</span> = <span className="function">CricketTelemetryEngine</span>()
            </div>
            <div className="codeLine">
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="variable">print</span>(<span className="string">f"Cricket stream ready: &#123;len(engine.get_live_matches())&#125; matches active"</span>)
            </div>
          </div>
        </div>
      )}



      {/* VS Code Integrated Terminal Panel matching Screenshot 1 */}
      {showTerminal && (
        <div className="terminalPanel" style={{ height: `${terminalHeight}px` }}>
          <div className="terminalHeader">
            <div className="terminalTabs">
              <div className="termTab">Problems</div>
              <div className="termTab">Output</div>
              <div className="termTab">Debug Console</div>
              <div className="termTab active">Terminal</div>
              <div className="termTab">Ports</div>
            </div>
            <div className="terminalActions">
              {isStreamingLogs && (
                <span
                  className="streamingBadge"
                  onClick={() => handleTerminalSubmit({ preventDefault: () => { } })}
                  title="Click or press Ctrl+C to stop streaming"
                >
                  ● LIVE (Ctrl+C to stop)
                </span>
              )}
              <div className="psDropdown">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v6h10V5H3zm2 1.5l2 1.5-2 1.5-.7-.7 1-0.8-1-0.8.7-.7zM9 9h3v1H9V9z" />
                </svg>
                <span>powershell</span>
                <span className="psPlus">+</span>
                <span className="psChevron">⌵</span>
              </div>
              <span className="termAction" title="Split Terminal">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2h12v12H2V2zm1 1v10h4V3H3zm6 0v10h4V3H9z" />
                </svg>
              </span>
              <span
                className="termAction"
                title="Kill Terminal"
                onClick={() => setTerminalLines([])}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                </svg>
              </span>
              <span className="termAction dots" title="More Actions">•••</span>
              <span
                className="termAction"
                title={isTerminalMaximized ? "Restore Size" : "Maximize Panel"}
                onClick={toggleTerminalSize}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  {isTerminalMaximized ? (
                    <path d="M3.5 5.5L8 10l4.5-4.5-.7-.7L8 8.6 4.2 4.8l-.7.7z" />
                  ) : (
                    <path d="M3.5 10.5L8 6l4.5 4.5-.7.7L8 7.4l-3.8 3.8-.7-.7z" />
                  )}
                </svg>
              </span>
              <span
                className="termAction close"
                title="Close Panel (Ctrl + ~)"
                onClick={() => setShowTerminal(false)}
              >
                ✕
              </span>
            </div>
          </div>

          <div
            className="terminalBody"
            onClick={() => terminalInputRef.current?.focus()}
          >
            <div className="terminalLogs">
              {terminalLines.map((line, idx) => (
                <div key={idx} className={`termLine ${line.type || ''}`}>
                  {line.isPrompt ? (
                    <div className="psPromptLine">
                      <span className="psCircle">○</span>
                      <span className="psPromptText">PS {TERMINAL_LOCATION}&gt;&nbsp;</span>
                      <span className="psCmdText">{line.text}</span>
                    </div>
                  ) : (
                    line.text
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form className="termInputRow" onSubmit={handleTerminalSubmit}>
              <span className="psCircle">○</span>
              <span className="psPromptText">PS {TERMINAL_LOCATION}&gt;&nbsp;</span>
              <input
                ref={terminalInputRef}
                type="text"
                className="termInput"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder=""
                spellCheck="false"
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      )}

      {/* VS Code Status Bar matching user's screenshot (without Antigravity - Settings) */}
      <div className="statusBar">
        <div className="statusLeft">
          <div className="statusRemote" title="Open a Remote Window">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.5 11.5L1.5 8.5 4.5 5.5l.7.7-2.3 2.3 2.3 2.3-.7.7zm7 0l3-3-3-3-.7.7 2.3 2.3-2.3 2.3.7.7zm-2-8.5l-3 10h1l3-10h-1z" />
            </svg>
          </div>
          <div className="statusItem gitItem" title="main* - Git Repository">
            <span>main*</span>
            <span className="syncIcon" title="Synchronize Changes">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
              </svg>
            </span>
          </div>
          <div className="statusItem" title="0 Errors">
            <span className="statusIcon">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.2a5.8 5.8 0 1 1 0 11.6A5.8 5.8 0 0 1 8 2.2zm-2.8 3L4.4 6 7 8.6 4.4 11.2l.8.8L7.8 9.4l2.6 2.6.8-.8L8.6 8.6 11.2 6l-.8-.8-2.6 2.6-2.6-2.6z" />
              </svg>
            </span>
            <span>0</span>
          </div>
          <div className="statusItem" title="0 Warnings">
            <span className="statusIcon">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.56 1.83a.5.5 0 0 1 .88 0l6.5 11.5A.5.5 0 0 1 14.5 14h-13a.5.5 0 0 1-.44-.67l6.5-11.5zm.44 2.67v5h1v-5h-1zm0 6v1.2h1V10.5h-1z" />
              </svg>
            </span>
            <span>0</span>
          </div>
        </div>

        <div className="statusRight">
          <div className="statusItem">Ln 1, Col 1</div>
          <div className="statusItem">Spaces: {activeTab === 'cricket.py' ? 4 : 2}</div>
          <div className="statusItem">UTF-8</div>
          <div className="statusItem">CRLF</div>
          <div className="statusItem langItem">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 2c-.6 0-1 .4-1 1v3c0 .6-.4 1-1 1-.6 0-1 .4-1 1s.4 1 1 1c.6 0 1 .4 1 1v3c0 .6.4 1 1 1h1v-1H5v-3c0-1.1-.9-2-2-2 1.1 0 2-.9 2-2V3h1V2H5zm6 0c.6 0 1 .4 1 1v3c0 .6.4 1 1 1 .6 0 1 .4 1 1s-.4 1-1 1c-.6 0-1 .4-1 1v3c0 .6-.4 1-1 1h-1v-1h1v-3c0-1.1.9-2 2-2-1.1 0-2-.9-2-2V3h-1V2h1z" />
            </svg>
            <span>{activeTab === 'cricket.py' ? 'Python' : 'JavaScript'}</span>
          </div>
          <div className="statusItem liveServerItem" title="Live Server">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              <path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4m-11.3-11.3a10 10 0 0 0 0 14.2m14.2-14.2a10 10 0 0 1 0 14.2" />
            </svg>
            <span>Go Live</span>
          </div>
          <div className="statusItem bellItem" title="Do Not Disturb">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="2" y1="2" x2="22" y2="22" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
          background: #1e1e1e;
          color: #d4d4d4;
        }

        .container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
        }

        /* Top Bar */
        .topBar {
          height: 35px;
          background: #323233;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #2d2d30;
          user-select: none;
        }

        .menuBar {
          display: flex;
          gap: 8px;
          padding: 0 10px;
          flex: 1;
        }

        .menuItem {
          padding: 2px 8px;
          font-size: 13px;
          color: #cccccc;
          cursor: pointer;
          border-radius: 3px;
          transition: background 0.1s;
        }

        .menuItem:hover, .menuItem.activeMenu {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .titleBar {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #cccccc;
        }

        .fileName {
          font-weight: 400;
        }

        .windowControls {
          display: flex;
          gap: 0;
        }

        .control {
          width: 45px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .control:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .control.close:hover {
          background: #e81123;
          color: white;
        }

        /* Activity Bar - matching Screenshot 2 */
        .activityBar {
          position: fixed;
          left: 0;
          top: 35px;
          width: 48px;
          height: calc(100vh - 57px);
          background: #181818;
          border-right: 1px solid #252526;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px 0;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .activityBar::-webkit-scrollbar {
          display: none;
        }

        .activityIcon {
          width: 42px;
          height: 40px;
          margin: 1px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #858585;
          cursor: pointer;
          transition: color 0.12s ease, background 0.12s ease;
          position: relative;
          border-radius: 4px;
          user-select: none;
        }

        .activityIcon:hover {
          color: #cccccc;
        }

        .activityIcon.active {
          color: #ffffff;
        }

        /* Remote Monitor Container (6th icon) rounded container matching Screenshot 2 */
        .activityIcon.activeContainer {
          background: #282828;
          color: #ffffff;
          border-radius: 6px;
          width: 38px;
          height: 38px;
          margin: 2px 0;
        }

        .activityIcon.activeContainer:hover {
          background: #303030;
          color: #ffffff;
        }

        .activityIcon.activeTerm {
          background: #333333;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
        }

        /* Blue circular Sync Badge on Extensions, Remote Monitor, Python */
        .syncBadge {
          position: absolute;
          bottom: 3px;
          right: 3px;
          width: 14px;
          height: 14px;
          background: #0078d4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          border: 1.5px solid #181818;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }

        .activeContainer .syncBadge {
          border-color: #282828;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 48px;
          top: 35px;
          width: 250px;
          height: calc(100vh - 57px);
          background: #252526;
          border-right: 1px solid #2d2d30;
          overflow-y: auto;
          z-index: 99;
        }

        .sidebarHeader {
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-size: 11px;
          color: #cccccc;
          font-weight: 600;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #2d2d30;
        }

        .sidebarActions {
          cursor: pointer;
          padding: 4px;
        }

        .fileTree {
          padding: 8px 0;
        }

        .folder, .file {
          display: flex;
          align-items: center;
          padding: 4px 12px;
          font-size: 13px;
          cursor: pointer;
          user-select: none;
          transition: background 0.1s;
        }

        .folder:hover, .file:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .file.active {
          background: #37373d;
        }

        .folderIcon {
          width: 16px;
          margin-right: 6px;
          font-size: 10px;
          color: #cccccc;
        }

        .folderName {
          color: #cccccc;
          font-weight: 500;
        }

        .fileTreeContent {
          padding-left: 0;
        }

        .fileTreeContent.nested {
          padding-left: 16px;
        }

        .fileIcon {
          width: 16px;
          margin-right: 8px;
          font-size: 10px;
          text-align: center;
          font-weight: bold;
        }

        .fileName {
          color: #cccccc;
        }

        /* Tab Bar */
        .tabBar {
          position: fixed;
          left: 298px;
          top: 35px;
          right: 0;
          height: 35px;
          background: #2d2d2d;
          border-bottom: 1px solid #2d2d30;
          display: flex;
          z-index: 98;
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          font-size: 13px;
          background: #2d2d2d;
          border-right: 1px solid #2d2d30;
          cursor: pointer;
          user-select: none;
          transition: background 0.1s;
          white-space: nowrap;
        }

        .tab.active {
          background: #1e1e1e;
          border-top: 1px solid #007acc;
        }

        .tab:hover {
          background: #2a2a2a;
        }

        .tabIcon {
          font-size: 11px;
          font-weight: bold;
        }

        .tabName {
          color: #cccccc;
        }

        .tabClose {
          color: #858585;
          font-size: 16px;
          padding: 0 4px;
          border-radius: 3px;
          transition: all 0.1s;
        }

        .tabClose:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
        }

        /* Editor */
        .editor {
          position: fixed;
          left: 298px;
          top: 70px;
          right: 0;
          background: #1e1e1e;
          display: flex;
          overflow-y: auto;
          transition: bottom 0.15s ease-out;
        }

        .lineNumbers {
          width: 50px;
          background: #1e1e1e;
          padding: 8px 0;
          text-align: right;
          user-select: none;
          flex-shrink: 0;
        }

        .lineNumber {
          height: 19px;
          padding-right: 12px;
          font-size: 13px;
          line-height: 19px;
          color: #858585;
          font-family: 'Fira Code', monospace;
        }

        .codeContent {
          flex: 1;
          padding: 8px 16px;
          font-size: 14px;
          line-height: 19px;
          font-family: 'Fira Code', monospace;
        }

        .codeLine {
          min-height: 19px;
          line-height: 19px;
          white-space: pre-wrap;
          word-break: break-word;
          padding-left: 30px;
          text-indent: -30px;
        }

        .codeLine.clickable {
          cursor: pointer;
        }

        .codeLine.clickable:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Syntax Highlighting */
        .keyword {
          color: #569cd6;
          font-weight: 500;
        }

        .string {
          color: #ce9178;
        }

        .number {
          color: #b5cea8;
        }

        .comment {
          color: #6a9955;
          font-style: italic;
        }

        .function {
          color: #dcdcaa;
        }

        .variable {
          color: #9cdcfe;
        }

        .property {
          color: #9cdcfe;
        }

        .operator {
          color: #d4d4d4;
        }

        .clickableText {
          color: #ce9178;
          text-decoration: underline;
          cursor: pointer;
        }

        .clickableText:hover {
          color: #e9c08a;
        }

        .link {
          color: #ce9178;
          text-decoration: underline;
          cursor: pointer;
        }

        .link:hover {
          color: #e9c08a;
        }

        /* Terminal Panel - matching Screenshot 1 */
        .terminalPanel {
          position: fixed;
          left: 298px;
          right: 0;
          bottom: 22px;
          background: #181818;
          border-top: 1px solid #2b2b2b;
          display: flex;
          flex-direction: column;
          z-index: 97;
          box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.5);
          font-family: 'Consolas', 'Cascadia Code', 'Fira Code', monospace;
        }

        .terminalHeader {
          height: 35px;
          background: #181818;
          border-bottom: 1px solid #252526;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px 0 14px;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .terminalTabs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          letter-spacing: 0.1px;
        }

        .termTab {
          cursor: pointer;
          padding: 3px 8px;
          border-radius: 4px;
          color: #8c8c8c;
          transition: color 0.12s ease, background 0.12s ease;
          font-weight: 400;
          text-transform: none;
        }

        .termTab:hover {
          color: #cccccc;
        }

        /* Active tab rounded pill background matching Screenshot 1 */
        .termTab.active {
          color: #ffffff;
          background: #2b2d30;
          font-weight: 500;
          border-bottom: none;
        }

        .terminalActions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .streamingBadge {
          font-size: 11px;
          font-family: 'Consolas', monospace;
          color: #4ec9b0;
          background: rgba(78, 201, 176, 0.12);
          border: 1px solid rgba(78, 201, 176, 0.4);
          padding: 2px 7px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 4px;
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        /* Powershell dropdown pill matching Screenshot 1 */
        .psDropdown {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          color: #cccccc;
          font-size: 11.5px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .psDropdown:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .psPlus {
          font-size: 13px;
          line-height: 1;
          margin-left: 2px;
          opacity: 0.85;
        }

        .psChevron {
          font-size: 9px;
          line-height: 1;
          opacity: 0.7;
        }

        .termAction {
          color: #9d9d9d;
          cursor: pointer;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .termAction:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .termAction.dots {
          font-size: 11px;
          letter-spacing: 0.5px;
          width: auto;
          padding: 0 4px;
        }

        .termAction.close:hover {
          background: #e81123;
          color: #ffffff;
        }

        /* Terminal Body matching Screenshot 1 */
        .terminalBody {
          flex: 1;
          padding: 10px 14px;
          overflow-y: auto;
          background: #181818;
          font-family: 'Consolas', 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          color: #cccccc;
          cursor: text;
        }

        .terminalBody::-webkit-scrollbar {
          width: 10px;
        }

        .terminalBody::-webkit-scrollbar-track {
          background: transparent;
        }

        .terminalBody::-webkit-scrollbar-thumb {
          background: rgba(121, 121, 121, 0.35);
        }

        .terminalBody::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 100, 0.6);
        }

        .terminalLogs {
          flex: 0 0 auto;
        }

        .termLine {
          white-space: pre-wrap;
          word-break: break-all;
          margin-bottom: 2px;
          color: #cccccc;
        }

        .termLine.system {
          color: #858585;
        }

        .termLine.info {
          color: #4ec9b0;
        }

        .termLine.log {
          color: #d4d4d4;
          font-size: 12px;
        }

        .termLine.cmd {
          color: #ffffff;
          font-weight: 500;
        }

        .termLine.error {
          color: #f48771;
        }

        /* PowerShell Prompt Line & Row */
        .psPromptLine {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
        }

        .psCircle {
          color: #858585;
          margin-right: 7px;
          font-size: 12px;
          line-height: 1;
          user-select: none;
          display: inline-block;
        }

        .psPromptText {
          color: #cccccc;
          font-weight: 400;
          white-space: nowrap;
          user-select: none;
        }

        .psCmdText {
          color: #ffffff;
          margin-left: 2px;
        }

        .termInputRow {
          display: flex;
          align-items: center;
          width: 100%;
          line-height: 1.5;
          margin-top: 2px;
        }

        .termInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: 'Consolas', 'Cascadia Code', 'Fira Code', monospace;
          font-size: 13px;
          padding: 0;
          margin: 0;
          caret-color: #ffffff;
        }

        /* VS Code Status Bar matching user's exact screenshot */
        .statusBar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 22px;
          background: #181818;
          border-top: 1px solid #2b2b2b;
          color: #cccccc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11.5px;
          user-select: none;
          z-index: 101;
        }

        .statusLeft, .statusRight {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .statusRemote {
          width: 48px;
          height: 22px;
          background: #007acc;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .statusRemote:hover {
          background: #1f8ad2;
        }

        .statusItem {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 100%;
          padding: 0 6px;
          cursor: pointer;
          color: #cccccc;
          font-size: 11.5px;
          transition: background 0.1s ease, color 0.1s ease;
        }

        .statusItem:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .gitItem {
          gap: 5px;
        }

        .syncIcon {
          display: inline-flex;
          align-items: center;
          color: #cccccc;
          margin-left: 2px;
        }

        .statusIcon {
          display: inline-flex;
          align-items: center;
        }

        .langItem {
          gap: 5px;
        }

        .liveServerItem {
          gap: 5px;
        }

        .bellItem {
          padding: 0 8px;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        ::-webkit-scrollbar-thumb {
          background: #424242;
          border: 2px solid #1e1e1e;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4e4e4e;
        }

        ::-webkit-scrollbar-corner {
          background: #1e1e1e;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }

          .tabBar, .editor, .terminalPanel {
            left: 248px;
          }
        }
      `}</style>
    </div>
  );
}