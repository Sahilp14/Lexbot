// DocumentHistory.jsx
import React, { useEffect, useState } from 'react';
import { History, Rss } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './DocumentHistory.css';
import axios from 'axios';

const DocumentHistory = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const [fileHistory,setFileHistory] = useState([])
  const fetchUserDocs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("User or authToken is missing");
        return;
      }

      const response = await axios.get(`${apiUrl}users/history/`, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setFileHistory(response.data.file_history); // Ensure the correct response structure
      console.log("Fetched File History:", response.data.file_history);
    } catch (error) {
      console.error("Error fetching file history:", error);
    }
  };

  useEffect(() => {
    fetchUserDocs();
  }, []);

  const { t } = useTranslation();

  return (
    <div className="history-card">
      <div className="card-header">
        <h2 className="card-title">
          <History size={20} />
          {t("doc_history")}
        </h2>
        <p className="card-description">
          {t("doc_history_desc")}
        </p>
      </div>
      <div className="card-content">
        <table className="history-table">
          <thead>
            <tr>
              <th>{t("sr_no")}</th>
              <th>{t("doc_name")}</th>
              <th>{t("date_processed")}</th>
              <th>{t("status")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {fileHistory.map((file,index) => (
              <tr key={file.id}>
                <td>{index+1}</td>
                <td>{file.file_name.substring(18)}</td>
                <td>{file.uploaded_at}</td>
                <td>
                  <span className="status">{file.status}</span>
                </td>
                <td>
                  <a href={`http://localhost:8000${file.file_url}`} target='_blank' className="view-btn">{t("view")}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer">
        <button className="load-more-btn">{t("load_more")}</button>
      </div>
    </div>
  );
};

export default DocumentHistory;