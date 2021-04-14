import Joi from "@hapi/joi";

export const registerUserSchema = Joi.object({
  username: Joi.string().min(4).required(),
  email: Joi.string().min(6).email().required(),
  password: Joi.string().min(6).required(),
});

export const createRoomSchema = Joi.object({
  name: Joi.string().min(4).required(),
  maxUsers: Joi.number().min(1).max(32).required(),
  password: Joi.string().optional().min(6),
});
