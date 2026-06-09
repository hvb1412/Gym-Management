import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class Feedback extends Model {}
Feedback.init(
  {
    feedbackId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    feedbackType: { type: DataTypes.STRING },
    feedbackContent: { type: DataTypes.TEXT, allowNull: false },
    answerContent: { type: DataTypes.TEXT },
    feedbackDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    answerDate: { type: DataTypes.DATEONLY },
  },
  {
    sequelize,
    modelName: "Feedback",
    tableName: "feedbacks",
    underscored: true,
    timestamps: true,
  },
);

export default Feedback;
