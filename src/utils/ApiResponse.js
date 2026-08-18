export const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const body = { success: statusCode < 400, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const paginate = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildMeta = (count, page, limit) => ({
  totalRecords: count,
  totalPages: Math.ceil(count / limit),
  currentPage: page,
  pageSize: limit,
});
