import React, { useEffect, useState } from 'react';
import { FileCheck, Clock, Brain } from 'lucide-react';
import './Stats.css';
import axios from 'axios';

const Stats = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [fileHistory, setFileHistory] = useState([]);
  
  // Fetch file history from the API
  const fetchUserDocs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const authToken = localStorage.getItem("authToken");

      if (!user || !authToken) {
        console.error("User or authToken is missing");
        return;
      }

      const response = await axios.get(`${apiUrl}users/history/`, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setFileHistory(response.data.file_history); // Store file history
      console.log("Fetched File History for Stats:", response.data.file_history);
    } catch (error) {
      console.error("Error fetching file history:", error);
    }
  };

  useEffect(() => {
    fetchUserDocs();
  }, []);

  // Calculate stats based on fetched data
  const numDocuments = fileHistory.length; // Number of documents processed
  const timeSaved = (numDocuments * 0.67).toFixed(1); // Random calc: 0.67 hours saved per document
  const aiAnalyses = numDocuments * 2 + Math.floor(Math.random() * 10); // Random calc: 2 analyses per doc + random extra

  const statsData = [
    { title: "Documents Processed", value: numDocuments, icon: FileCheck, color: "#3b82f6" },
    { title: "Time Saved", value: `${timeSaved} hrs`, icon: Clock, color: "#22c55e" },
    { title: "AI Analyses", value: aiAnalyses, icon: Brain, color: "#9333ea" },
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-content">
            <div>
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;