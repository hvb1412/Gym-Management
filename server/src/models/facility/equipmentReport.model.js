import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class EquipmentReport extends Model { }
EquipmentReport.init(
  {
    reportId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportDate: { type: DataTypes.STRING }, // Use string for DD/MM/YYYY support to match frontend quickly
    resolveStatus: { type: DataTypes.STRING, defaultValue: "Chờ xử lý" },
    errorDescription: { type: DataTypes.TEXT },
    reporterName: { type: DataTypes.STRING }, // since we might not have full auth context linked correctly
  },
  {
    sequelize,
    modelName: "EquipmentReport",
    tableName: "equipment_reports",
    underscored: true,
    timestamps: true,
  },
);

export default EquipmentReport;
