import Joi from "joi";

class OwnerUtil {

  
  verifyHandleCreateTask=Joi.object({
    userId: Joi.number().required(),
    title: Joi.string().required(),
    taskDescription: Joi.string().required(),
    amount: Joi.number().required(),
    expiryDate: Joi.date().required(),
    image: Joi.object({
      sizes: Joi.number().positive().less(3000000).optional(),
    }).optional()
  })



}

export default new UserUtil();
