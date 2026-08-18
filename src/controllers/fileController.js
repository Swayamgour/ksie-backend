import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';

export const uploadFile = catchAsync(async (req,res) => {
  if (!req.file) return sendResponse(res,400,'No file uploaded',null);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return sendResponse(res,201,'File uploaded successfully',{
    originalName:req.file.originalname,
    filename:req.file.filename,
    mimeType:req.file.mimetype,
    size:req.file.size,
    url:`${baseUrl}/uploads/${req.file.filename}`,
  });
});
