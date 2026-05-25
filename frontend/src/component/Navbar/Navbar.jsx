import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlignRight, X, FileText } from 'lucide-react';
import { useTranslation } from "react-i18next";

import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const { t } = useTranslation(); // ✅ i18next

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <nav className="navbar-nav">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <FileText size={20} />
            </div>
            <span className="logo-text">LexBot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">

            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              {t("home")}
            </Link>

            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
              {t("contact")}
            </Link>

            <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>
              {t("pricing")}
            </Link>

            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              {t("about")}
            </Link>

          </div>

          {/* Auth Buttons */}
          <div className="auth-buttons desktop-nav">

            <Link to="/login">
              <button className="btn btn-ghost">
                {t("login")}
              </button>
            </Link>

            <Link to="/signup">
              <button className="btn btn-primary">
                {t("signup")}
              </button>
            </Link>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-menu-btn"
          >
            {isOpen ? <X size={24} /> : <AlignRight size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-content">

          <Link to="/" className="mobile-nav-link">
            {t("home")}
          </Link>

          <Link to="/documents" className="mobile-nav-link">
            Documents
          </Link>

          <Link to="/pricing" className="mobile-nav-link">
            {t("pricing")}
          </Link>

          <div className="mobile-auth-section">

            <Link to="/login">
              <button className="btn btn-ghost mobile-btn">
                {t("login")}
              </button>
            </Link>

            <Link to="/signup">
              <button className="btn btn-primary mobile-btn">
                {t("signup")}
              </button>
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;