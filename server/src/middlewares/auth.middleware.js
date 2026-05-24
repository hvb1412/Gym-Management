import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// 1. Xác thực token
export const verifyToken = catchAsync((req, res, next) => {
    let token;

    // Kiểm tra Header xem có chứa Bearer Token không
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập!', 401));
    }

    // Giải mã token (Nếu token hết hạn hoặc bị sửa đổi, jwt.verify sẽ văng lỗi và bị catchAsync bắt)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin giải mã được vào request để các màn sau sử dụng
    req.user = decoded;

    next();
});

// 2. Phân quyền (Người này có được phép làm hành động này không?)
// Hàm này nhận vào một mảng các role được phép truy cập
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user đã được gán từ hàm verifyToken chạy trước
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này!', 403));
        }
        next();
    };
};


