import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!code) return;
    
    setLoading(true);
    setAnalysis(""); // Clear previous results

    try {
      // 1. Send the code to your Backend
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: code }),
      });

      const data = await response.json();
      
      // 2. Set the AI's response to state
      setAnalysis(data.analysis);
    } catch (error) {
      setAnalysis("Error: Could not connect to server. Is it running?" + " " + error.message) ;
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🤖 AI Code Reviewer</h1>
        <p>Paste your code below to get feedback from a "Senior Developer"</p>
      </header>

      <main>
        <div className="input-section">
          <textarea
            placeholder="// Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
          />
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Review My Code"}
          </button>
        </div>

        {/* Only show this section if we have a result */}
        {analysis && (
          <div className="output-section">
            <h2>Analysis Result:</h2>
            <div className="markdown-body">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;