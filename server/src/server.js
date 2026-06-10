import dotenv from 'dotenv';
// Load biến môi trường
dotenv.config({ path: '.env' }); 

import app from './app.js';
import { sequelize } from './models/index.js'; // Lấy instance sequelize đã móc nối toàn bộ Model

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Bước 1: Kiểm tra kết nối tới Database (Neon PostgreSQL)
        await sequelize.authenticate();
        console.log('[Database] Kết nối thành công tới Neon PostgreSQL!');

        // Bước 2: Đồng bộ hóa Schema (Models -> Tables)
        // alter: true giúp Sequelize tự động điều chỉnh cột nếu Model thay đổi mà không làm mất dữ liệu.
        try {
            await sequelize.sync({ alter: true });
        } catch (e) {
            console.warn('[Database] Lỗi khi alter bảng, đang thử sync bình thường:', e.message);
            await sequelize.sync();
        }
        console.log('[Database] Đã đồng bộ toàn bộ Model thành bảng thành công!');

        // Bước 3: Chỉ khi DB đã sẵn sàng, mới bắt đầu mở port đón Request từ Frontend
        app.listen(PORT, () => {
            console.log(`[Server] Đang chạy tại http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('[Lỗi Hệ Thống] Quá trình khởi động thất bại:', error);
        // Dừng toàn bộ chương trình nếu không kết nối được DB (tránh app chạy mà không có DB)
        process.exit(1); 
    }
};

// Kích hoạt tiến trình
startServer();