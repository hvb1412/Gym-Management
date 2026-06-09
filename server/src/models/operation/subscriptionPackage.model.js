import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class SubscriptionPackage extends Model {}
SubscriptionPackage.init(
  {
    packageId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    packageName: { type: DataTypes.STRING, allowNull: false },
    packageType: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER },
    numberOfWorkout: { type: DataTypes.INTEGER },
    vipIncluded: { type: DataTypes.BOOLEAN, defaultValue: false },
    trainerIncluded: { type: DataTypes.BOOLEAN, defaultValue: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "Đang kinh doanh" },
  },
  {
    sequelize,
    modelName: "SubscriptionPackage",
    tableName: "subscription_packages",
    underscored: true,
    timestamps: true,
  },
);

export default SubscriptionPackage;
