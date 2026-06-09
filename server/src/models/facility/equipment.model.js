import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class Equipment extends Model {}
Equipment.init(
  {
    equipmentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipmentCode: { type: DataTypes.STRING, unique: true },
    usageStatus: { type: DataTypes.STRING, defaultValue: "Hoạt động" },
    importDate: { type: DataTypes.STRING }, // Frontend sends DD/MM/YYYY, better to parse or use STRING
  },
  {
    sequelize,
    modelName: "Equipment",
    tableName: "equipments",
    underscored: true,
    timestamps: true,
  },
);

export default Equipment;