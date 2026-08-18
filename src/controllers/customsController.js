import { CustomsDeclaration, CustomsDocument } from '../models/index.js';
import { createCrudController } from './factory.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateRefNumber } from '../utils/generateRefNumber.js';

/* -------------------- Customs Declarations (BoE / Shipping Bill / IGM / SF) -------------------- */
const declarationBase = createCrudController(CustomsDeclaration, {
  searchFields: ['declarationNumber', 'icegateReferenceId'],
  filterFields: ['declarationType', 'referenceType', 'referenceId', 'filingStatus'],
  entityName: 'Customs Declaration',
});
export const listDeclarations = declarationBase.getAll;
export const getDeclaration = declarationBase.getOne;
export const updateDeclaration = declarationBase.update;
export const deleteDeclaration = declarationBase.remove;

export const createDeclaration = catchAsync(async (req, res) => {
  const record = await CustomsDeclaration.create({
    ...req.body,
    declarationNumber: req.body.declarationNumber || generateRefNumber('DEC'),
    filingStatus: 'draft',
  });
  return sendResponse(res, 201, 'Customs declaration created', record);
});

/**
 * ICEGATE Integration stub.
 * In production this calls the actual ICEGATE API-based electronic filing service
 * and stores the response/reference id. Wire the real endpoint + credentials here.
 */
export const fileWithIcegate = catchAsync(async (req, res) => {
  const declaration = await CustomsDeclaration.findById(req.params.id);
  if (!declaration) throw new ApiError(404, 'Customs declaration not found');
  if (declaration.filingStatus !== 'draft') {
    throw new ApiError(400, 'Only draft declarations can be filed');
  }

  // TODO: replace with real ICEGATE API call
  const simulatedResponse = {
    icegateReferenceId: generateRefNumber('ICG'),
    filedAt: new Date().toISOString(),
    status: 'ACCEPTED',
  };

  declaration.icegateReferenceId = simulatedResponse.icegateReferenceId;
  declaration.icegateResponse = simulatedResponse;
  declaration.filingStatus = 'filed';
  declaration.filedBy = req.user?.id;
  declaration.filedAt = new Date();
  await declaration.save();

  return sendResponse(res, 200, 'Filed with ICEGATE successfully', declaration);
});

export const updateFilingStatus = catchAsync(async (req, res) => {
  const declaration = await CustomsDeclaration.findById(req.params.id);
  if (!declaration) throw new ApiError(404, 'Customs declaration not found');
  declaration.filingStatus = req.body.filingStatus;
  await declaration.save();
  return sendResponse(res, 200, 'Filing status updated', declaration);
});

/* -------------------- Customs Documents -------------------- */
const documentBase = createCrudController(CustomsDocument, {
  filterFields: ['declarationId', 'documentType', 'verifiedStatus'],
  entityName: 'Customs Document',
});
export const listDocuments = documentBase.getAll;
export const getDocument = documentBase.getOne;
export const deleteDocument = documentBase.remove;

export const uploadDocument = catchAsync(async (req, res) => {
  const record = await CustomsDocument.create({ ...req.body, uploadedBy: req.user?.id });
  return sendResponse(res, 201, 'Customs document uploaded', record);
});

export const verifyDocument = catchAsync(async (req, res) => {
  const record = await CustomsDocument.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Customs document not found');
  record.verifiedStatus = req.body.verifiedStatus; // verified | rejected
  await record.save();
  return sendResponse(res, 200, 'Document verification status updated', record);
});
