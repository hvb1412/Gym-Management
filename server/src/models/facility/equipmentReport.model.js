import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class EquipmentReport extends Model {}
EquipmentReport.init(
  {
    reportId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reportDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    resolveStatus: { type: DataTypes.STRING, defaultValue: "pending" },
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
