export const validateJob = (data, isUpdate = false) => {
  const errors = [];
  const {
    title,
    company,
    description,
    location,
    skills,
    workType,
    type,
    experienceLevel,
    status,
    openings
  } = data;

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Job title is required');
    }
  }

  if (!isUpdate || company !== undefined) {
    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      errors.push('Company name is required');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Job description is required');
    }
  }

  if (!isUpdate || location !== undefined) {
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.push('Location is required');
    }
  }

  if (!isUpdate || skills !== undefined) {
    const hasSkills =
      Array.isArray(skills)
        ? skills.some((s) => typeof s === 'string' && s.trim().length > 0)
        : typeof skills === 'string' && skills.trim().length > 0;
    if (!hasSkills) {
      errors.push('At least one skill is required');
    }
  }

  if (workType !== undefined && !['Remote', 'Hybrid', 'On-site'].includes(workType)) {
    errors.push('Invalid workType. Allowed: Remote, Hybrid, On-site');
  }

  if (type !== undefined && !['internship', 'full-time', 'part-time', 'contract'].includes(type)) {
    errors.push('Invalid job type. Allowed: internship, full-time, part-time, contract');
  }

  if (experienceLevel !== undefined && !['Fresher', '0-1 Years', '1-3 Years', '3+ Years'].includes(experienceLevel)) {
    errors.push('Invalid experienceLevel. Allowed: Fresher, 0-1 Years, 1-3 Years, 3+ Years');
  }

  if (status !== undefined && !['open', 'closed', 'draft'].includes(status)) {
    errors.push('Invalid status. Allowed: open, closed, draft');
  }

  if (openings !== undefined && (Number.isNaN(Number(openings)) || Number(openings) < 1)) {
    errors.push('Openings must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
