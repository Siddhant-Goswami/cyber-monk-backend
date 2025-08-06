// Utility helper functions

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    error: {
      code: getErrorCode(statusCode),
      message: message
    }
  });
};

const getErrorCode = (statusCode) => {
  switch (statusCode) {
    case 400: return 'INVALID_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 500: return 'INTERNAL_ERROR';
    default: return 'UNKNOWN_ERROR';
  }
};

const validateRequired = (obj, requiredFields) => {
  const missing = requiredFields.filter(field => !obj[field]);
  return missing.length === 0 ? null : missing;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidSourceType = (type) => {
  const validTypes = ['YouTube', 'RSS', 'Twitter', 'Blog'];
  return validTypes.includes(type);
};

const isValidStatus = (status) => {
  const validStatuses = ['active', 'paused', 'error'];
  return validStatuses.includes(status);
};

module.exports = {
  sendError,
  validateRequired,
  isValidUrl,
  isValidSourceType,
  isValidStatus
};