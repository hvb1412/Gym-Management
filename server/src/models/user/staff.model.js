import { Model, DataTypes } from "sequelize";
import sequelize from "../../configs/database.js";

export class Staff extends Model {}
Staff.init(
  {
    staffId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    staffName: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.DATEONLY },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    position: {
      type: DataTypes.ENUM("owner", "manager", "pt"),
      allowNull: false,
    },
    registerDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Staff",
    tableName: "staffs",
    underscored: true,
    timestamps: true,
  },
);
export default Staff;
