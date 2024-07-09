import Joi from "joi";

class GameUtil {

  
  verifyHandleInitializeGame=Joi.object({
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleInitializeUserGameAccount=Joi.object({
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleGetTrasaction=Joi.object({
    type: Joi.string().required(),
    userPublicKey: Joi.when('type', {
      is: 'initializeGame',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    gameName: Joi.when('type', {
      is: 'initializeGame',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    gamerPublicKey: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    uniqueId: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then: Joi.number().integer().min(0).required(),
      otherwise: Joi.string().optional()
    })
  });
}

export default new GameUtil();
