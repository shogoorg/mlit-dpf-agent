import {
  A2UIRenderer,
  type TimelineItem,
  themeStyleSheet,
} from '@googlemaps/a2ui/lit';
import MarkdownIt from 'markdown-it';
import {useEffect, useRef, useState} from 'react';
import './App.css';
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
  --a2ui-column-gap: 12px;

  /* Card Dark Theme Overrides */
  --a2ui-card-background: #18181b;
  --a2ui-card-border: 1px solid #27272a;
  --a2ui-card-border-radius: 16px;
  --a2ui-card-padding: 12px 16px;
  --a2ui-card-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

  /* Link & Text Overrides */
  --a2ui-text-color: #f4f4f5;
  --a2ui-text-a-color: #38bdf8;
  --a2ui-text-a-font-weight: 500;
  --a2ui-text-a-text-decoration: underline;

  /* Material Tokens */
  --md-sys-color-surface: #18181b;
  --md-sys-color-on-surface: #f4f4f5;
  --md-sys-color-on-surface-variant: #a1a1aa;
  --md-sys-color-outline: #27272a;
  --md-sys-color-primary: #38bdf8;
}
`);

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

  // RobustA2UIClient handles communication with the A2A agent
  const serverUrl =
    import.meta.env.VITE_A2A_SERVER_URL ||
    'https://mlit-dpf-agent-h3ix2jg73a-uw.a.run.app/a2a/app';
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
  }, [timeline]);

  useEffect(() => {
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets.filter(
        (s) => s !== themeStyleSheet && s !== customDarkThemeStyleSheet,
      ),
      themeStyleSheet,
      customDarkThemeStyleSheet,
    ];
  }, []);

  // Intercept all link clicks across light DOM and Shadow DOM (A2UI cards) to always open in a new tab
  useEffect(() => {
    const handleGlobalLinkClick = (e: MouseEvent) => {
      const path = e.composedPath();
      for (const el of path) {
        if (el instanceof HTMLAnchorElement && el.href) {
          if (el.href.startsWith('http://') || el.href.startsWith('https://')) {
            e.preventDefault();
            e.stopPropagation();
            window.open(el.href, '_blank', 'noopener,noreferrer');
            return;
          }
        }
      }
    };

    window.addEventListener('click', handleGlobalLinkClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalLinkClick, true);
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
      setIsRequesting(false);
    }
  };

  return (
    <div className="app-container">
      {/* --- Main Content Panel (PlateauView 3D) --- */}
      <main className="main-panel">
        {!isChatOpen && (
          <button
            className="toggle-chat-btn"
            onClick={() => setIsChatOpen(true)}>
            Open Chat
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
          <h2>Chat</h2>

          <button
            className="close-chat-btn"
            onClick={() => setIsChatOpen(false)}>
            ×
          </button>
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
              } else if (item.type === 'action') {
                return (
                  <div key={idx} className="action-message">
                    <strong>A2UI Action: {item.action}</strong>
                    <pre>{item.text}</pre>
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
                if (!surface) return null;
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
            {isRequesting && <div className="loading-spinner">Thinking...</div>}
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
