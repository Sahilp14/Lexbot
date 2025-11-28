// Features.jsx
import React, { useEffect, useRef } from 'react';
import { 
  FileText, 
  Highlighter, 
  Lightbulb, 
  History, 
  HardDrive, 
  Languages,
  CheckCircle
} from 'lucide-react';
import './Features.css';

const Features = () => {
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

  const features = [
    {
      icon: <FileText className="feature-icon" />,
      title: "Smart Document Summarization",
      description: "AI-powered technology that extracts key points while maintaining legal accuracy and context."
    },
    {
      icon: <Highlighter className="feature-icon" />,
      title: "Keyword Highlighting",
      description: "Easily identify crucial terms and concepts with intelligent highlighting and annotations."
    },
    {
      icon: <Lightbulb className="feature-icon" />,
      title: "Actionable Insights",
      description: "Get clear guidance on requirements, deadlines, and compliance steps relevant to your situation."
    },
    {
      icon: <History className="feature-icon" />,
      title: "Version Comparison",
      description: "Track changes between document versions to understand how policies have evolved over time."
    },
    {
      icon: <HardDrive className="feature-icon" />,
      title: "Document Repository",
      description: "Store, organize, and access your legal documents from anywhere, anytime."
    },
    {
      icon: <Languages className="feature-icon" />,
      title: "Multilingual Support",
      description: "Break language barriers with translation and summarization in multiple languages."
    }
  ];

  return (
    <section ref={sectionRef} className="features-section hidden">
      {/* Background elements */}
      <div className="features-bg-gradient"></div>
      <div className="features-top-line"></div>
      <div className="features-bottom-line"></div>
      
      {/* Decorative elements */}
      <div className="decor-circle-top"></div>
      <div className="decor-circle-bottom"></div>
      
      <div className="features-container">
        <div className="features-header">
          <span className="features-badge">Features</span>
          <h2 className="features-title">Powerful Features</h2>
          <p className="features-subtitle">
            Our platform transforms complex legal documents into clear, actionable information.
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animationDelay: `${index * 100}ms` 
              }}
            >
              <div className="feature-card-bg"></div>
              <div className="feature-icon-container">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-check">
                <CheckCircle size={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;