# Gym-Management System

Hệ thống quản lý phòng tập Gym toàn diện, hỗ trợ kiểm soát hội viên, thiết bị và doanh thu.

## 🚀 Công nghệ sử dụng (Tech Stack)

### ➔ Backend & Database
- **Core**: Node.js, Express.js, JavaScript
- **Database**: PostgreSQL, Sequelize ORM
- **Authentication**: JWT (JSON Web Token), bcryptjs
- **API**: RESTful APIs

### ➔ Frontend
- **Core**: React 18, Vite, TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui, Material UI (MUI v7), next-themes
- **Form & Routing**: React Hook Form, React Router v7
- **Data Fetching**: Axios / Fetch API
- **Charts & Interactions**: Recharts, React DnD, Motion

### ➔ Storage, Hosting & Cloud
- **Database Hosting**: Neon (Cloud PostgreSQL)
- **CI/CD**: GitHub CI

## 📁 Cấu trúc dự án

- `/client`: Mã nguồn giao diện người dùng (Frontend)
- `/server`: Mã nguồn máy chủ và xử lý logic (Backend)
- `package.json` (thư mục gốc): Quản lý dependencies chung và chứa các script khởi chạy hệ thống.

## 🛠 Hướng dẫn cài đặt và khởi chạy

### Yêu cầu môi trường
- Node.js (khuyến nghị phiên bản >= 18.x)
- Cơ sở dữ liệu PostgreSQL (hoặc có thể dùng URL kết nối của Neon PostgreSQL)

### Các bước cài đặt

**1. Clone dự án**
```bash
git clone https://github.com/hvb1412/Gym-Management.git
cd Gym-Management
```

**2. Cài đặt các gói thư viện (Dependencies)**
Dự án đã thiết lập sẵn script để cài đặt thư viện cho tất cả các phần (root, client, server) chỉ bằng một lệnh:
```bash
npm install
```

**3. Cấu hình biến môi trường (Environment Variables)**
Bạn cần thiết lập các biến môi trường cho cả Server và Client.

- **Server (`server/.env`)**:
  Copy file `server/.env-example` sang `server/.env` và cập nhật các thông tin cấu hình:
  ```env
  PORT=5000
  DATABASE_URL=chuoi_ket_noi_postgresql_cua_ban
  JWT_SECRET=chuoi_bi_mat_de_tao_token
  JWT_EXPIRES_IN=thoi_gian_het_han_token
  ```

- **Client (`client/.env`)**:
  Copy file `client/.env-example` sang `client/.env` và cập nhật thông tin:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

**4. Khởi chạy ứng dụng (Development Mode)**
Ở thư mục gốc, bạn có thể chạy đồng thời cả Frontend và Backend bằng lệnh:
```bash
npm run dev
```

Sau khi khởi chạy thành công:
- **Client** sẽ hoạt động tại: `http://localhost:5173`
- **Server** sẽ hoạt động tại: `http://localhost:5000`

