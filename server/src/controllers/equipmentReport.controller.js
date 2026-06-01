import { sequelize, Equipment, EquipmentReport, Staff } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';

export const createEquipmentReport = catchAsync(async (req, res, next) => {
  const { equipmentId, description } = req.body;

  const t = await sequelize.transaction();

  try {
    const equipment = await Equipment.findByPk(equipmentId, { transaction: t });
    if (!equipment) {
      throw new AppError('Thiết bị không tồn tại!', 404);
    }

    const accountId = req.user?.accountId;
    if (!accountId) {
      throw new AppError('Thiếu thông tin người dùng từ token!', 401);
    }

    // Token hiện tại chỉ chứa accountId -> suy ra staffId để lưu reporterId
    const reporter = await Staff.findOne({
      where: { accountId },
      attributes: ['staffId'],
      transaction: t,
    });

    if (!reporter) {
      throw new AppError('Không tìm thấy hồ sơ nhân sự cho tài khoản này!', 403);
    }

    const report = await EquipmentReport.create(
      {
        equipmentId,
        reporterId: reporter.staffId,
        description: description ?? null,
        resolveStatus: 'pending',
      },
      { transaction: t },
    );

    await equipment.update(
      {
        usageStatus: 'maintenance',
      },
      { transaction: t },
    );

    await t.commit();

    return successResponse(res, 201, 'Báo lỗi thiết bị thành công!', {
      report,
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

export const resolveEquipmentReport = catchAsync(async (req, res, next) => {
  const reportId = req.params.id;
  const { resolveStatus } = req.body;

  const t = await sequelize.transaction();

  try {
    const report = await EquipmentReport.findByPk(reportId, { transaction: t });
    if (!report) {
      throw new AppError('Báo lỗi thiết bị không tồn tại!', 404);
    }

    await report.update(
      {
        resolveStatus,
      },
      { transaction: t },
    );

    const equipment = await Equipment.findByPk(report.equipmentId, { transaction: t });
    if (!equipment) {
      throw new AppError('Thiết bị liên quan không tồn tại!', 404);
    }

    await equipment.update(
      {
        usageStatus: 'normal',
      },
      { transaction: t },
    );

    await t.commit();

    return successResponse(res, 200, 'Cập nhật trạng thái sửa chữa thành công!', {
      report,
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});
