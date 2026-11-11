import React, { useState, useEffect } from 'react';
import { SavedJobsContext } from './contextObjects';

export const SavedJobsProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('dg_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dg_saved_jobs', JSON.stringify(savedJobs));
    } catch (e) {
      console.warn('Unable to save jobs to localStorage:', e);
    }
  }, [savedJobs]);

  const isSaved = (jobId) => {
    if (!jobId) return false;
    return savedJobs.some((j) => (j._id === jobId || j.id === jobId));
  };

  const toggleSave = (job) => {
    if (!job) return false;
    const targetId = job._id || job.id;
    let nowSaved = false;

    setSavedJobs((prev) => {
      const exists = prev.some((j) => (j._id === targetId || j.id === targetId));
      if (exists) {
        nowSaved = false;
        return prev.filter((j) => (j._id !== targetId && j.id !== targetId));
      } else {
        nowSaved = true;
        return [
          {
            _id: job._id || job.id,
            id: job.id || job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            workType: job.workType,
            type: job.type,
            category: job.category,
            stipend: job.stipend,
            duration: job.duration,
            savedAt: new Date().toISOString()
          },
          ...prev
        ];
      }
    });

    return nowSaved;
  };

  const removeSavedJob = (jobId) => {
    setSavedJobs((prev) => prev.filter((j) => (j._id !== jobId && j.id !== jobId)));
  };

  const clearSavedJobs = () => {
    setSavedJobs([]);
  };

  return (
    <SavedJobsContext.Provider
      value={{
        savedJobs,
        savedCount: savedJobs.length,
        isSaved,
        toggleSave,
        removeSavedJob,
        clearSavedJobs
      }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
};
