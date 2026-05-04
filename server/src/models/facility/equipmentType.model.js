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
    equipmentName: { type: DataTypes.STRING, allowNull: false },
    origin: { type: DataTypes.STRING },
    warrantyDuration: { type: DataTypes.INTEGER }, // Tính theo tháng
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
