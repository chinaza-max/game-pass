import Joi from "joi";

class GameUtil {

  
  verifyHandleInitializeGame=Joi.object({
    gameName: Joi.string().required(),
    gameAvatar:Joi.string().required()
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
    userGameAcctPublicKey:  Joi.string().required()
  });


  verifyHandleGetSingleGameAccount=Joi.object({
    gameId:Joi.string().required()
  });


  verifyHandleDoesUserGameAccountExist=Joi.object({
    gameId:Joi.string().required(),
    gamerPublicKey:Joi.string().required()
  });


  verifyHandleUserGameAccountActions=Joi.object({
    type: Joi. string().valid(
      'updateUserLevel',
      'updateUserScore',
    ).required(),
    userGameAcctPublicKey: Joi.string().required(), 
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
      is: Joi.string().valid(  'updateUserScore', 'updateUserLevel'),
      then: Joi.string().required(),
      otherwise: Joi.string().forbidden()
    }),
    gameId: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then:  Joi.string().required(),
      otherwise: Joi.string().not()
    }),
    gamerPublicKey: Joi.when('type', {
      is: 'initializeUserGameAccount',
      then:  Joi.string().required(),
      otherwise: Joi.string().not()
    })
  });
}

export default new GameUtil();
