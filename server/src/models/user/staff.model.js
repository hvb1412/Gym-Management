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
    staffCode: { 
      type: DataTypes.STRING, 
      unique: true 
    },
    staffName: { type: DataTypes.STRING, allowNull: false },
    gender: { 
      type: DataTypes.ENUM("Nam", "Nữ", "Khác"), 
      defaultValue: "Nam" 
    },
    dateOfBirth: { type: DataTypes.DATEONLY },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    address: { type: DataTypes.STRING },
    position: {
      type: DataTypes.ENUM("owner", "manager", "pt"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Đang làm", "Nghỉ phép", "Đã thôi việc", "Đã vô hiệu hóa"),
      defaultValue: "Đang làm",
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
