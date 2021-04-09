import Joi from "@hapi/joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(4).required(),
  email: Joi.string().min(6).email().required(),
  password: Joi.string().min(6).required(),
});
