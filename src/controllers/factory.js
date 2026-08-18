import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse, paginate, buildMeta } from '../utils/ApiResponse.js';

/**
 * Generic CRUD factory for Mongoose models.
 * Keeps repetitive list/get/create/update/delete logic in one place while
 * still letting each module define custom endpoints on top of it.
 *
 * options:
 *  - searchFields: string[] fields to apply a `?search=` case-insensitive regex on
 *  - filterFields: string[] fields allowed as exact-match query filters (?status=, ?customerId=, etc.)
 *  - populate: string[] | object[] fields to populate (mongoose .populate())
 *  - entityName: friendly name used in messages
 */
export const createCrudController = (Model, options = {}) => {
  const { searchFields = [], filterFields = [], populate = [], entityName = Model.modelName } = options;

  const getAll = catchAsync(async (req, res) => {
    const { page, limit, offset } = paginate(req.query);
    const where = {};

    filterFields.forEach((field) => {
      if (req.query[field] !== undefined) {
        where[field] = mongoose.isValidObjectId(req.query[field]) ? req.query[field] : req.query[field];
      }
    });

    if (req.query.search && searchFields.length) {
      const regex = new RegExp(req.query.search, 'i');
      where.$or = searchFields.map((field) => ({ [field]: regex }));
    }

    let query = Model.find(where).sort({ createdAt: -1 }).skip(offset).limit(limit);
    populate.forEach((p) => { query = query.populate(p); });

    const [rows, count] = await Promise.all([query, Model.countDocuments(where)]);

    return sendResponse(res, 200, `${entityName} list fetched`, rows, buildMeta(count, page, limit));
  });

  const getOne = catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => { query = query.populate(p); });
    const record = await query;
    if (!record) throw new ApiError(404, `${entityName} not found`);
    return sendResponse(res, 200, `${entityName} fetched`, record);
  });

  const create = catchAsync(async (req, res) => {
    const record = await Model.create({ ...req.body, createdBy: req.user?.id });
    return sendResponse(res, 201, `${entityName} created successfully`, record);
  });

  const update = catchAsync(async (req, res) => {
    const record = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) throw new ApiError(404, `${entityName} not found`);
    return sendResponse(res, 200, `${entityName} updated successfully`, record);
  });

  const remove = catchAsync(async (req, res) => {
    const record = await Model.findByIdAndDelete(req.params.id);
    if (!record) throw new ApiError(404, `${entityName} not found`);
    return sendResponse(res, 200, `${entityName} deleted successfully`);
  });

  return { getAll, getOne, create, update, remove };
};
