import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class Room extends Model {}
Room.init(
  {
    roomId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomName: { type: DataTypes.STRING, allowNull: false },
    roomType: { type: DataTypes.STRING },
    operatingStatus: { type: DataTypes.STRING, defaultValue: "active" },
  },
  {
    sequelize,
    modelName: "Room",
    tableName: "rooms",
    underscored: true,
    timestamps: true,
  },
);

export default Room;