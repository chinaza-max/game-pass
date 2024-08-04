import Joi from "joi";

class GameUtil {

  
  verifyHandleInitializeGame=Joi.object({
    signedTransaction: Joi.string().base64().required(),
    gameOwnerPublicKey: Joi.string().required(),
    uniqueId:Joi.number().integer().min(0).required(),
  });

  verifyHandleInitializeUserGameAccount=Joi.object({
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleGetAllGameAccount=Joi.object({
    type: Joi. string().valid(
      'user',
      'admin',
    ).required(),
    gameOwnerPublicKey: Joi.when('type', {
      is: 'user',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    })
  });

  
  verifyHandleGetAllUserGameAccount=Joi.object({
    gameId:Joi.string().required()
  });

  verifyHandleGetSingleUserGameAccount=Joi.object({
    gameId:Joi.string().required(),
    userGameAcctPublicKey:  Joi.string().required()
  });


  verifyHandleGetSingleGameAccount=Joi.object({
    gameId:Joi.string().required()
  });


  verifyHandleUserGameAccountActions=Joi.object({
    type: Joi. string().valid(
      'updateUserLevel',
      'updateUserScore',
    ).required(),
    signedTransaction: Joi.string().base64().required()
  });

  verifyHandleGetTrasaction=Joi.object({
    type: Joi.string().required(),
    //score: Joi.number().required(),
    score: Joi.when('type', {
      is: 'updateUserScore',
      then: Joi.number().required(),
      otherwise: Joi.string().not()
    }),
    
    level: Joi.when('type', {
      is: 'updateUserLevel',
      then: Joi.number().required(),
      otherwise: Joi.string().not()
    }),
    gameOwnerPublicKey: Joi.when('type', {
      is: 'initializeGame',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    
    gameAvatar: Joi.when('type', {
      is: 'initializeGame',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),

    userAvatar: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    gameName: Joi.when('type', {
      is: 'initializeGame',
      then: Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    userGameAcctPublicKey: Joi.alternatives().conditional('type', {
      is: Joi.string().valid('initializeUserGameAccount', 'updateUserScore', 'updateUserLevel'),
      then: Joi.string().required(),
      otherwise: Joi.string().forbidden()
    }),
    gameId: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then:  Joi.string().required(),
      otherwise: Joi.string().not()
    })
  });
}

export default new GameUtil();
