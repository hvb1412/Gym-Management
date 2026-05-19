### 🏗️ EPIC 0: CORE INFRASTRUCTURE (Nền tảng hệ thống)

#### **[CORE-01] Thiết lập Base Architecture, Global Error Handler & Standard Response**

* **Description:** Khởi tạo luồng xử lý dữ liệu chung cho toàn bộ ứng dụng. Bắt buộc tất cả các API khi trả kết quả về cho Frontend (dù thành công hay thất bại) đều phải tuân theo một định dạng JSON duy nhất. Đồng thời, thiết lập "lưới an toàn" để bắt toàn bộ các lỗi crash app (Exception) và chuyển nó thành HTTP Response thân thiện.
* **Technical Requirements:** Node.js, Express Middleware, Custom Error Class.
* **Checklist:**
* [ ] Tạo class `AppError` kế thừa từ `Error` gốc của Node.js (cần bổ sung thêm thuộc tính `statusCode` và `isOperational`).
* [ ] Viết hàm `successResponse(res, statusCode, message, data)` để chuẩn hóa format trả về khi gọi API thành công.
* [ ] Viết Middleware `GlobalErrorHandler` để hứng mọi lỗi từ hệ thống (lỗi 500, lỗi DB) và từ `AppError` (lỗi nghiệp vụ do dev chủ động quăng ra).
* [ ] Viết Middleware xử lý lỗi 404 (Route Not Found) cho các endpoint không tồn tại.


* **Acceptance Criteria:**
* Toàn bộ API khi thành công **bắt buộc** có format:
```json
{ "success": true, "message": "...", "data": {...} }

```


* Toàn bộ API khi có lỗi **bắt buộc** có format:
```json
{ "success": false, "message": "Lý do lỗi..." }

```


* Khi ném ra một lỗi bất kỳ trong Controller (VD: `throw new AppError('Không tìm thấy user', 404)`), app không được crash mà phải trả về đúng mã lỗi 404 cho Client.


* **Priority:** Critical 🔴
* **Dependency:** Không (Phải làm đầu tiên)

#### **[CORE-02] Thiết lập Request Validation Layer (Kiểm duyệt dữ liệu đầu vào)**

* **Description:** Nguyên tắc bảo mật số 1: "Không bao giờ tin tưởng dữ liệu từ Client gửi lên". Task này yêu cầu xây dựng một lớp khiên bảo vệ (Middleware) đứng trước tất cả các Controller. Nó sẽ kiểm tra tính hợp lệ của `req.body`, `req.query`, `req.params` trước khi cho phép dữ liệu đi vào xử lý logic và chạm tới Database.
* **Technical Requirements:** Thư viện validation (`Joi` hoặc `Zod`), Express Middleware.
* **Checklist:**
* [ ] Cài đặt thư viện `Joi` (hoặc `Zod`).
* [ ] Viết một hàm Middleware tổng quát `validateRequest(schema)` có khả năng nhận vào một schema cấu trúc dữ liệu và báo lỗi nếu dữ liệu thực tế không khớp.
* [ ] Tạo thư mục `src/validations/` để chứa các file định nghĩa luật (rules).
* [ ] Áp dụng thử validation cho API Login ở task `[BE-01]` (ví dụ: bắt buộc có email đúng định dạng, bắt buộc có password).


* **Acceptance Criteria:**
* Nếu Client gửi lên một payload thiếu trường bắt buộc hoặc sai định dạng (VD: gửi email là "12345"), API phải bị chặn ngay lập tức.
* Middleware phải trả về HTTP Code `400 Bad Request` kèm theo thông báo lỗi chi tiết (trường nào sai, sai cái gì) mà không cần phải viết lệnh `if/else` thủ công trong Controller.


* **Priority:** Critical 🔴
* **Dependency:** [CORE-01] (Cần format response của CORE-01 để trả lỗi 400 ra cho đẹp)

### 🔐 EPIC 1: AUTHENTICATION & AUTHORIZATION (Xác thực & Phân quyền)

#### **[BE-01] API Đăng nhập & Khởi tạo JWT Token**

* **Description:** Xây dựng cổng đăng nhập chung cho cả 4 role (Owner, Manager, PT, Member). Hệ thống cần trả về Token và thông tin cơ bản của User để FE điều hướng đúng Dashboard.
* **Technical Requirements:** `bcrypt` (so sánh hash), `jsonwebtoken`.
* **Checklist:**
* [ ] Khởi tạo API `POST /api/auth/login`.
* [ ] Query bảng `Account` theo `email`.
* [ ] Compare password. Nếu đúng, query tiếp bảng `Staff` hoặc `Member` dựa trên `accountId` để lấy Role.
* [ ] Sinh Access Token chứa `accountId` và `role`.


* **Acceptance Criteria:**
* Nhập sai email hoặc password trả về HTTP 401 (Sai thông tin đăng nhập).
* Response trả về token kèm payload định danh rõ role của user.


* **Priority:** Critical 🔴
* **Dependency:** Không

#### **[BE-02] Middleware Phân quyền (RBAC) & API Đổi mật khẩu**

* **Description:** Bảo vệ các API nghiệp vụ thông qua Role, và cung cấp tính năng đổi mật khẩu an toàn (yêu cầu mật khẩu cũ).
* **Technical Requirements:** Express Middleware.
* **Checklist:**
* [ ] Viết middleware `verifyToken` để giải mã JWT.
* [ ] Viết middleware `checkRole([...roles])`.
* [ ] Khởi tạo API `PUT /api/auth/change-password` (yêu cầu: `oldPassword`, `newPassword`).


* **Acceptance Criteria:**
* User không truyền Token trên Header -> HTTP 401.
* Member cố tình gọi API của Owner -> HTTP 403 Forbidden.
* Đổi mật khẩu: Nếu `oldPassword` không khớp với DB -> Reject 400. Mật khẩu mới phải được hash trước khi lưu.


* **Priority:** High 🟠
* **Dependency:** [BE-01]

---

### 🏢 EPIC 2: FACILITY MANAGEMENT (Quản lý Cơ sở vật chất)

#### **[BE-03] API CRUD Quản lý danh sách Phòng tập (Rooms)**

* **Description:** Cho phép Chủ phòng tạo và cấu hình các phòng tập (Gym, Yoga, Fitness).
* **Technical Requirements:** Bảng `Room`.
* **Checklist:**
* [ ] `POST /api/rooms`: Tạo phòng.
* [ ] `GET /api/rooms`: Lấy danh sách (Có filter theo `roomType`, `operatingStatus`).
* [ ] `PUT /api/rooms/:id`: Cập nhật thông tin/trạng thái.


* **Acceptance Criteria:**
* Tên phòng không được để trống.
* Cập nhật trạng thái thành `closed` phải thành công.


* **Priority:** High 🟠
* **Dependency:** [BE-02]

#### **[BE-04] API CRUD Quản lý Thiết bị (Equipment & EquipmentType)**

* **Description:** Phân bổ thiết bị vào các phòng tập. Chủ phòng có thể nhập thiết bị mới và theo dõi trạng thái.
* **Technical Requirements:** Bảng `EquipmentType`, `Equipment`, `Room`. Nối bảng (Include).
* **Checklist:**
* [ ] `POST /api/equipment-types`: Định nghĩa danh mục thiết bị (VD: Máy chạy bộ, Tạ đơn).
* [ ] `POST /api/equipments`: Nhập thiết bị cụ thể, gán `typeId` và phân bổ vào `roomId`.
* [ ] `GET /api/equipments`: Lấy danh sách, populate (include) tên Room và tên Type.


* **Acceptance Criteria:**
* Truyền sai `roomId` (không tồn tại trong DB) khi tạo thiết bị -> HTTP 400.


* **Priority:** High 🟠
* **Dependency:** [BE-03]

#### **[BE-05] API Báo lỗi & Cập nhật Trạng thái Bảo trì (Equipment Reports)**

* **Description:** Quản lý luồng báo lỗi thiết bị từ Nhân viên quản lý, giúp Chủ phòng nắm bắt tình hình hỏng hóc.
* **Technical Requirements:** Bảng `EquipmentReport`, Transaction.
* **Checklist:**
* [ ] `POST /api/equipment-reports`: Staff submit lỗi (cần `equipmentId`, `reporterId`).
* [ ] (Trong cùng Transaction) Update `usageStatus` của `Equipment` sang `maintenance`.
* [ ] `PUT /api/equipment-reports/:id`: Owner cập nhật trạng thái `resolveStatus` (đã sửa xong) -> Đổi trạng thái thiết bị lại thành `normal`.


* **Acceptance Criteria:**
* API tạo report bắt buộc phải chạy DB Transaction để đảm bảo tính toàn vẹn (vừa lưu report vừa đổi status thiết bị).


* **Priority:** Medium 🟡
* **Dependency:** [BE-04]

---

### 👥 EPIC 3: HR & STAFF MANAGEMENT (Nhân sự)

#### **[BE-06] API Quản lý Hồ sơ Nhân sự (Staff Accounts)**

* **Description:** Chủ phòng tạo tài khoản và hồ sơ cho Quản lý và PT.
* **Technical Requirements:** Bảng `Account`, `Staff`, DB Transaction.
* **Checklist:**
* [ ] `POST /api/staffs`: Nhận payload (email, mật khẩu, tên, SĐT, role).
* [ ] Tạo bản ghi `Account` (Hash pass). Lấy `accountId` tạo bản ghi `Staff`.
* [ ] `GET /api/staffs`: Lấy danh sách nhân sự (filter theo `position`).


* **Acceptance Criteria:**
* Transaction rollback nếu email hoặc SĐT đã tồn tại (Duplicate Key).


* **Priority:** High 🟠
* **Dependency:** [BE-02]

#### **[BE-07] API Chấm công Nhân sự (Work Logs)**

* **Description:** Ghi nhận giờ làm việc thực tế của nhân viên mỗi ngày.
* **Technical Requirements:** Bảng `StaffWorkLog`.
* **Checklist:**
* [ ] `POST /api/work-logs/check-in`: Lấy `staffId` từ Token, ghi nhận thời gian hiện tại vào `checkInTime`, gán `workDate` là hôm nay.
* [ ] `PUT /api/work-logs/check-out`: Cập nhật `checkOutTime`.


* **Acceptance Criteria:**
* Mỗi Staff chỉ được check-in 1 lần/ngày. Lần gọi check-in thứ 2 trong cùng một ngày phải bị block (HTTP 409 Conflict).


* **Priority:** Medium 🟡
* **Dependency:** [BE-06]

---

### 💳 EPIC 4: PACKAGES, MEMBERS & BILLING (Gói tập & Hội viên)

#### **[BE-08] API Thiết lập Gói tập (Subscription Packages)**

* **Description:** Owner định nghĩa các sản phẩm/gói dịch vụ của phòng gym.
* **Technical Requirements:** Bảng `SubscriptionPackage`.
* **Checklist:**
* [ ] `POST /api/packages`: Tạo gói (Tên, Loại: Ngày/Tháng/Buổi, Có PT, VIP, Số buổi, Giá).
* [ ] `GET /api/packages`: Hiển thị danh sách cho Hội viên chọn (chỉ lấy gói đang active).


* **Acceptance Criteria:**
* Nếu `packageType` là "theo buổi", bắt buộc client phải gửi lên `numberOfWorkout` > 0.


* **Priority:** High 🟠
* **Dependency:** [BE-02]

#### **[BE-09] API Tạo hồ sơ Hội viên (Members)**

* **Description:** Quản lý tạo tài khoản cho hội viên mới.
* **Technical Requirements:** Bảng `Account`, `Member`, DB Transaction.
* **Checklist:**
* [ ] `POST /api/members`: Manager tạo hồ sơ (kèm hash password account).
* [ ] `GET /api/members`: Danh sách hội viên (hỗ trợ search theo SĐT hoặc Tên).


* **Acceptance Criteria:**
* Email và Số điện thoại không được trùng lặp với bất kỳ Account/Member nào khác trong hệ thống.


* **Priority:** Critical 🔴
* **Dependency:** [BE-02]

#### **[BE-10] API Đăng ký Gói tập & Thanh toán (Luồng Kế toán)**

* **Description:** Ghi nhận giao dịch mua gói tập. Đây là luồng nghiệp vụ phức tạp nhất.
* **Technical Requirements:** Bảng `SubscriptionPlan`, `Bill`, `SubscriptionPackage`. DB Transaction.
* **Checklist:**
* [ ] `POST /api/subscriptions`: Tạo gói chờ thanh toán (`status: pending_payment`, `billId: null`).
* [ ] Tính toán ngày hết hạn (`expireDate`) dựa trên `duration` của Package. Tính số buổi còn lại nếu là gói theo buổi.
* [ ] `POST /api/subscriptions/:id/pay`: Ghi nhận thanh toán. Tạo `Bill` (số tiền = giá gói). Update `SubscriptionPlan` (cập nhật `billId` vừa tạo, đổi `status` thành `active`).


* **Acceptance Criteria:**
* Toàn bộ bước thanh toán (`/pay`) phải nằm trong Transaction.
* Không cho phép thanh toán 1 `SubscriptionPlan` 2 lần.


* **Priority:** Critical 🔴
* **Dependency:** [BE-08], [BE-09]

---

### 🏋️‍♂️ EPIC 5: OPERATIONS & FEEDBACK (Vận hành)

#### **[BE-11] API Điểm danh & Theo dõi Lịch sử tập (Workout Logs)**

* **Description:** PT/Manager điểm danh hội viên, hệ thống tự động trừ số buổi (với gói buổi) hoặc từ chối nếu gói hết hạn.
* **Technical Requirements:** Bảng `WorkoutLog`, `Member`, `SubscriptionPlan`.
* **Checklist:**
* [ ] `POST /api/workout-logs`: Nhận `memberId`. Kiểm tra `SubscriptionPlan` có đang `active` hay không.
* [ ] Nếu là gói VIP/Theo buổi: Trừ đi 1 ở cột `remainingWorkout`.
* [ ] Tạo bản ghi `WorkoutLog` ghi lại giờ bắt đầu.
* [ ] `GET /api/workout-logs/me`: Cho phép Hội viên xem lịch sử tập của chính mình.


* **Acceptance Criteria:**
* Nếu gói hết hạn (expireDate < today) hoặc số buổi còn lại = 0 -> Reject 403.
* Hội viên chỉ xem được lịch sử của mình, không xem được của người khác.


* **Priority:** High 🟠
* **Dependency:** [BE-10]

#### **[BE-12] API Quản lý Phản hồi (Feedback)**

* **Description:** Kênh giao tiếp 2 chiều. Hội viên gửi ý kiến, Manager/Owner phản hồi.
* **Technical Requirements:** Bảng `Feedback`.
* **Checklist:**
* [ ] `POST /api/feedbacks`: Member gửi phản hồi (nội dung, loại).
* [ ] `PUT /api/feedbacks/:id/answer`: Owner/Manager update `answerContent`, `answerDate` và gán `answererId` từ token.


* **Acceptance Criteria:**
* API Trả lời không được sửa nội dung gốc (`feedbackContent`) do Member gửi lên.


* **Priority:** Medium 🟡
* **Dependency:** [BE-02]

---

### 📊 EPIC 6: ANALYTICS & REPORTS (Báo cáo Thống kê)

#### **[BE-13] API Thống kê Báo cáo Tổng quan Dashboard**

* **Description:** Phục vụ biểu đồ cho màn hình Chủ phòng tập.
* **Technical Requirements:** Sử dụng Sequelize Aggregation (`sum`, `count`), `Group By`.
* **Checklist:**
* [ ] `GET /api/reports/revenue`: Tổng doanh thu từ bảng `Bill`, nhóm theo Tháng/Năm.
* [ ] `GET /api/reports/members`: Đếm số lượng Hội viên mới đăng ký trong tháng hiện tại.
* [ ] `GET /api/reports/staff-performance`: Trả về danh sách PT kèm tổng số buổi tập họ đã hướng dẫn (dựa vào `WorkoutLog`).


* **Acceptance Criteria:**
* Dữ liệu trả về đúng định dạng mảng để FE đưa vào chart (VD: `[{ month: "01/2026", revenue: 50000000 }]`).


* **Priority:** High 🟠
* **Dependency:** [BE-10], [BE-11]

#### **[BE-14] API Quản lý Hồ sơ cá nhân (My Profile)**

* **Description:** Bất kỳ ai đăng nhập vào hệ thống (Member, PT, Manager) đều cần xem được thông tin cá nhân của mình và cập nhật các thông tin cơ bản (SĐT, Ngày sinh...) mà không cần nhờ đến Admin.
* **Technical Requirements:** Bảng `Account`, `Member`, `Staff`.
* **Checklist:**
* [ ] `GET /api/users/me`: Dựa vào `accountId` từ Token, query ra thông tin profile tương ứng (từ bảng Member hoặc Staff) và trả về cho FE hiển thị trang Cá nhân.
* [ ] `PUT /api/users/me`: Cho phép user tự cập nhật `phoneNumber`, `dateOfBirth` (Không cho phép tự đổi Role hay thông tin nhạy cảm).


* **Acceptance Criteria:**
* API cập nhật phải check trùng lặp Số điện thoại với người khác trong DB.


* **Priority:** High 🟠
* **Dependency:** [BE-01]

#### **[BE-15] API Tra cứu Lịch sử & Trạng thái Gói tập cá nhân (My Subscriptions)**

* **Description:** Theo yêu cầu mục 4.2 của tài liệu, hội viên đăng nhập vào ứng dụng phải thấy được mình đang dùng gói nào, hết hạn ngày nào.
* **Technical Requirements:** Bảng `SubscriptionPlan`, `SubscriptionPackage`, `Bill`.
* **Checklist:**
* [ ] `GET /api/subscriptions/me`: Trả về danh sách các gói tập mà user đang sở hữu.
* [ ] Cần `populate` (include) thông tin chi tiết của `SubscriptionPackage` (tên gói, quyền lợi) và thông tin `Bill` (đã thanh toán ngày nào).


* **Acceptance Criteria:**
* API phải tính toán và trả về một cờ (flag) rõ ràng cho FE biết gói nào đang `isActive: true` và gói nào đã `isExpired: true`.


* **Priority:** High 🟠
* **Dependency:** [BE-10]

#### **[BE-16] API Upload Ảnh & Files (Tùy chọn nhưng rất thực tế)**

* **Description:** Một phòng Gym thực tế cần có ảnh đại diện (Avatar) cho Hội viên/PT để check-in nhận diện, hoặc ảnh chụp thiết bị hỏng để báo cáo.
* **Technical Requirements:** Thư viện `multer`, Cloud Storage (như Cloudinary hoặc AWS S3).
* **Checklist:**
* [ ] Khởi tạo API `POST /api/upload`: Nhận file ảnh từ form-data.
* [ ] Validate dung lượng (< 5MB) và định dạng (chỉ nhận JPG/PNG).
* [ ] Upload lên Cloud và trả về URL để lưu vào các bảng khác.


* **Acceptance Criteria:**
* Bắn file PDF hoặc file thực thi `.exe` vào API phải bị reject ngay lập tức.


* **Priority:** Medium 🟡
* **Dependency:** Không

---