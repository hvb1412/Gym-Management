import express from "express";
import cors from "cors";
import AppError from './utils/AppError.js';
import routes from "./routes/index.route.js";
import { successResponse } from './utils/response.js';
import errorHandler from "./middlewares/error.middleware.js";

// Khởi tạo app
const app = express();

// 1. Cài đặt Middlewares cơ bản
app.use(cors()); // Cho phép Frontend gọi API mà không bị chặn lỗi CORS
app.use(express.json()); // Giúp server đọc được dữ liệu JSON từ Frontend gửi lên
app.use(express.urlencoded({ extended: true }));

// 2. Khai báo các Routes (Đường dẫn API)
app.use("/api/v1", routes);

// Ví dụ 1: Test API trả về Thành Công (Sử dụng helper)
app.get('/api/test-success', (req, res) => {
  successResponse(res, 200, 'Lấy dữ liệu thành công!', { gymName: 'Super Gym HUST' });
});

// Ví dụ 2: Test API trả về Lỗi Nghiệp Vụ (Sử dụng AppError)
app.get('/api/test-error', (req, res, next) => {
  // Dùng 'next' để ném lỗi về cho Global Error Handler xử lý
  next(new AppError('Gói tập đã hết hạn, không thể check-in!', 403));
});

app.all("/*splat", (req, res, next) => {
  next(new AppError(`Không tìm thấy API - ${req.originalUrl}`, 404));
});

// 2. Global Error Handler (Bắt buộc phải nằm DƯỚI CÙNG)
app.use(errorHandler);

export default app;
