// src/api/utils/response.js
export const sendResponse = (res, status, data) => {
  res.status(status).json(data);
};