import Head from 'next/head'
import { useState } from 'react'
import fetchNews from '../lib/fetch-news'
import fetchStocks from '../lib/fetch-stocks'

export async function getServerSideProps() {
  try {
    console.log('🔄 Starting data fetch...');
    
    let globalCounter = 1;
    const getNextId = () => globalCounter++;

    const [
      generalNews,
      businessNews,
      techNews,
      sportsNews,
      stockData
    ] = await Promise.all([
      fetchNews('general'),
      fetchNews('business'),
      fetchNews('technology'),
      fetchNews('sports'),
      fetchStocks(),
    ]);

    console.log('✅ Fetch complete:', {
      general: generalNews?.news?.length || 0,
      business: businessNews?.news?.length || 0,
      tech: techNews?.news?.length || 0,
      sports: sportsNews?.news?.length || 0,
    });

  
    const allNews = [
      ...(generalNews?.news || []),
      ...(businessNews?.news || []),
      ...(techNews?.news || []),
      ...(sportsNews?.news || []),
    ].map((item) => ({
      ...item,
      id: getNextId(), 
    }));

    console.log(`✅ Total news items prepared: ${allNews.length}`);

    const shuffledNews = allNews
      .sort(() => Math.random() - 0.5) 
      .slice(0, 100); 

    return {
      props: {
        news: shuffledNews,
        stocks: stockData?.stocks || [],
        timestamp: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ Server Side Props Error:', error);

    return {
      props: {
        news: [],
        stocks: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
}


export default function Home({ news, stocks, timestamp }) {
  const [expandedNews, setExpandedNews] = useState(null);
  const [activeTab, setActiveTab] = useState('index.js');

  const toggleNews = (id) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  // NEWS TAB - Line count calculation
  const newsBaseLines = 19;
  const newsLinesPerItem = 9;
  const newsExpandedExtraLines = 3;
  const newsEndLines = 15;
  
  const expandedCount = expandedNews ? 1 : 0;
  const newsTotalLines = newsBaseLines + (news.length * newsLinesPerItem) + (expandedCount * newsExpandedExtraLines) + newsEndLines;
  const newsLineCount = Math.max(newsTotalLines, 30);

  // STOCKS TAB - Line count calculation  
  const stocksBaseLines = 11;
  const stocksLinesPerItem = 11;
  const stocksEndLines = 8;
  
  const stocksTotalLines = stocksBaseLines + (stocks.length * stocksLinesPerItem) + stocksEndLines;
  const stocksLineCount = Math.max(stocksTotalLines, 30);

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
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=UA-205481997-2`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-205481997-2', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
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
          <div className="menuItem">Terminal</div>
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

      {/* Activity Bar */}
      <div className="activityBar">
        <div className="activityIcon active">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3h5l1 1h8v9H1V3z"/>
          </svg>
        </div>
        <div className="activityIcon">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 7.5L14 11l-3.5 3.5V13h-1v1.5L6 11l3.5-3.5V9h1V7.5zm-5 0V9h-1v1.5L1 7l3.5-3.5V5h1v2.5z"/>
          </svg>
        </div>
        <div className="activityIcon">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
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
            <span className="folderName">NEWS-CODE</span>
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
                onClick={() => setActiveTab('index.js')}
              >
                <span className="fileIcon">JS</span>
                <span className="fileName">index.js</span>
              </div>
              <div 
                className={`file ${activeTab === 'fetch.js' ? 'active' : ''}`}
                onClick={() => setActiveTab('fetch.js')}
              >
                <span className="fileIcon">JS</span>
                <span className="fileName">fetch.js</span>
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
        <div 
          className={`tab ${activeTab === 'index.js' ? 'active' : ''}`}
          onClick={() => setActiveTab('index.js')}
        >
          <span className="tabIcon">JS</span>
          <span className="tabName">index.js</span>
          <span className="tabClose">×</span>
        </div>
        <div 
          className={`tab ${activeTab === 'fetch.js' ? 'active' : ''}`}
          onClick={() => setActiveTab('fetch.js')}
        >
          <span className="tabIcon">JS</span>
          <span className="tabName">fetch.js</span>
          <span className="tabClose">×</span>
        </div>
      </div>

      {/* Editor Area - NEWS TAB */}
      {activeTab === 'index.js' && (
        <div className="editor">
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
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">headline</span>: <span className="string">"{item.title}"</span>,
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
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">description</span>: <span className="string">"{item.description}"</span>,
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

      {/* Editor Area - STOCKS TAB */}
      {activeTab === 'fetch.js' && (
        <div className="editor">
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
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">change</span>: <span className={isPositive ? "string" : "string"}>"{isPositive ? '▲' : '▼'} ₹{Math.abs(stock.change)}"</span>,
                    </div>
                    <div className="codeLine">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="property">change_percent</span>: <span className={isPositive ? "string" : "string"}>"{isPositive ? '+' : ''}{stock.changePercent}%"</span>,
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

      {/* Status Bar */}
      <div className="statusBar">
        <div className="statusLeft">
          <div className="statusItem">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13A6 6 0 118 2a6 6 0 010 12z"/>
            </svg>
            <span>main</span>
          </div>
          <div className="statusItem">
            <span>×</span>
            <span>0</span>
          </div>
          <div className="statusItem">
            <span>△</span>
            <span>0</span>
          </div>
        </div>
        <div className="statusRight">
          <div className="statusItem">Ln {activeTab === 'index.js' ? newsLineCount : stocksLineCount}, Col 1</div>
          <div className="statusItem">Spaces: 2</div>
          <div className="statusItem">UTF-8</div>
          <div className="statusItem">JavaScript</div>
          <div className="statusItem">✓ Prettier</div>
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
          padding: 0 8px;
          font-size: 13px;
          color: #cccccc;
          cursor: pointer;
          transition: background 0.1s;
        }

        .menuItem:hover {
          background: rgba(255, 255, 255, 0.1);
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

        /* Activity Bar */
        .activityBar {
          position: fixed;
          left: 0;
          top: 35px;
          width: 48px;
          height: calc(100vh - 57px);
          background: #333333;
          border-right: 1px solid #2d2d30;
          display: flex;
          flex-direction: column;
          padding: 8px 0;
          z-index: 100;
        }

        .activityIcon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #858585;
          cursor: pointer;
          transition: color 0.1s;
          position: relative;
        }

        .activityIcon:hover {
          color: #ffffff;
        }

        .activityIcon.active {
          color: #ffffff;
        }

        .activityIcon.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 2px;
          height: 32px;
          background: #007acc;
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
          color: #f1c40f;
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
          transition: background 0.1s;
        }

        .tab.active {
          background: #1e1e1e;
        }

        .tab:hover {
          background: #2a2a2a;
        }

        .tabIcon {
          font-size: 11px;
          color: #f1c40f;
          font-weight: bold;
        }

        .tabName {
          color: #cccccc;
        }

        .tabClose {
          color: #858585;
          font-size: 18px;
          padding: 0 4px;
          transition: color 0.1s;
        }

        .tabClose:hover {
          color: #ffffff;
        }

        /* Editor */
        .editor {
          position: fixed;
          left: 298px;
          top: 70px;
          right: 0;
          bottom: 22px;
          background: #1e1e1e;
          display: flex;
          overflow-y: auto;
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

        /* Status Bar */
        .statusBar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 22px;
          background: #252528;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 8px;
          font-size: 12px;
          z-index: 101;
        }

        .statusLeft, .statusRight {
          display: flex;
          gap: 12px;
        }

        .statusItem {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 0 8px;
        }

        .statusItem:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }

        ::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        ::-webkit-scrollbar-thumb {
          background: #424242;
          border: 3px solid #1e1e1e;
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
          
          .tabBar, .editor {
            left: 248px;
          }
        }
      `}</style>
    </div>
  )
}