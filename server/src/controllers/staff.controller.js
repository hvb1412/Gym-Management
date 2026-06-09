import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sequelize, Account, Staff, StaffWorkLog } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/response.js";
import catchAsync from "../utils/catchAsync.js";

// Helper function to map frontend role to DB position
const mapRoleToPosition = (roleStr) => {
  if (roleStr === "Huấn luyện viên") return "pt";
  if (roleStr === "Chủ phòng tập") return "owner";
  return "manager"; // "Nhân viên quản lý", "Lễ tân", etc.
};

// Helper function to map DB position to frontend role
const mapPositionToRole = (position) => {
  if (position === "pt") return "Huấn luyện viên";
  if (position === "owner") return "Chủ phòng tập";
  return "Nhân viên quản lý";
};

// Lấy danh sách nhân sự
export const getAllStaffs = catchAsync(async (req, res, next) => {
  const staffs = await Staff.findAll({
    include: [
      {
        model: Account,
        attributes: ["email"], // Chỉ lấy email
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Chuyển đổi định dạng cho frontend
  const formattedStaffs = staffs.map((staff) => {
    // Format date string from YYYY-MM-DD to DD/MM/YYYY for UI if needed
    const joinDate = new Date(staff.registerDate);
    const joinStr = `${joinDate.getDate().toString().padStart(2, '0')}/${(joinDate.getMonth() + 1).toString().padStart(2, '0')}/${joinDate.getFullYear()}`;

    return {
      code: staff.staffCode,
      name: staff.staffName,
      role: mapPositionToRole(staff.position),
      email: staff.Account?.email || "",
      phone: staff.phoneNumber,
      join: joinStr,
      status: staff.status,
      // extra fields
      gender: staff.gender,
      dateOfBirth: staff.dateOfBirth,
      address: staff.address,
    };
  });

  successResponse(res, 200, "Lấy danh sách nhân sự thành công!", formattedStaffs);
});

// Lấy chi tiết nhân sự
export const getStaffByCode = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const staff = await Staff.findOne({
    where: { staffCode: code },
    include: [{ model: Account, attributes: ["email"] }],
  });

  if (!staff) {
    return next(new AppError("Không tìm thấy nhân sự", 404));
  }

  const joinDate = new Date(staff.registerDate);
  const joinStr = `${joinDate.getDate().toString().padStart(2, '0')}/${(joinDate.getMonth() + 1).toString().padStart(2, '0')}/${joinDate.getFullYear()}`;

  successResponse(res, 200, "Lấy chi tiết nhân sự thành công!", {
    code: staff.staffCode,
    name: staff.staffName,
    role: mapPositionToRole(staff.position),
    email: staff.Account?.email || "",
    phone: staff.phoneNumber,
    join: joinStr,
    status: staff.status,
    gender: staff.gender,
    dateOfBirth: staff.dateOfBirth,
    address: staff.address,
  });
});

// Tạo nhân sự mới
export const createStaff = catchAsync(async (req, res, next) => {
  const { name, role, email, phone, dateOfBirth, gender, address } = req.body;
  let { password } = req.body;

  // Kiểm tra email
  if (email) {
    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) return next(new AppError("Email đã được sử dụng", 409));
  }

  // Kiểm tra số điện thoại
  if (phone) {
    const existingPhone = await Staff.findOne({ where: { phoneNumber: phone } });
    if (existingPhone) return next(new AppError("Số điện thoại đã được sử dụng", 409));
  }

  // Mật khẩu mặc định nếu rỗng
  if (!password || password.trim() === "") {
    password = "123456";
  }

  const transaction = await sequelize.transaction();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Tạo account
    let newAccount = null;
    if (email) {
      newAccount = await Account.create(
        { email, password: hashedPassword },
        { transaction }
      );
    }

    // 2. Tạo staff code ngẫu nhiên (NS + 4 chữ số)
    let staffCode;
    let isUnique = false;
    while (!isUnique) {
      staffCode = "NS" + Math.floor(1000 + Math.random() * 9000);
      const exist = await Staff.findOne({ where: { staffCode }, transaction });
      if (!exist) isUnique = true;
    }

    // 3. Tạo Staff
    const newStaff = await Staff.create(
      {
        accountId: newAccount ? newAccount.accountId : null,
        staffCode,
        staffName: name,
        phoneNumber: phone,
        position: mapRoleToPosition(role),
        dateOfBirth: dateOfBirth || null,
        gender: gender || "Nam",
        address: address || "",
      },
      { transaction }
    );

    await transaction.commit();

    successResponse(res, 201, "Thêm nhân sự thành công!", {
      code: newStaff.staffCode,
      name: newStaff.staffName,
    });
  } catch (error) {
    await transaction.rollback();
    return next(new AppError("Lỗi hệ thống khi tạo nhân sự", 500));
  }
});

// Cập nhật nhân sự
export const updateStaff = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const { name, role, email, phone, dateOfBirth, gender, address, status, password } = req.body;

  const staff = await Staff.findOne({ where: { staffCode: code }, include: [Account] });
  if (!staff) return next(new AppError("Không tìm thấy nhân sự", 404));

  // Kiểm tra số điện thoại bị trùng với người khác
  if (phone && phone !== staff.phoneNumber) {
    const existingPhone = await Staff.findOne({ where: { phoneNumber: phone } });
    if (existingPhone) return next(new AppError("Số điện thoại đã được sử dụng", 409));
  }

  const transaction = await sequelize.transaction();
  try {
    // Cập nhật tài khoản nếu có Account
    if (staff.Account && (email || password)) {
      if (email && email !== staff.Account.email) {
        const existEmail = await Account.findOne({ where: { email } });
        if (existEmail) {
          await transaction.rollback();
          return next(new AppError("Email đã được sử dụng", 409));
        }
        staff.Account.email = email;
      }
      if (password && password.trim() !== "") {
        staff.Account.password = await bcrypt.hash(password, 10);
      }
      await staff.Account.save({ transaction });
    }

    // Cập nhật staff
    staff.staffName = name || staff.staffName;
    staff.phoneNumber = phone || staff.phoneNumber;
    if (role) staff.position = mapRoleToPosition(role);
    if (dateOfBirth) staff.dateOfBirth = dateOfBirth;
    if (gender) staff.gender = gender;
    if (address !== undefined) staff.address = address;
    if (status) staff.status = status;

    await staff.save({ transaction });
    await transaction.commit();

    successResponse(res, 200, "Cập nhật nhân sự thành công!");
  } catch (error) {
    await transaction.rollback();
    return next(new AppError("Lỗi hệ thống khi cập nhật nhân sự", 500));
  }
});

// Xóa nhân sự (soft delete)
export const deleteStaff = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const staff = await Staff.findOne({ where: { staffCode: code } });

  if (!staff) return next(new AppError("Không tìm thấy nhân sự", 404));

  staff.status = "Đã vô hiệu hóa";
  await staff.save();

  successResponse(res, 200, "Đã vô hiệu hóa nhân sự thành công!");
});

// Lấy lịch chấm công của 1 nhân sự theo tháng
export const getStaffAttendance = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const { month, year } = req.query;

  if (!month || !year) {
    return next(new AppError("Vui lòng cung cấp month và year", 400));
  }

  const staff = await Staff.findOne({ where: { staffCode: code } });
  if (!staff) return next(new AppError("Không tìm thấy nhân sự", 404));

  // Determine the date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Format dates to YYYY-MM-DD correctly in local time
  const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const logs = await StaffWorkLog.findAll({
    where: {
      staffId: staff.staffId,
      workDate: {
        [Op.between]: [startStr, endStr]
      }
    },
    order: [['workDate', 'ASC']]
  });

  successResponse(res, 200, "Lấy dữ liệu chấm công thành công", logs);
});

