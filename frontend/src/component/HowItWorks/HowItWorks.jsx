// HowItWorks.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Our streamlined process makes legal document analysis simple and interactive.
          </p>
        </div>
        
        <div className="steps-container">
          <div className="connection-line"></div>
          
          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step step-right group">
              <div className="step-dot"></div>
              <span className="step-label">Step 1</span>
              <h3 className="step-title">Upload Your Document</h3>
              <p className="step-text">Simply drag and drop your legal document or browse your files to upload it to our secure platform.</p>
            </div>
            <div className="step-spacer"></div>
            
            {/* Step 2 */}
            <div className="step-spacer"></div>
            <div className="step step-left group">
              <div className="step-dot"></div>
              <span className="step-label">Step 2</span>
              <h3 className="step-title">Analyze Document</h3>
              <p className="step-text">Our AI immediately begins analyzing your document, identifying key sections, obligations, and important clauses.</p>
            </div>
            
            {/* Step 3 */}
            <div className="step step-right group">
              <div className="step-dot"></div>
              <span className="step-label">Step 3</span>
              <h3 className="step-title">Get Clear Summary</h3>
              <p className="step-text">Receive a comprehensive yet concise summary with highlighted key points, requirements, and actionable insights.</p>
            </div>
            <div className="step-spacer"></div>
            
            {/* Step 4 */}
            <div className="step-spacer"></div>
            <div className="step step-left group">
              <div className="step-dot"></div>
              <span className="step-label">Step 4</span>
              <h3 className="step-title">Chat & Ask Questions</h3>
              <p className="step-text">Ask specific questions about the document and get instant, accurate answers from our AI to deepen your understanding.</p>
              <div className="step-extra">
                <MessageSquare size={16} />
                <span>Interactive Q&A available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;