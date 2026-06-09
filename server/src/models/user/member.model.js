import { Model, DataTypes } from "sequelize";
import sequelize from "../../configs/database.js";

class Member extends Model {}
Member.init(
  {
    memberId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memberName: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.DATEONLY },
    occupation: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, unique: true },
    joinDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    memberType: { type: DataTypes.STRING, defaultValue: "normal" },
    remainingWorkout: { type: DataTypes.INTEGER, defaultValue: 0 },
    expireDate: { type: DataTypes.DATEONLY },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "members",
    underscored: true,
    timestamps: true,
  },
);

export default Member;
