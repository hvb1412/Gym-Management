import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class WorkoutLog extends Model {}
WorkoutLog.init(
  {
    workoutId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workoutDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    startTime: { type: DataTypes.TIME },
    duration: { type: DataTypes.INTEGER }, // Phút
  },
  {
    sequelize,
    modelName: "WorkoutLog",
    tableName: "workout_logs",
    underscored: true,
    timestamps: true,
  },
);

export default WorkoutLog;
