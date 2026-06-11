import Joi from "joi";

export const createWorkoutLogSchema = {
  body: Joi.object({
    memberId: Joi.string().uuid().required(),
    notes: Joi.string().max(500).optional().allow("", null),
  }),
};