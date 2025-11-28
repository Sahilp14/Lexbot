// Hero.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Scale, Globe } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('hidden');
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero-section hidden">
      {/* Decorative elements */}
      <div className="hero-bg">
        <div className="hero-bg-gradient"></div>
        <div className="hero-decor-circle"></div>
        <div className="hero-decor-small"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="badge-dot"></span>
            Simplifying legal complexity
          </span>
          
          <h1 className="hero-title">
            <span className="title-line">Making Legal Documents</span>
            <span className="title-highlight">Accessible to Everyone</span>
          </h1>
          
          <p className="hero-subtitle">
            Transform complex legal policies into clear, concise, and actionable summaries—designed specifically for NGOs and citizens.
          </p>
          
          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn btn-primary">
                <span className="btn-content">
                  Get Started
                  <ArrowRight size={16} className="btn-arrow" />
                </span>
              </button>
            </Link>
            <Link to="/features">
              <button className="btn btn-outline">
                Learn More
              </button>
            </Link>
          </div>
        </div>
        
        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">
              <BookOpen size={22} />
            </div>
            <h3 className="feature-title">Simplified Summaries</h3>
            <p className="feature-text">Extract key points while preserving legal context for better understanding.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Scale size={22} />
            </div>
            <h3 className="feature-title">Legal Accuracy</h3>
            <p className="feature-text">Maintains precise meaning while making complex legal terms accessible.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Globe size={22} />
            </div>
            <h3 className="feature-title">Multilingual Support</h3>
            <p className="feature-text">Break language barriers with support for multiple languages.</p>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="decor-float-large"></div>
        <div className="decor-float-small"></div>
      </div>
    </section>
  );
};

export default Hero;