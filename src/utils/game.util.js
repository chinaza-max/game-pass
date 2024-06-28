import Joi from "joi";

class GameUtil {

  
  verifyHandleInitializeGame=Joi.object({
    user: Joi.array().items(Joi.number()).required(),
    uniqueId: Joi.number().required(),
    gameName: Joi.string().required(),
    createdAt: Joi.number().required()
  });




}

export default new GameUtil();
