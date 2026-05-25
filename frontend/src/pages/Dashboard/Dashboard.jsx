import React, { useState } from 'react';
import Stats from '../../component/Stats/Stats';
import Instructions from '../../component/Instructions/Instructions';
import UploadDocument from '../../component/UploadDocument/UploadDocument';
import DocumentHistory from '../../component/DocumentHistory/DocumentHistory';
import { useTranslation } from "react-i18next";
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    documentsProcessed: 0,
    timeSaved: 0,
    aiAnalyses: 0,
  });

  const updateStats = () => {
    setStats((prevStats) => ({
      documentsProcessed: prevStats.documentsProcessed + 1,
      timeSaved: prevStats.timeSaved + 1,
      aiAnalyses: prevStats.aiAnalyses + 2,
    }));
  };

  return (
    <div className="main-content-dash">
      <div className="container">
        <h1 className="dashboard-title">{t("document_dashboard")}</h1>
        <Stats stats={stats} />
        <div className="content-grid">
          <Instructions />
          <UploadDocument updateStats={updateStats} />
        </div>
        <DocumentHistory />
      </div>
    </div>
  );
};

export default Dashboard;