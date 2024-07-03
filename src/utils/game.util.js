import Joi from "joi";

class GameUtil {

  
  verifyHandleInitializeGame=Joi.object({
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleInitializeUserGameAccount=Joi.object({
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleGetTrasaction=Joi.object({
    userPublicKey: Joi.string().required(),
    gameName: Joi.string().required(),
    type: Joi.string().required(),
    uniqueId: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then: Joi.number().integer().min(0).required(),
      otherwise: Joi.string().optional()
    })
  });

}

export default new GameUtil();
