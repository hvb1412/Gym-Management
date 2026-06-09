const errorHandler = (err, req, res, next) => {
  let { statusCode, message, isOperational } = err;

  statusCode = statusCode || 500;
  message = message || "Lỗi hệ thống";

  if (!isOperational) {
    console.error(`[Lỗi nghiêm trọng]: `, err);
  } else {
    console.error(`[Lỗi xử lý]: `, message);
  }

  res.status(statusCode).json({
    success: false,
    message: message
  })
};

export default errorHandler;