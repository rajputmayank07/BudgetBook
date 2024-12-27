
import React, { useState, useEffect } from "react";
const API_BASE_URL = window.location.origin;
const SpendingInsights = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchInsights = async () => {
      const user_details = JSON.parse(localStorage.getItem("user_details"));
      if (!user_details || !user_details.id) return;

      const response = await fetch(`${API_BASE_URL}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user_details.id }),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedInsights = parseSuggestions(data.suggestions);
        setInsights(formattedInsights);
      }
    };

    fetchInsights();
  }, []);

  const parseSuggestions = (suggestions) => {
    const lines = suggestions.split("\n").filter((line) => line.trim() !== "");
    const parsed = [];
    let currentTitle = "";

    lines.forEach((line) => {
      if (line.match(/^\d+\./)) {
        currentTitle = line.replace(/^\d+\.\s*/, "").trim();
        parsed.push({ title: currentTitle, points: [] });
      } else if (line.startsWith("*")) {
        parsed[parsed.length - 1]?.points.push(line.replace(/^\*\s*/, "").trim());
      }
    });

    return parsed;
  };

  return (
    <div className="insights-container">
      <h1 className="insights-title">AI-Driven Financial Insights</h1>
      {insights.length > 0 ? (
        <div className="insights-grid">
          {insights.map((insight, index) => {
            const [title, ...rest] = insight.title.split(":");
            return (
              <div key={index} className="insight-card">
                <h2 className="insight-heading">
                  <span className="insight-title">{title.trim()}:</span>
                </h2>
                <p className="insight-description">{rest.join(":").trim()}</p>
                <ul className="insight-points">
                  {insight.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="loading-text">Loading insights...</p>
      )}
    </div>
  );
};

export default SpendingInsights;
