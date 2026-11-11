import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Award,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useContexts';
import JobCard from '../components/JobCard';
import FeatureCard from '../components/FeatureCard';
import HowItWorks from '../components/HowItWorks';
import Loader from '../components/Loader';
import { whyChooseUsFeatures, howItWorksSteps } from '../data/jobs';

const Home = ({ onApplyJob }) => {
  const { isAuthenticated, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [publicStats, setPublicStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const loadHomeData = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          api.jobs.getAll({ limit: 6 }),
          api.analytics.getPublic ? api.analytics.getPublic().catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const jobs = Array.isArray(jobsRes?.data) ? jobsRes.data : [];
        setFeaturedJobs(jobs);

        if (statsRes?.data) {
          setPublicStats(statsRes.data);
        } else {
          setPublicStats({
            activeInternships: jobsRes?.total ?? jobs.length,
            registeredCandidates: null,
            partnerCompanies: new Set(jobs.map((j) => j.company).filter(Boolean)).size,
            applicationsProcessed: null,
          });
        }
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to connect to listings service.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const spotlightJob =
    featuredJobs.find((j) => j.featured) || featuredJobs[0] || null;

  const statItems = [
    {
      label: 'Active Internships',
      value: publicStats?.activeInternships != null ? `${publicStats.activeInternships}` : 'Live',
      desc: 'Verified open positions in database',
      icon: <Briefcase size={20} />,
    },
    {
      label: 'Hiring Organizations',
      value: publicStats?.partnerCompanies != null ? `${publicStats.partnerCompanies}` : 'Verified',
      desc: 'Active companies & tech startups',
      icon: <Building2 size={20} />,
    },
    {
      label: 'Registered Talents',
      value: publicStats?.registeredCandidates != null ? `${publicStats.registeredCandidates}` : 'Growing',
      desc: 'Active student & fresher profiles',
      icon: <Users size={20} />,
    },
    {
      label: 'Applications Tracked',
      value: publicStats?.applicationsProcessed != null ? `${publicStats.applicationsProcessed}` : 'Real-Time',
      desc: 'Transparent end-to-end hiring status',
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <div className="page-wrapper">
      {/* 1. SaaS Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-pulse-dot" />
              <span>Verified Tech Internships & Early-Career Roles</span>
            </div>

            <h1 className="hero-headline">
              Launch Your Tech Career With Verified Real-World Internships
            </h1>

            <p className="hero-subtitle">
              Discover curated internships, submit PDF resumes in seconds, and track every stage
              of recruiter review with transparent, real-time notifications.
            </p>

            <div className="hero-cta-group">
              <Link to="/jobs" className="btn btn-primary btn-lg">
                <span>Explore Internships</span>
                <ArrowRight size={18} />
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  <span>Open {user?.role === 'admin' ? 'Admin' : user?.role === 'recruiter' ? 'Recruiter' : 'My'} Dashboard</span>
                </Link>
              ) : (
                <Link to="/register" className="btn btn-secondary btn-lg">
                  <span>Create Free Account</span>
                </Link>
              )}
            </div>

            <div className="hero-trust-indicators">
              <div className="trust-item">
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Direct Recruiter Pipeline</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>PDF Resume Tracking</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Zero Fake Listings</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Featured Spotlight Card */}
          <div className="hero-visual-col">
            {loading ? (
              <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="skeleton" style={{ height: '24px', width: '40%' }} />
                <div className="skeleton" style={{ height: '28px', width: '80%' }} />
                <div className="skeleton" style={{ height: '70px', width: '100%' }} />
                <div className="skeleton" style={{ height: '42px', width: '100%' }} />
              </div>
            ) : spotlightJob ? (
              <div className="hero-spotlight-card">
                <div className="spotlight-badge-row">
                  <span className="badge badge-blue">
                    <Sparkles size={12} /> Featured Opportunity
                  </span>
                  <span className="badge badge-green">{spotlightJob.workType || 'Remote'}</span>
                </div>

                <div className="spotlight-card-top">
                  <h2 className="spotlight-title">{spotlightJob.title}</h2>
                  <p className="spotlight-company">
                    {spotlightJob.company} • {spotlightJob.category}
                  </p>
                </div>

                <div className="spotlight-details-box">
                  <div className="spotlight-metric">
                    <MapPin size={15} style={{ color: 'var(--primary)' }} />
                    <span>{spotlightJob.location}</span>
                  </div>
                  <div className="spotlight-metric">
                    <Clock size={15} style={{ color: 'var(--primary)' }} />
                    <span>{spotlightJob.duration || '3-6 Months'}</span>
                  </div>
                  <div className="spotlight-metric">
                    <Award size={15} style={{ color: 'var(--success)' }} />
                    <span>{spotlightJob.stipend || 'Paid Internship'}</span>
                  </div>
                </div>

                {Array.isArray(spotlightJob.skills) && spotlightJob.skills.length > 0 && (
                  <div className="spotlight-skills-row">
                    {spotlightJob.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="spotlight-footer">
                  <Link
                    to={`/jobs/${spotlightJob.slug || spotlightJob._id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Role
                  </Link>
                  <button
                    type="button"
                    onClick={() => onApplyJob(spotlightJob)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Quick Apply</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="saas-card" style={{ textAlign: 'center', padding: '32px' }}>
                <Briefcase size={32} style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px' }}>Explore Verified Roles</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  Sign in as a recruiter or browse active openings on our jobs board.
                </p>
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  Go to Jobs Board
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Live Platform Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statItems.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px', marginBottom: '8px' }}>
                  <span className="stat-label" style={{ marginBottom: 0 }}>{stat.label}</span>
                  <span style={{ color: 'var(--primary)', display: 'inline-flex', flexShrink: 0 }}>{stat.icon}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
                <p className="stat-desc">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Internships Section */}
      <section className="featured-internships-section">
        <div className="container">
          <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div>
              <span className="section-eyebrow">Live Openings</span>
              <h2 className="section-title">Featured Internships & Roles</h2>
              <p className="section-subtitle">
                Pulled directly from our live database of verified partner companies.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-outline-primary">
              <span>View All Openings</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <Loader type="skeleton-cards" count={6} />
          ) : error ? (
            <div className="error-state-box">
              <span>{error}</span>
              <button type="button" onClick={loadHomeData} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="empty-state-box">
              <Briefcase size={28} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0 }}>No internships published yet</h3>
              <p style={{ margin: 0 }}>Check back soon or sign in as a recruiter to publish a role.</p>
            </div>
          ) : (
            <div className="job-cards-grid">
              {featuredJobs.map((job) => (
                <JobCard key={job._id || job.id} job={job} onApply={onApplyJob} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Why Choose DG Interns Hub */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Built For Modern Hiring</span>
            <h2 className="section-title">Why Candidates & Recruiters Choose Us</h2>
            <p className="section-subtitle">
              Streamlined workflows for students applying to tech roles and teams evaluating talent.
            </p>
          </div>

          <div className="features-grid">
            {whyChooseUsFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Simple 4-Step Pipeline</span>
            <h2 className="section-title">From Profile To Offer Letter</h2>
          </div>
          <HowItWorks steps={howItWorksSteps} />
        </div>
      </section>

      {/* 6. Final CTA Banner */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-banner-content">
              <h2 className="cta-title">Ready to accelerate your career or hire top student talent?</h2>
              <p className="cta-subtitle">
                Join DG Interns Hub today as a candidate or verified recruiter.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/jobs" className="btn btn-secondary btn-lg">
                Browse Roles
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
