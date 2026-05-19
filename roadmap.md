Chào bạn, một sự chuẩn bị rất tuyệt vời! Việc chốt được Database Schema và API Flow trước khi lao vào code là bạn đã hoàn thành được 50% khối lượng công việc khó nhất của một dự án Backend.

Với tư cách là một Backend Architect, tôi sẽ cấu trúc backlog này theo hướng **Domain-Driven Design (DDD)** kết hợp **Layered Architecture**, đảm bảo tính mở rộng cao và dễ dàng maintain. Các task sẽ được thiết kế để team có thể vận hành theo mô hình Agile/Scrum, giảm thiểu tối đa block chéo (dependencies) giữa các dev.

Dưới đây là **Master Backlog** dành cho dự án của bạn, sẵn sàng để import vào Jira/GitHub Issues/GitLab.

---

## 🗺️ PHẦN 1: ROADMAP TRIỂN KHAI (IMPLEMENTATION PHASES)

Để team không bị ngợp, chúng ta chia backlog thành 4 phase thực tế. Critical Path nằm ở Phase 1 & 2.

| Phase | Mục tiêu (Milestone) | Các Module trọng tâm | Rủi ro & Đánh giá |
| --- | --- | --- | --- |
| **1. MVP (Foundation)** | Xây dựng móng vững chắc, luồng Auth và các API Core CRUD. | Core Setup, DB Connection, Base Architecture, Auth (JWT), User CRUD cơ bản, Standard Response. | **Critical**. Cần senior review kỹ Base config và Response format để tránh refactor diện rộng sau này. |
| **2. Beta (Feature Complete)** | Hoàn thiện nghiệp vụ, xử lý file, phân quyền sâu, validate dữ liệu. | RBAC, Upload File, Advanced Query (Paginate/Filter/Search), Soft Delete, Swagger API Docs. | **High Risk** ở Upload File (memory leak) và logic Query phức tạp (slow query). |
| **3. Production Ready** | Tối ưu bảo mật, hiệu năng, đóng gói deploy, logs. | Rate Limiting, Security Headers, Dockerize, Centralized Logging, Unit Tests (Core modules), CI/CD. | **High Effort** ở Unit Test và setup CI/CD pipeline. Cần rà soát Security kỹ. |
| **4. Scaling (Tương lai)** | Chịu tải cao, xử lý bất đồng bộ, tracking. | Redis Cache, Queue (RabbitMQ/Bull), Background Jobs (Cron), APM Monitoring (Prometheus/Grafana). | **Optional/Recommended** tùy lượng user. Risk cao ở tính toàn vẹn dữ liệu khi dùng Cache. |

---

## 🗄️ PHẦN 2: CHI TIẾT BACKLOG (ISSUES TO GIT)

Dưới đây là các Issue mẫu mang tính chuẩn mực cao nhất. Bạn có thể clone format này cho các thực thể (Entity) khác trong hệ thống.

### 📌 EPIC 1: CORE SETUP & SHARED INFRASTRUCTURE

*Nền móng hệ thống. Phải hoàn thành đầu tiên (Critical Path).*

#### **[CORE-01] Init Project Architecture & Coding Convention**

* **Priority:** Critical 🔴
* **Dependency:** None
* **Description:** Khởi tạo project Node.js/REST API. Thiết lập cấu trúc thư mục chuẩn (Controller, Service, Repository, Middleware) và config các công cụ linting để đồng bộ code style cho toàn team.
* **Technical Requirements:** Node.js, Express/NestJS, ESLint, Prettier, Husky (Pre-commit hook).
* **Checklist:**
* [ ] Khởi tạo `package.json` và cài đặt core dependencies.
* [ ] Tổ chức Folder Architecture (Routes, Controllers, Services, Repositories, Utils).
* [ ] Config `ESLint` và `Prettier` (chống conflict format).
* [ ] Setup `Husky` (chạy linter & type check trước khi commit).
* [ ] Setup quản lý Environment Variables (dotenv, joi/zod validation cho ENV).


* **Acceptance Criteria (DoD):**
* Dev clone repo về chạy `npm install` và `npm run dev` không lỗi.
* Cố tình viết code sai format, khi `git commit` Husky phải block lại.
* Hệ thống báo lỗi crash ngay khi start nếu thiếu file `.env` hoặc thiếu các key bắt buộc (PORT, DB_URL).



#### **[CORE-02] Implement Base Error Handler & Standard Response Format**

* **Priority:** Critical 🔴
* **Dependency:** [CORE-01]
* **Description:** Chuẩn hóa toàn bộ format trả về của API cho Client, bao gồm cả Success và Error để FE dễ dàng parse dữ liệu và hiển thị Toast/Alert. Tránh tình trạng mỗi API trả về một kiểu JSON khác nhau.
* **Technical Requirements:** Custom Error Classes, Express Global Error Middleware.
* **Checklist:**
* [ ] Tạo class `AppError` kế thừa `Error` gốc (chứa statusCode, isOperational).
* [ ] Viết hàm `successResponse` formatter.
* [ ] Viết Global Error Middleware catch toàn bộ unhandled routes (404) và exceptions (500).


* **Acceptance Criteria:**
* Success format bắt buộc: `{ "status": 200, "message": "...", "data": {}, "meta": {} // dùng cho pagination }`
* Error format bắt buộc: `{ "status": 400/500, "error_code": "INVALID_INPUT", "message": "...", "details": [] // field validation errors }`
* Log lỗi 500 ra console, nhưng ẩn stack trace khi ở môi trường `NODE_ENV=production`.



#### **[CORE-03] Database Connection & Setup Unit of Work / Repository Base**

* **Priority:** Critical 🔴
* **Dependency:** [CORE-01]
* **Description:** Thiết lập kết nối DB pool. Implement Base Repository Pattern để dùng chung các method CRUD cơ bản, giảm duplicate code. Hỗ trợ Database Transaction.
* **Technical Requirements:** ORM/Query Builder (Prisma/TypeORM/Sequelize), Connection Pooling.
* **Checklist:**
* [ ] Setup DB connection với Connection Pool.
* [ ] Viết BaseRepository class với hàm `findById`, `create`, `update`, `softDelete`.
* [ ] Viết helper cho DB Transaction.
* [ ] Viết script Seeder khởi tạo admin account mặc định.


* **Acceptance Criteria:**
* Connect DB thành công, tự động reconnect nếu rớt mạng.
* Nếu dùng Transaction, khi có lỗi ở query số 2, query số 1 phải được rollback thành công.



---

### 📌 EPIC 2: AUTHENTICATION & SECURITY

*Bảo mật và phân quyền hệ thống.*

#### **[AUTH-01] Implement JWT Authentication (Access & Refresh Token)**

* **Priority:** Critical 🔴
* **Dependency:** [CORE-03]
* **Description:** Xây dựng luồng đăng nhập an toàn sử dụng cơ chế Access Token (sống ngắn) và Refresh Token (sống dài, lưu DB/Redis) để giữ session user mượt mà mà vẫn bảo mật.
* **Technical Requirements:** `jsonwebtoken`, `bcrypt` (hash password).
* **Checklist:**
* [ ] API `POST /auth/login`: Hash check, generate 2 tokens.
* [ ] API `POST /auth/refresh-token`: Verify refresh token, cấp access token mới.
* [ ] API `POST /auth/logout`: Revoke/Xóa refresh token.
* [ ] Middleware `requireAuth`: Verify access token và gắn `req.user`.


* **Acceptance Criteria:**
* Password phải được hash bcrypt (salt round >= 10) trước khi lưu. Không bao giờ query trả về password.
* Access Token hết hạn (VD: 15p), gọi API trả về HTTP 401 (Unauthorized).
* Refresh Token bị trộm (hoặc user đã logout), không thể dùng để lấy token mới (HTTP 403 Forbidden).



#### **[AUTH-02] Implement Role-Based Access Control (RBAC) Middleware**

* **Priority:** High 🟠
* **Dependency:** [AUTH-01]
* **Description:** Phân quyền API dựa trên Role của user (Admin, Manager, User) để ngăn chặn truy cập trái phép.
* **Technical Requirements:** Custom Express Middleware.
* **Checklist:**
* [ ] Middleware `requireRole(['admin', 'manager'])`.
* [ ] Tích hợp middleware này vào các route nhạy cảm (VD: Xóa user).


* **Acceptance Criteria:**
* User role "User" gọi API yêu cầu quyền "Admin" -> Trả về HTTP 403 (Forbidden) kèm message "Bạn không có quyền thực hiện hành động này".



---

### 📌 EPIC 3: CORE FEATURES & UTILITIES

*Các API phục vụ nghiệp vụ chính.*

#### **[FEAT-01] Advanced CRUD cho Users (Pagination, Filter, Search, Sort)**

* **Priority:** High 🟠
* **Dependency:** [AUTH-02], [CORE-02]
* **Description:** Xây dựng API lấy danh sách User cho Admin, hỗ trợ đầy đủ các tính năng truy vấn để làm Data Table trên Frontend.
* **Technical Requirements:** Query string parsing.
* **Checklist:**
* [ ] API `GET /users`.
* [ ] Xử lý Pagination (page, limit). Trả về metadata (totalItem, totalPage).
* [ ] Xử lý Search (search by name, email dùng LIKE/ILIKE).
* [ ] Xử lý Sort (sort by createdAt:desc, name:asc).
* [ ] Xử lý Soft Delete (chỉ lấy user có `deletedAt = null`).


* **Acceptance Criteria:**
* Tốc độ phản hồi < 200ms cho 10,000 records (Yêu cầu DB có Index ở cột email, name).
* Nếu truyền `page=-1` hoặc string lộn xộn, trả về 400 Bad Request kèm validation error.



#### **[FEAT-02] File Upload Service & Image Optimization**

* **Priority:** High 🟠
* **Dependency:** [CORE-01]
* **Description:** Xây dựng module upload ảnh avatar/document an toàn, hỗ trợ upload lên Cloud Storage.
* **Technical Requirements:** `multer`, AWS S3 / Cloudinary / MinIO, `sharp` (nén ảnh).
* **Checklist:**
* [ ] Middleware multer chặn các file không phải ảnh (chỉ nhận jpg, png, webp). Giới hạn size < 5MB.
* [ ] Tích hợp `sharp` nén ảnh và convert sang `.webp` trước khi lưu.
* [ ] Viết UploadService đẩy file lên S3/Cloud storage và lấy URL trả về.


* **Acceptance Criteria:**
* Upload file `.exe` hoặc `.pdf` giả mạo đuôi `.jpg` phải bị reject (HTTP 415).
* Upload ảnh 10MB -> HTTP 413 Payload Too Large.
* File lưu trên cloud, API trả về direct URL của file đó.



---

### 📌 EPIC 4: DEVOPS, TESTING & MONITORING

*Đưa dự án lên môi trường Production chuẩn Enterprise.*

#### **[OPS-01] Request Input Validation Layer**

* **Priority:** Critical 🔴
* **Dependency:** [CORE-02]
* **Description:** Không bao giờ tin tưởng dữ liệu từ Client. Validate toàn bộ body, query, params trước khi chạy logic.
* **Technical Requirements:** Joi / Zod / class-validator.
* **Checklist:**
* [ ] Viết validation schema cho toàn bộ các API CUD (Create, Update, Delete).
* [ ] Tích hợp schema vào route middleware.


* **Acceptance Criteria:**
* Truyền thiếu trường `email` lúc tạo user -> Chặn ngay lập tức ở middleware, không hit vào Database, trả về 400 kèm mảng lỗi cụ thể cho FE.



#### **[OPS-02] Centralized Logging & Audit Logs**

* **Priority:** Recommended 🔵
* **Dependency:** [CORE-01]
* **Description:** Ghi log hệ thống để dễ debug trên server. Lưu vết các thao tác thay đổi dữ liệu quan trọng (Audit Log).
* **Technical Requirements:** `winston` hoặc `pino`, `morgan` (HTTP req log).
* **Checklist:**
* [ ] Setup Winston ghi log ra file (luân phiên file theo ngày - daily rotate).
* [ ] Setup Morgan để log time và status code của mọi API request.
* [ ] (Optional) Bắn log error (level: error) thẳng về Telegram/Slack của dev team.


* **Acceptance Criteria:**
* Lỗi 500 phải được ghi vào file `error.log` kèm stack trace.
* Log không được chứa thông tin nhạy cảm (phải che password, token trước khi ghi log).



#### **[OPS-03] Swagger / OpenAPI API Documentation**

* **Priority:** Recommended 🔵
* **Dependency:** [CORE-01]
* **Description:** Tự động sinh tài liệu API để Frontend/Mobile dev xem và test trực tiếp, không cần hỏi BE.
* **Technical Requirements:** `swagger-ui-express`, `swagger-jsdoc`.
* **Checklist:**
* [ ] Khởi tạo `/api-docs`.
* [ ] Viết Swagger JSDoc cho API Auth và User (làm mẫu).
* [ ] Config securityBearer trong Swagger để FE có thể dán Token vào test.


* **Acceptance Criteria:**
* Truy cập `/api-docs` hiện ra giao diện Swagger đẹp mắt.
* Swagger chỉ public ở môi trường `development` hoặc `staging`. Môi trường `production` phải block route này.



#### **[OPS-04] Security Hardening & Rate Limiting**

* **Priority:** High 🟠
* **Dependency:** [CORE-01]
* **Description:** Bảo vệ server khỏi các đợt tấn công DDoS nhỏ, Brute-force mật khẩu và các lỗ hổng HTTP.
* **Technical Requirements:** `helmet`, `express-rate-limit`, `cors`.
* **Checklist:**
* [ ] Setup `helmet` để ẩn các header nhạy cảm (vd: `X-Powered-By: Express`).
* [ ] Setup CORS chỉ allow các domain của Frontend.
* [ ] Setup Rate Limit chung: 100 requests / 1 phút / 1 IP.
* [ ] Setup Rate Limit khắt khe cho route `/auth/login`: max 5 lần sai pass / 15 phút.


* **Acceptance Criteria:**
* Gọi API quá số lần quy định bị chặn kèm mã HTTP 429 (Too Many Requests).
* Server không bị crash khi quét bằng các tool scan vuln cơ bản.



#### **[OPS-05] Dockerize & CI/CD Pipeline Init**

* **Priority:** High 🟠
* **Dependency:** [CORE-01]
* **Description:** Đóng gói ứng dụng để chạy được trên mọi môi trường. Tự động hóa việc test và deploy.
* **Technical Requirements:** Docker, Docker Compose, GitHub Actions / GitLab CI.
* **Checklist:**
* [ ] Viết `Dockerfile` tối ưu nhiều step (Multi-stage build) để giảm size image.
* [ ] Viết `docker-compose.yml` chạy BE kết hợp với DB (Postgres/MySQL) và Redis cục bộ.
* [ ] Viết file CI (`.github/workflows/ci.yml`): Tự động chạy Linter và Unit Test khi có Pull Request.


* **Acceptance Criteria:**
* Run `docker-compose up` là dự án chạy hoàn chỉnh (cả DB và App) không cần cài Node.js trên máy host.
* Nếu Unit Test tạch, GitHub Actions báo dấu X đỏ và block không cho Merge Pull Request.



---

## 💡 ĐÁNH GIÁ CỦA ARCHITECT (ADVICE)

1. **High Risk Issues (Cần tập trung Review Code kỹ):**
* **[AUTH-01] Token Management:** Dễ dính lỗ hổng lộ token, lưu trữ token sai cách trên FE, hoặc lỗi logic khiến token hết hạn mà không cấp lại được.
* **[FEAT-02] Upload File:** Là nơi hacker dễ inject mã độc nhất, hoặc dễ gây quá tải ổ cứng, kẹt RAM (memory leak) nếu không stream file đúng cách.
* **Database Transaction:** Mọi API có nghiệp vụ tác động từ 2 bảng trở lên (ví dụ: Tạo User Profile + Gán Role) bắt buộc phải bọc trong Transaction. Cần review kỹ xem dev có quên commit hay rollback transaction hay không.


2. **Estimate Lớn (Cần chia nhỏ thành Sub-tasks):**
* Các tính năng **Advanced CRUD** (Search, Filter đa điều kiện). Nhìn có vẻ dễ, nhưng xử lý câu query động (Dynamic Query) tối ưu, không bị Full Table Scan trên DB là rất tốn thời gian. Bạn nên yêu cầu Dev chia nhỏ task Filter riêng, Search riêng, Sort riêng.


3. **Technical Debt:**
* Trong giai đoạn MVP, bạn có thể bỏ qua Redis Cache và Queue. Chấp nhận tốc độ API chậm một chút để đẩy nhanh tiến độ ra mắt. Hãy ghi nợ kỹ thuật (Tech Debt) và bù đắp chúng ở Phase 4 (Scaling). Dùng cache quá sớm sẽ gây lỗi "dữ liệu cũ" (stale data) rất đau đầu cho team QC.