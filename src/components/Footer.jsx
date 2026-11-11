import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import dgLogo from '../assets/dg-interns-hub-logo.png';

const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  const year = CURRENT_YEAR;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content-grid">
          {/* Brand Summary */}
          <div>
            <Link to="/" className="footer-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img
                src={dgLogo}
                alt="DG Interns Hub"
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <span className="footer-brand-name">DG Interns Hub</span>
            </Link>
            <p className="footer-description">
              A modern SaaS recruitment and internship portal built for engineering students,
              fresh graduates, and verified hiring teams across India.
            </p>
            <div className="footer-social-links">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn"
              >
                <LinkedInIcon size={18} />
              </a>
              <a
                href="https://github.com/vishal2006t"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="GitHub"
              >
                <GitHubIcon size={18} />
              </a>
              <a
                href="mailto:contact@dginternshub.com"
                className="social-icon-btn"
                aria-label="Email DG Interns Hub"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/jobs">Browse Internships</Link></li>
              <li><Link to="/saved-jobs">Saved Listings</Link></li>
              <li><Link to="/dashboard">Workspace Dashboard</Link></li>
              <li><Link to="/contact">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Domains matching real DB categories */}
          <div>
            <h4 className="footer-col-title">Top Domains</h4>
            <ul className="footer-links-list">
              <li><Link to="/jobs?category=Web+Development">Web Development</Link></li>
              <li><Link to="/jobs?category=Full+Stack+Development">Full Stack Development</Link></li>
              <li><Link to="/jobs?category=Python+%26+AI">Python & AI</Link></li>
              <li><Link to="/jobs?category=UI%2FUX+Design">UI/UX Design</Link></li>
              <li><Link to="/jobs?category=Data+Science+%26+Analytics">Data Science & Analytics</Link></li>
            </ul>
          </div>

          {/* Contact Box */}
          <div>
            <h4 className="footer-col-title">Get In Touch</h4>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <Mail size={16} />
                <span>contact@dginternshub.com</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
            <div className="footer-badge-box" style={{ marginTop: '14px' }}>
              <Briefcase size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Week 12 Full-Stack Capstone
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {year} DG Interns Hub. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/contact">
              Support <ExternalLink size={12} style={{ display: 'inline' }} />
            </Link>
            <Link to="/jobs">Verified Roles</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
