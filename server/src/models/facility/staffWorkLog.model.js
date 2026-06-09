import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class StaffWorkLog extends Model {}
StaffWorkLog.init(
  {
    workLogId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    workDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkInTime: { type: DataTypes.TIME },
    checkOutTime: { type: DataTypes.TIME },
    workStatus: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "StaffWorkLog",
    tableName: "staff_work_logs",
    underscored: true,
    timestamps: true,
  },
);

export default StaffWorkLog;
