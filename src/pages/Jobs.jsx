import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Web Development',
  'Full Stack Development',
  'Python & AI',
  'UI/UX Design',
  'Data Science & Analytics',
];

const WORK_TYPES = ['All Modes', 'Remote', 'Hybrid', 'On-site'];
const JOB_TYPES = [
  { value: 'all', label: 'All Job Types' },
  { value: 'internship', label: 'Internship' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
];
const EXPERIENCE_LEVELS = ['All Experience', 'Fresher', '0-1 Years', '1-3 Years', '3+ Years'];

const Jobs = ({ onApplyJob }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States hydrated from URL where present
  const selectedCategory = searchParams.get('category') || 'All Categories';
  const setSelectedCategory = useCallback(
    (cat) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!cat || cat === 'All Categories') {
          next.delete('category');
        } else {
          next.set('category', cat);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [workType, setWorkType] = useState(searchParams.get('workType') || 'All Modes');
  const [jobType, setJobType] = useState(searchParams.get('type') || 'all');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'All Experience');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Facets & Data State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [locations, setLocations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  // 350ms Debounce on Search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== searchTerm.trim()) {
          setPage(1);
        }
        return searchTerm.trim();
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load dynamic filter facets from backend
  useEffect(() => {
    let active = true;
    const loadFacets = async () => {
      try {
        if (api.jobs.getFilters) {
          const res = await api.jobs.getFilters();
          if (active && res?.data) {
            if (Array.isArray(res.data.categories) && res.data.categories.length > 0) {
              setCategories(['All Categories', ...res.data.categories]);
            }
            if (Array.isArray(res.data.locations)) {
              setLocations(res.data.locations);
            }
          }
        }
      } catch {
        // Silent fallback to defaults if facets endpoint unavailable
      }
    };
    loadFacets();
    return () => {
      active = false;
    };
  }, []);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = {
          page,
          limit: 9,
          sort: sortBy,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
        if (workType && workType !== 'All Modes') params.workType = workType;
        if (jobType && jobType !== 'all') params.type = jobType;
        if (experience && experience !== 'All Experience') params.experience = experience;
        if (locationFilter && locationFilter !== 'all') params.location = locationFilter;

        const res = await api.jobs.getAll(params);
        if (cancelled) return;

        const list = Array.isArray(res?.data) ? res.data : [];
        setJobs(list);
        setTotalJobs(res?.total ?? list.length);
        setTotalPages(Math.max(1, res?.totalPages || 1));
        setError('');

        setLocations((prev) => {
          if (prev.length > 0 || list.length === 0) return prev;
          const derived = Array.from(new Set(list.map((j) => j.location).filter(Boolean))).sort();
          return derived.length > 0 ? derived : prev;
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load internships from the server.');
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, sortBy, debouncedSearch, selectedCategory, workType, jobType, experience, locationFilter, refreshTick]);

  // Listen for live job posts from PostJobModal
  useEffect(() => {
    const onUpdated = () => fetchJobs();
    window.addEventListener('dg:jobs-updated', onUpdated);
    return () => window.removeEventListener('dg:jobs-updated', onUpdated);
  }, [fetchJobs]);

  const handleClearAll = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setWorkType('All Modes');
    setJobType('all');
    setExperience('All Experience');
    setLocationFilter('all');
    setSortBy('-createdAt');
    setPage(1);
    setSearchParams({});
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch) chips.push({ key: 'search', label: `Search: "${debouncedSearch}"`, clear: () => { setSearchTerm(''); setDebouncedSearch(''); } });
    if (selectedCategory !== 'All Categories') chips.push({ key: 'category', label: `Domain: ${selectedCategory}`, clear: () => setSelectedCategory('All Categories') });
    if (workType !== 'All Modes') chips.push({ key: 'workType', label: `Mode: ${workType}`, clear: () => setWorkType('All Modes') });
    if (jobType !== 'all') chips.push({ key: 'type', label: `Type: ${jobType}`, clear: () => setJobType('all') });
    if (experience !== 'All Experience') chips.push({ key: 'experience', label: `Exp: ${experience}`, clear: () => setExperience('All Experience') });
    if (locationFilter !== 'all') chips.push({ key: 'location', label: `Location: ${locationFilter}`, clear: () => setLocationFilter('all') });
    return chips;
  }, [debouncedSearch, selectedCategory, setSelectedCategory, workType, jobType, experience, locationFilter]);

  return (
    <div className="page-wrapper">
      {/* Header Section */}
      <section className="jobs-header-section" style={{ padding: '36px 0 28px', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="jobs-header-content">
            <span className="section-eyebrow">Verified Opportunities</span>
            <h1 className="jobs-page-title">Explore Internships & Tech Roles</h1>
            <p className="jobs-page-subtitle">
              Search live opportunities filtered by domain, location, work mode, experience level, and stipend.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Workspace */}
      <section className="jobs-search-section" style={{ padding: '24px 0 8px' }}>
        <div className="container">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClear={() => {
              setSearchTerm('');
              setDebouncedSearch('');
              setPage(1);
            }}
            placeholder="Search by job title, company, or skill (e.g. React, Python, Figma)..."
          />

          <div style={{ marginTop: '14px' }}>
            <FilterBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setPage(1);
              }}
            />
          </div>

          {/* Multi-Facet Dropdown Filters */}
          <div className="jobs-filters-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Refine Opportunities
              </strong>
            </div>

            <div className="jobs-filters-grid">
              <div className="filter-select-group">
                <label htmlFor="filter-workType" className="filter-select-label">Work Mode</label>
                <select
                  id="filter-workType"
                  className="filter-select-input"
                  value={workType}
                  onChange={(e) => {
                    setWorkType(e.target.value);
                    setPage(1);
                  }}
                >
                  {WORK_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="filter-jobType" className="filter-select-label">Job Type</label>
                <select
                  id="filter-jobType"
                  className="filter-select-input"
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(1);
                  }}
                >
                  {JOB_TYPES.map((jt) => (
                    <option key={jt.value} value={jt.value}>{jt.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="filter-experience" className="filter-select-label">Experience</label>
                <select
                  id="filter-experience"
                  className="filter-select-input"
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setPage(1);
                  }}
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="filter-location" className="filter-select-label">Location</label>
                <select
                  id="filter-location"
                  className="filter-select-input"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-group">
                <label htmlFor="filter-sort" className="filter-select-label">Sort By</label>
                <select
                  id="filter-sort"
                  className="filter-select-input"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="-stipendAmount">Highest Stipend</option>
                  <option value="-applicantsCount">Most Popular</option>
                  <option value="deadline">Closing Soon</option>
                </select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="active-filters-strip">
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Active Filters:
                </span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="active-filter-chip"
                    onClick={() => {
                      chip.clear();
                      setPage(1);
                    }}
                  >
                    <span>{chip.label}</span>
                    <X size={13} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="btn-ghost"
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--error)', padding: '4px 8px' }}
                >
                  Reset All
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Listings Results Grid */}
      <section className="jobs-listing-section" style={{ padding: '20px 0 64px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {loading
                ? 'Searching verified listings...'
                : `Showing ${jobs.length} of ${totalJobs} matching ${totalJobs === 1 ? 'listing' : 'listings'}`}
            </p>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <Loader type="skeleton-cards" count={6} />
          ) : error ? (
            <div className="error-state-box">
              <span>{error}</span>
              <button type="button" onClick={fetchJobs} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Briefcase size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>No matching internships found</h3>
              <p style={{ margin: 0, maxWidth: '420px', fontSize: '0.9rem' }}>
                Try broadening your search terms, clearing location filters, or switching categories.
              </p>
              <button type="button" onClick={handleClearAll} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="job-cards-grid">
                {jobs.map((job) => (
                  <JobCard key={job._id || job.id} job={job} onApply={onApplyJob} />
                ))}
              </div>

              {/* Backend Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalJobs} total)
                  </span>

                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter((pNum) => pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 1)
                      .map((pNum, idx, arr) => (
                        <React.Fragment key={pNum}>
                          {idx > 0 && arr[idx - 1] !== pNum - 1 && (
                            <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>
                          )}
                          <button
                            type="button"
                            className={`pagination-btn ${pNum === page ? 'active' : ''}`}
                            onClick={() => setPage(pNum)}
                          >
                            {pNum}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Jobs;
