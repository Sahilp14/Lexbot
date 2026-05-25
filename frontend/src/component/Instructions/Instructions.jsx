// Instructions.jsx
import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from "react-i18next";
import './Instructions.css';

const Instructions = () => {
  const { t } = useTranslation();

  return (
    <div className="instructions-card">
      <div className="card-header">
        <h2 className="card-title">
          <Info size={20} />
          {t("how_it_works")}
        </h2>
      </div>
      <div className="card-content">
        <div className="instruction-item">
          <div className="step-number">1</div>
          <h3>{t("upload_document")}</h3>
          <p>{t("upload_doc_desc")}</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">2</div>
          <h3>{t("analyze_content")}</h3>
          <p>{t("analyze_content_desc")}</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">3</div>
          <h3>{t("get_summary")}</h3>
          <p>{t("get_summary_desc")}</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">4</div>
          <h3>{t("chat_learn")}</h3>
          <p>{t("chat_learn_desc")}</p>
        </div>
      </div>
    </div>
  );
};

export default Instructions;