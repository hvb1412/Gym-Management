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
    usageStatus: { type: DataTypes.STRING, defaultValue: "normal" },
    importDate: { type: DataTypes.DATEONLY },
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