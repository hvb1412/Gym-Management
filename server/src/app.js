import express from 'express';
import cors from 'cors';
import routes from './routes/index.route.js'; // Nhớ đuôi .js
import errorHandler from './middlewares/error.middleware.js'; // Nhớ đuôi .js

// Khởi tạo app
const app = express();

// 1. Cài đặt Middlewares cơ bản
app.use(cors()); // Cho phép Frontend gọi API mà không bị chặn lỗi CORS
app.use(express.json()); // Giúp server đọc được dữ liệu JSON từ Frontend gửi lên
app.use(express.urlencoded({ extended: true }));

// 2. Khai báo các Routes (Đường dẫn API)
app.use('/api', routes);

// 3. Middleware xử lý lỗi 404 (Không tìm thấy Route)
app.use((req, res, next) => {
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use(errorHandler);

export default app;

