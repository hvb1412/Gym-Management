import { Model, DataTypes } from "sequelize";
import sequelize from "../../configs/database.js";

class WorkoutLog extends Model {}

WorkoutLog.init(
  {
    workoutId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    memberId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    recorderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    workoutDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "WorkoutLog",
    tableName: "workout_logs",
    underscored: true,
    timestamps: true,
  }
);

export default WorkoutLog;