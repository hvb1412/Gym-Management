import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class EquipmentType extends Model {}
EquipmentType.init(
  {
    typeId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    typeCode: { type: DataTypes.STRING },
    equipmentName: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    brand: { type: DataTypes.STRING },
    warrantyDuration: { type: DataTypes.INTEGER }, // Tính theo tháng
    description: { type: DataTypes.TEXT },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "EquipmentType",
    tableName: "equipment_types",
    underscored: true,
    timestamps: true,
  },
);

export default EquipmentType;
