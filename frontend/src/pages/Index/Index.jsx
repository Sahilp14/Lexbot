// Index.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../component/Navbar/Navbar'; 
import Hero from '../../component/Hero/Hero';    
import Features from '../../component/Features/Features';
import HowItWorks from '../../component/HowItWorks/HowItWorks';
import UseCases from '../../component/UseCases/UseCases';
import { ArrowRight, FileText } from 'lucide-react';
import './Index.css';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        <Hero />
        <Features />
        <HowItWorks />
        <UseCases />
        
        {/* CTA Section */}
        <section className="cta-section">
          <div className="section-container">
            <div className="cta-content">
              <div className="cta-gradient"></div>
              <h2 className="cta-title">Ready to Simplify Legal Documents?</h2>
              <p className="cta-text">
                Join thousands of NGOs and citizens making legal documents accessible and actionable through AI-powered analysis.
              </p>
              <div className="cta-buttons">
                <Link to="/register">
                  <button className="btn btn-primary">
                    <span className="btn-content">
                      Upload Your First Document
                      <ArrowRight size={16} className="btn-arrow" />
                    </span>
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn btn-outline">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-left">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">
                  <FileText size={16} />
                </div>
                <span className="logo-text">LexBot</span>
              </Link>
              <p className="footer-text">
                Making legal information accessible to everyone.
              </p>
            </div>
            
            <div className="footer-right">
              {/* <div className="footer-links">
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/features" className="footer-link">Features</Link>
                <Link to="/contact" className="footer-link">Contact</Link>
              </div> */}
              <p className="footer-copyright">
                © {new Date().getFullYear()} LexBot. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;