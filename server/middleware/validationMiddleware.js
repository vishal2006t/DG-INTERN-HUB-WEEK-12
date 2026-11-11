import mongoose from 'mongoose';
import { sendError } from '../utils/helpers.js';

export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return sendError(res, 400, errors[0] || 'Invalid input data', errors);
    }
    next();
  };
};

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (typeof val === 'string' && /^[a-f\d]{24}$/i.test(val) && mongoose.Types.ObjectId.isValid(val)) {
      return next();
    }
    return sendError(res, 400, `Invalid ID format for parameter '${paramName}'`);
  };
};
