// Instructions.jsx
import React from 'react';
import { Info } from 'lucide-react';
import './Instructions.css';

const Instructions = () => {
  return (
    <div className="instructions-card">
      <div className="card-header">
        <h2 className="card-title">
          <Info size={20} />
          How It Works
        </h2>
      </div>
      <div className="card-content">
        <div className="instruction-item">
          <div className="step-number">1</div>
          <h3>Upload Document</h3>
          <p>Upload any legal document in PDF, DOCX, or TXT format.</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">2</div>
          <h3>Analyze Content</h3>
          <p>Our AI analyzes the document to identify key legal points.</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">3</div>
          <h3>Get Summary</h3>
          <p>Receive a simplified version that preserves legal context.</p>
        </div>
        <div className="instruction-item">
          <div className="step-number">4</div>
          <h3>Chat & Learn</h3>
          <p>Ask questions about the document to understand it better.</p>
        </div>
      </div>
    </div>
  );
};

export default Instructions;