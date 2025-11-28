import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar/Sidebar';
import Stats from '../../component/Stats/Stats';
import Instructions from '../../component/Instructions/Instructions';
import UploadDocument from '../../component/UploadDocument/UploadDocument';
import DocumentHistory from '../../component/DocumentHistory/DocumentHistory';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    documentsProcessed: 0,
    timeSaved: 0,
    aiAnalyses: 0,
  });

  const updateStats = () => {
    setStats((prevStats) => ({
      documentsProcessed: prevStats.documentsProcessed + 1,
      timeSaved: prevStats.timeSaved + 1, // Assuming 1 file saves 1 hr (adjust as needed)
      aiAnalyses: prevStats.aiAnalyses + 2, // Assuming each document runs 2 AI analyses
    }));
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content-dash">
        <div className="container">
          <h1 className="dashboard-title">Document Dashboard</h1>
          <Stats stats={stats} />
          <div className="content-grid">
            <Instructions />
            <UploadDocument updateStats={updateStats} />
          </div>
          <DocumentHistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
