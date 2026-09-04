import {
  A2UIRenderer,
  type TimelineItem,
  themeStyleSheet,
} from '@googlemaps/a2ui/lit';
import MarkdownIt from 'markdown-it';
import {useEffect, useRef, useState} from 'react';
import './App.css';
import './gsi_map';
import {RobustA2UIClient} from './a2ui_client';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

// Configure markdown-it to open all links in a new tab
const defaultLinkRender =
  md.renderer.rules.link_open ||
  function (tokens: any[], idx: number, options: any, _env: any, self: any) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens: any[], idx: number, options: any, env: any, self: any) {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkRender(tokens, idx, options, env, self);
};

/**
 * Custom Dark Theme overrides for A2UI Lit Custom Elements (Shadow DOM)
 */
const customDarkThemeStyleSheet = new CSSStyleSheet();
customDarkThemeStyleSheet.replaceSync(`
:root {
  --a2ui-column-gap: 8px;

  /* Card Dark Theme Overrides */
  --a2ui-card-background: #18181b;
  --a2ui-card-border: 1px solid #2e2f33;
  --a2ui-card-border-radius: 12px;
  --a2ui-card-padding: 10px 14px;
  --a2ui-card-box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

  /* Link & Text Overrides */
  --a2ui-text-color: #e4e4e7;
  --a2ui-text-font-size: 13px;
  --a2ui-text-line-height: 1.45;
  --a2ui-text-a-color: #8ab4f8;
  --a2ui-text-a-font-weight: 500;
  --a2ui-text-a-text-decoration: none;

  /* Material Tokens */
  --md-sys-color-surface: #18181b;
  --md-sys-color-on-surface: #f4f4f5;
  --md-sys-color-on-surface-variant: #a1a1aa;
  --md-sys-color-outline: #2e2f33;
  --md-sys-color-primary: #8ab4f8;
}
`);

/**
 * Determines the benchmark geospatial analysis methods from docs/get-started.md
 * based on the user's prompt.
 */
function getAnalysisMethods(prompt: string): string[] {
  const methods: string[] = [];

  if (/矩形|bounding|lat.*lon|北緯|東経|〜.*〜|エリア|spanning|coordinate/i.test(prompt)) {
    methods.push('Search by Location Rectangle');
  } else if (/半径|km|以内|distance|radius/i.test(prompt)) {
    methods.push('Search by Location Point Distance');
  } else if (/庁舎|学校|避難|施設|属性|attribute|public/i.test(prompt)) {
    methods.push('Search by Attribute');
  } else if (/カタログ|カテゴリー|データセット|catalog|dataset/i.test(prompt)) {
    methods.push('Get Data Catalog');
    if (/サマリー|概要|summary/i.test(prompt)) {
      methods.push('Get Data Catalog Summary');
    }
  } else if (/zip|ダウンロード|url|download/i.test(prompt)) {
    methods.push('Get File Download URLs');
    if (/zip/i.test(prompt)) methods.push('Get Zipfile Download URL');
  } else if (/サムネイル|thumbnail|画像/i.test(prompt)) {
    methods.push('Get Thumbnail URLs');
  } else if (/全件|all data/i.test(prompt)) {
    methods.push('Get All Data');
  } else if (/件数|count|登録件数/i.test(prompt)) {
    methods.push('Get Count Data');
  } else if (/サジェスト|候補|suggest/i.test(prompt)) {
    methods.push('Get Suggest');
  } else if (/メッシュ|mesh|5339/i.test(prompt)) {
    methods.push('Get Mesh');
  } else if (/正規化|normalize|コード/i.test(prompt)) {
    methods.push('Normalize Codes');
  } else if (/都道府県|prefecture/i.test(prompt)) {
    methods.push('Get Prefecture Data');
  } else if (/市区町村|municipality|city/i.test(prompt)) {
    methods.push('Get Municipality Data');
  } else if (/浸水|洪水|ハザード|避難所|周辺|詳しく|explore|integrated/i.test(prompt)) {
    methods.push('Integrated Autonomous Exploration');
  } else {
    methods.push('Search');
  }

  // Secondary data retrieval / summary methods
  if (!methods.includes('Get Data') && !methods.includes('Get Data Catalog')) {
    methods.push('Get Data');
  }
  if (/サマリー|概要|summary/i.test(prompt) && !methods.includes('Get Data Catalog Summary')) {
    methods.push('Get Data Summary');
  }

  return methods;
}

/**
 * Main Application component that demonstrates A2UI integration in a React environment.
 * It manages a chat interface with a timeline of text messages and A2UI interactive surfaces.
 */
function App() {
  // --- UI State ---
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [input, setInput] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeMethods, setActiveMethods] = useState<string[]>([]);

  // RobustA2UIClient handles communication with the A2A agent
  const serverUrl =
    import.meta.env.VITE_A2A_SERVER_URL || 'http://localhost:8080/a2a/app';
  const clientRef = useRef(new RobustA2UIClient(serverUrl));
  // A2UIRenderer manages the local state of A2UI surfaces and message processing
  const rendererRef = useRef(new A2UIRenderer());

  // Handle scrolling properly.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };
  useEffect(() => {
    scrollToBottom();
  }, [timeline, activeMethods]);

  useEffect(() => {
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets.filter(
        (s) => s !== themeStyleSheet && s !== customDarkThemeStyleSheet,
      ),
      themeStyleSheet,
      customDarkThemeStyleSheet,
    ];
  }, []);

  // Intercept all link clicks across light DOM and Shadow DOM (A2UI cards) to always open in a new tab/window
  useEffect(() => {
    const handleGlobalLinkClick = (e: MouseEvent) => {
      const path = e.composedPath();
      for (const el of path) {
        if (el instanceof HTMLAnchorElement && el.href) {
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
          break;
        }
      }
    };
    document.addEventListener('click', handleGlobalLinkClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalLinkClick, true);
    };
  }, []);

  /**
   * Handles sending a text message from the user.
   * Updates the UI timeline and processes the agent's response.
   */
  const handleSend = async () => {
    if (!input.trim() || isRequesting) return;

    const messageText = input.trim();
    setInput('');
    setIsRequesting(true);

    const targetMethods = getAnalysisMethods(messageText);
    setActiveMethods([targetMethods[0]]);

    // Progressive method display animation
    const intervalTimers: ReturnType<typeof setTimeout>[] = [];
    targetMethods.slice(1).forEach((method, idx) => {
      const timer = setTimeout(() => {
        setActiveMethods((prev) => [...prev, method]);
      }, (idx + 1) * 700);
      intervalTimers.push(timer);
    });

    // 1. Add the user's message to the local renderer's timeline
    rendererRef.current.addUserMessage(messageText);
    setTimeline([...rendererRef.current.timeline]);

    try {
      // 2. Send the message to the A2A agent via RobustA2UIClient
      const response = await clientRef.current.send(messageText);

      // 3. Process the response (which contains parsed text and A2UI surface data)
      rendererRef.current.processResponse(response);

      // 4. Synchronize the React state with the renderer's updated timeline
      setTimeline([...rendererRef.current.timeline]);
    } catch (error) {
      console.error('Failed to send message:', error);
      rendererRef.current.processResponse([
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
      setTimeline([...rendererRef.current.timeline]);
    } finally {
      intervalTimers.forEach(clearTimeout);
      setIsRequesting(false);
      setActiveMethods([]);
    }
  };

  const handleNewChat = () => {
    rendererRef.current = new A2UIRenderer();
    clientRef.current = new RobustA2UIClient(serverUrl);
    setTimeline([]);
    setInput('');
    setActiveMethods([]);
  };

  return (
    <div className="app-container">
      {/* --- Main Content Panel (PlateauView 3D) --- */}
      <main className="main-panel">
        {!isChatOpen && (
          <button
            className="toggle-chat-btn"
            onClick={() => setIsChatOpen(true)}>
            Ask PLATEAU
          </button>
        )}
        <iframe
          className="plateauview-iframe"
          src="https://plateauview.mlit.go.jp/"
          title="PLATEAU VIEW 3D"
          allow="geolocation; camera; microphone"
        />
      </main>

      {/* --- Side Chat Panel --- */}
      <aside className={`chat-panel ${isChatOpen ? 'open' : 'closed'}`}>
        <div className="chat-header">
          <h2>Ask PLATEAU</h2>
          <div className="chat-header-actions">
            <button
              className="new-chat-btn"
              title="チャットを新規作成"
              onClick={handleNewChat}
              disabled={isRequesting}>
              + New Chat
            </button>
            <button
              className="close-chat-btn"
              onClick={() => setIsChatOpen(false)}>
              ×
            </button>
          </div>
        </div>

        {/* --- Message Timeline --- */}
        <div className="chat-messages">
          <maui-providers>
            {timeline.length === 0 && (
              <p style={{opacity: 0.5, textAlign: 'center', marginTop: '50px'}}>
                No messages yet.
              </p>
            )}
            {timeline.map((item, idx) => {
              if (item.type === 'user') {
                return (
                  <div key={idx} className="user-message">
                    {item.text}
                  </div>
                );
              } else if (item.type === 'text') {
                return (
                  <div
                    key={idx}
                    className="bot-message"
                    dangerouslySetInnerHTML={{__html: md.render(item.text)}}
                  />
                );
              } else if (item.type === 'surface') {
                // Render an A2UI Surface containing multiple UI components
                const surface = rendererRef.current.getSurface(item.surfaceId);
                if (!surface) {
                  console.warn('Surface not found for id:', item.surfaceId);
                  return null;
                }
                return (
                  <div key={item.surfaceId} className="surface-message">
                    {/* @ts-ignore */}
                    <a2ui-surface
                      surface={surface}
                    ></a2ui-surface>
                  </div>
                );
              }
              return null;
            })}
            {isRequesting && (
              <div className="loading-spinner">
                {activeMethods.map((method, idx) => {
                  const isLast = idx === activeMethods.length - 1;
                  return (
                    <div key={idx}>
                      {method}
                      <span className={isLast ? 'loading-dots' : ''}>...</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </maui-providers>
        </div>

        {/* --- Chat Input Area --- */}
        <div className="chat-input-area">
          <textarea
            className="chat-textarea"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isRequesting}></textarea>
          <div className="chat-actions">
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isRequesting || !input.trim()}>
              {isRequesting ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
