import CustomError from "../utils/CustomError.js";

export const errorResponserHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 400;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const invalidPathHandler = (req, res, next) => {
  let error = new CustomError(`Invalid Path : ${req.originalUrl}`);

  error.statusCode = 404;

  throw error;
};
