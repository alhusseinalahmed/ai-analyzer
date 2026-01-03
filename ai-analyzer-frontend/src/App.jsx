import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import "./App.css";

const SUGGESTIONS = [
  { label: "🐛 Find Bugs", text: "Check this code for bugs and edge cases." },
  {
    label: "⚡ Optimize",
    text: "Refactor this code to be more efficient and modern.",
  },
  { label: "📝 Explain", text: "Explain what this code does line-by-line." },
  {
    label: "🛡️ Security",
    text: "Audit this code for security vulnerabilities.",
  },
];
const MODES = [
  { value: "default", label: "Standard Review" },
  { value: "security", label: "Security Audit" },
  { value: "pirate", label: "Pirate Mode" },
  { value: "roast", label: "Roast My Code" },
];

function App() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! Paste your code below, and I'll review it for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("default");

  const handleSuggestionClick = (text) => {
    setInput(text + " \n\n[Paste your code here]");
    // Focus the textarea automatically (optional, but nice)
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.focus();
  };

  // 1. Restore Theme State
  const [theme, setTheme] = useState(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark";
    return "light";
  });

  const bottomRef = useRef(null);

  // 2. Apply Theme to HTML
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: userMessage.text, mode: mode }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.analysis }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error: Could not reach the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="logo">AI Code Reviewer</div>
        </div>

        {/* 3. Header Controls (Mode + Theme Toggle) */}
        <div className="header-right">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mode-select"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      <div className="chat-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>
            <div className="message-bubble">
              {msg.role === "user" ? (
                <pre className="user-code">{msg.text}</pre>
              ) : (
                <div className="markdown-content">
                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        code: CodeBlock,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>{" "}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row ai">
            <div className="message-bubble loading-bubble">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <div className="suggestions-row">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(s.text)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste code here..."
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
        <p className="disclaimer">
          AI can make mistakes. Review code before using.
        </p>
      </div>
    </div>
  );
}

export default App;
