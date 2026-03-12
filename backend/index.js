import express from "express";
import multer from "multer";
import resumeRoutes from "./routes/resumeRoutes.js";
import { ApiError } from "./utilities/apiResponse.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/resume", resumeRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    err = new ApiError(400, err.message);
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
