// UseCases.jsx
import React from 'react';
import { Check, FileText, Globe, Lightbulb } from 'lucide-react';
import './UseCases.css';

const UseCases = () => {
  // Debugging to confirm icons are being imported
  console.log('Icons imported:', { FileText, Globe, Lightbulb, Check });

  return (
    <section className="use-cases">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Use Cases</h2>
          <p className="section-subtitle">
            See how NGOs and citizens benefit from our legal document summarizer.
          </p>
        </div>
        
        <div className="use-cases-grid">
          <div className="use-case-card">
            <div className="use-case-icon">
              <FileText className="icon" size={24} />
            </div>
            <h3 className="use-case-title">Environmental NGOs</h3>
            <p className="use-case-text">
              Quickly understand complex environmental regulations and prepare accessible briefings for stakeholders.
            </p>
            <ul className="use-case-list">
              <li>
                <Check className="check-icon" size={18} />
                <span>Policy analysis for advocacy</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Compliance requirement tracking</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Public education materials</span>
              </li>
            </ul>
          </div>
          
          <div className="use-case-card">
            <div className="use-case-icon">
              <Globe className="icon" size={24} />
            </div>
            <h3 className="use-case-title">Human Rights Organizations</h3>
            <p className="use-case-text">
              Break down complex international treaties and agreements to identify rights violations and obligations.
            </p>
            <ul className="use-case-list">
              <li>
                <Check className="check-icon" size={18} />
                <span>Treaty comparison and analysis</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Country-specific rights tracking</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Multilingual policy resources</span>
              </li>
            </ul>
          </div>
          
          <div className="use-case-card">
            <div className="use-case-icon">
              <Lightbulb className="icon" size={24} />
            </div>
            <h3 className="use-case-title">Community Advocates</h3>
            <p className="use-case-text">
              Help community members understand their rights and navigate complex legal systems with ease.
            </p>
            <ul className="use-case-list">
              <li>
                <Check className="check-icon" size={18} />
                <span>Local ordinance summarization</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Simplified rights education</span>
              </li>
              <li>
                <Check className="check-icon" size={18} />
                <span>Actionable guidance creation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;