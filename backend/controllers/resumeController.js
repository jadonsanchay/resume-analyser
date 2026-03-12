import { parseResume } from "../utilities/resumeParser.js";
import { ApiResponse, ApiError } from "../utilities/apiResponse.js";

export const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const { jsonPath, data } = await parseResume(req.file);

    res.status(200).json(
      new ApiResponse(200, "Resume uploaded and parsed successfully", {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadPath: req.file.path,
        parsedPath: jsonPath,
        parsed: data,
      })
    );
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, error.message));
  }
};
