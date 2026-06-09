import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class SubscriptionPlan extends Model {}

SubscriptionPlan.init(
  {
    planId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memberId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    packageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    billId: {
      type: DataTypes.UUID,
      allowNull: true, // Cho phép null để tạo gói trước khi thanh toán
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    remainingSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending_payment", "active", "expired", "cancelled"),
      defaultValue: "pending_payment",
    },
  },
  {
    sequelize,
    modelName: "SubscriptionPlan",
    tableName: "subscription_plans",
    underscored: true,
    timestamps: true,
  },
);

export default SubscriptionPlan;
