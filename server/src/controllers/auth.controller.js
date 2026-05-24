import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize, Account, Staff, Member } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { successResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Tìm account trong DB theo email;
    const account = await Account.findOne({ where: { email } });
    if(!account) {
        return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
    }

    // 2. So sánh mật khẩu client gửi lên với mật khẩu hash trong DB
    const isPasswordMatch = await bcrypt.compare(password, account.password);
    if(!isPasswordMatch) {
        return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
    }

    let role = null;
    let profile = null;

    // Ưu tiên tìm Staff trước
    const staffProfile = await Staff.findOne({ where: { accountId: account.accountId } });
    if(staffProfile) {
        role = staffProfile.position;
        profile = staffProfile;
    } else {
        // Không phải Staff thì tìm Member
        const memberProfile = await Member.findOne({ where: {accountId: account.accountId } });
        if(memberProfile) {
            role = 'member';
            profile = memberProfile;
        }
    }

    // Nếu không tìm thấy ở cả 2 bảng Member và Staff
    if(!role) {
        return next(new AppError('Tài khoản chưa được thiết lập hồ sơ!', 403));
    }

    // 4. Khởi tạo JWT token
    const token = jwt.sign(
        {
            accountId: account.accountId,
            role: role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    // 5. Trả kết quả
    successResponse(res, 200, 'Đăng nhập thành công!', {
        token,
        user: {
            accountId: account.accountId,
            email: account.email,
            role: role,
            name: profile.staffName || profile.memberName
        }
    });
});

export const register = catchAsync(async (req, res, next) => {
    const { email, password, memberName, phoneNumber } = req.body;

    // 1. Kiểm tra xem Email đã tồn tại chưa
    const existingAccount = await Account.findOne({ where: { email } });
    if(existingAccount) {
        return next(new AppError('Email này đã được đăng ký', 409));

    }

    // 2. Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingPhone = await Member.findOne({ where: { phoneNumber } });
    if(existingPhone) {
        return next(new AppError('Số điện thoại này đã được sử dụng', 409));
    }

    // 3. Khởi tạo DB Transaction
    const transaction = await sequelize.transaction();

    try {
        // 3.1. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3.2. Tạo bản ghi Account trước
        const newAccount = await Account.create(
            { email, password: hashedPassword },
            { transaction }
        );

        // 3.3. Tạo bản ghi Member liên kết với Account vừa tạo
        const newMember = await Member.create(
            {
                accountId: newAccount.accountId,
                memberName,
                phoneNumber
            },
            { transaction }
        );

        // 3.4. Nếu cả 2 bước thành công -> commit
        await transaction.commit();

        successResponse(res, 201, 'Đăng ký tài khoản thành công!', {
            accountId: newAccount.accountId,
            email: newAccount.email,
            memberName: newAccount.memberName
        });
    } catch (error) {
        await transaction.rollback();
        return next(new AppError('Đã xảy ra lỗi trong quá trình tạo tài khoản', 500));
    }
});

