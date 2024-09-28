import {
  EmailandTelValidation,
  Games
} from "../db/models/index.js";
import gameUtil from "../utils/game.util.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize } from "sequelize";
import { Wallet  } from '@project-serum/anchor';
import mailService from "./mail.service.js";
import crypto from 'crypto';
import DB from '../db/index.js';

import {  SystemProgram ,Transaction,PublicKey, sendAndConfirmRawTransaction, Connection , clusterApiUrl} from '@solana/web3.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import * as anchor from '@project-serum/anchor';
import {   
  GamePassSDK
  } from "game-pass-sdk"

import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";


const GamePassSDKInstance=new GamePassSDK(await DB.getGameKeyPair())


class UserService {
  EmailandTelValidationModel=EmailandTelValidation 
  GamesModel=Games

  async handleGetTrasaction(data) {
    let { 
      gameOwnerPublicKey,
      gameName,
      gameId,
      userGameAcctPublicKey,
      gamerPublicKey,
      score,
      level,
      gameAvatar,
      userAvatar,
      type
    } = await gameUtil.verifyHandleGetTrasaction.validateAsync(data);
  
         

    if(gameOwnerPublicKey){
      try {
        new PublicKey(gameOwnerPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user public key")
      }
    }      
   

    if(userGameAcctPublicKey){
      try {
        new PublicKey(userGameAcctPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid gamer public key")
      }
    }

    if(userGameAcctPublicKey){
      try {
        new PublicKey(userGameAcctPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid User Game Account public key")
      }
    }

    try {

      if(type=="initializeUserGameAccount"){

        try {       
       
          return await GamePassSDKInstance.getSerializedInitializeUserGameAccountTransaction(new PublicKey(gameId), userAvatar , new PublicKey(gamerPublicKey)) 
   
        } catch (error) {
          console.log(error)
        }     
     
      }
   
     
    } catch (error) {
      console.error(error);
    }

  }


  

  async handleDoesUserGameAccountExist(data) {
    let { 
      gamerPublicKey,
      gameId
    } = await gameUtil.verifyHandleDoesUserGameAccountExist.validateAsync(data);

    try { 
        
      return await GamePassSDKInstance.doesUserGameAccoutExist2( new PublicKey(gameId),
        new PublicKey(gamerPublicKey))||false

    } catch (error) {
   
      throw new BadRequestError(error.message)
    }

  }


  async handleUserGameAccountActions(data) {
    let { 
      userGameAcctPublicKey,
      type,
      level,
      score
    } = await gameUtil.verifyHandleUserGameAccountActions.validateAsync(data);

    try { 

      if(type=="updateUserScore"){

        try {        
          return await GamePassSDKInstance.updateUserScore(score, userGameAcctPublicKey)

        } catch (error) {
          console.log(error)
        }   
      
      }
      else if(type=="updateUserLevel"){

        try {        
            
          return await GamePassSDKInstance.updateUserLevel(level, userGameAcctPublicKey)

        } catch (error) {
          console.log(error)
        }   
 
      }
     return { transaction: txnSignature};

    } catch (error) {
   
      const logs = error.transactionLogs;
      if (logs.some(log => log.includes("Error Code: UserAlreadyRegistered"))) {
          throw new BadRequestError("User is already registered. Please try with a different account.");
      } else {
          throw new BadRequestError("Transaction failed with error:", error.message)
        }
    }

  }

  async handleInitializeUserGameAccount(data) {
    let { 
      signedTransaction
    } = await gameUtil.verifyHandleInitializeUserGameAccount.validateAsync(data);

    try { 

      console.error(signedTransaction);

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
     return { transaction: txnSignature };

    } catch (error) {
      
      console.error("Transaction failed with error:", error);

   
      const logs = error.transactionLogs || [];

      if (logs.length && logs.some(log => log.includes("Error Code: UserAlreadyRegistered"))) {
        throw new BadRequestError("User is already registered. Please try with a different account.");
      } else {
        // You can print the error message or stack to log more details for debugging
        console.error("Transaction failed with error:", error);
        throw new BadRequestError(`Transaction failed with error: ${error.message || error}`);
      }

    }

  }

  
  async handleGetSigleGameAccount(data) {
    let { 
      signedTransaction
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {   

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
     return { transaction: txnSignature };

    } catch (error) {
      console.error('Error initializing game:', error);
    }

  }


  
  async handleGetSingleGameAccount(data) {
    let { 
      gameId
    } = await gameUtil.verifyHandleGetSingleGameAccount.validateAsync(data);

    try {  
        

    if(gameId){
      try {
        new PublicKey(gameId)
      } catch (error) {
        throw new BadRequestError("this is an invalid gameId")
      }
    }

    const getGameAccountInfor=GamePassSDKInstance.getGameAccountInfor(gameId)
     
    return getGameAccountInfor

    } catch (error) {
      console.error('Error fetching  game account:', error);
    }
  }

  async handleGetSingleUserGameAccount(data) {
    let { 
      userGameAcctPublicKey
    } = await gameUtil.verifyHandleGetSingleUserGameAccount.validateAsync(data);


    try {  
      
      return await  GamePassSDKInstance.getSingleUserGameAccountAccountId(new PublicKey(userGameAcctPublicKey))

    } catch (error) {
      console.error(error);
      throw new NotFoundError(error)

    }
  }

  async handleGetAllUserGameAccount(data) {
    let { 
      gameId
    } = await gameUtil.verifyHandleGetAllUserGameAccount.validateAsync(data);


    try {  
      
   // const {gamePassKeypair, program, connection}=DB.getBlockChainData()

    if(gameId){
      try {
        new PublicKey(gameId)
      } catch (error) {
        throw new BadRequestError("this is an invalid gameId")
      }
    }

    return await GamePassSDKInstance.getAllUserGameAccount(new PublicKey(gameId))

    } catch (error) {
      console.error('Error getting all user account:', error);
    }
  }
  
  async handleGetSigleUserGameAccount(data) {
    let { 
      signedTransaction
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {   

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
     return { transaction: txnSignature };

    } catch (error) {
      console.error('Error initializing game:', error);
    }

  }
    
  async handleGetAllGameAccount(data) {
    let { 
      type, 
      gameOwnerPublicKey
    } = await gameUtil.verifyHandleGetAllGameAccount.validateAsync(data);

    if(gameOwnerPublicKey){
      try {
        new PublicKey(gameOwnerPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user PublicKey")
      }
    }


    try {   

      if(type=="admin"){

        return await GamePassSDKInstance.getAllGameAccounts()
      }
      else{

        return await GamePassSDKInstance.getAllGameAccountsForUser(gameOwnerPublicKey)
      }
    } catch (error) {
      console.error('Error initializing game:', error);
    }

  }


  async handleInitializeGame(data) {
    let { 
      gameName, gameAvatar
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {

     const txnSignature=await GamePassSDKInstance.initializeGame(gameName, gameAvatar)
      
     return { transactionSignature: txnSignature };

    } catch (error) {
      
      console.error('Error initializing game:', error);
      throw new Error(error)
    }

  }

  async checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName, program){

    let myState=false




    const result = await this.GamesModel.findAll({
      where: 
          { GameOwnerPublicKey:gameOwnerPublicKey },
    });
    
    if(result.length==0){
        return myState
    }else{

      for (let index = 0; index < result.length; index++) {
        const element = result[index];
          const uniqueIdBuffer = Buffer.alloc(8);
          uniqueIdBuffer.writeUInt32LE(element.uniqueId, 0)
    
          const [gameAcctPDA] = await findProgramAddressSync(
            [Buffer.from('game_acct'), new PublicKey(gameOwnerPublicKey).toBuffer(),uniqueIdBuffer],
            program.programId
          );
          
          try {
            const gameAccount = await program.account.gameAccts.fetch(gameAcctPDA);
      
            if (gameAccount.gameName == gameName) {
              myState = true;
              break;
            }
          } catch (error) {
            if (error.message.includes("Account does not exist or has no data")) {
              //console.warn(`Account does not exist or has no data: ${gameAcctPDA.toString()}`);
              // Continue to the next iteration if the account does not exist
              continue;
            } else {
              // If it's a different error, rethrow it
              throw error;
            }
          }  
      }
    }
    return myState
  }

  async getGamePassAccounts(program ,gamePassKeypair){

    const [gamePassPDA, bump] = await findProgramAddressSync(
      [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
      program.programId
    );

    const gameAccount = await program.account.gamePass.fetch(gamePassPDA);

    return gameAccount;

  }

  
  async getGameAccountInfor(pubkeyKey, program){

    const gameAccountInfor = await program.account.gameAccts.fetch(pubkeyKey);
    return gameAccountInfor;

  }

  async getUserGameAccountInfor(pubkeyKey, program){

    const gameAccountInfor = await program.account.userGameAccount.fetch(pubkeyKey);
    return gameAccountInfor;

  }

  async doesGameIdExist(gameId, program ,gamePassKeypair){

    const gamePassAccount=await this.getGamePassAccounts(program ,gamePassKeypair)

    for (let index = 0; index < gamePassAccount.games.length; index++) {
      const element = gamePassAccount.games[index];
      if(element.gameId==gameId) return true
    }

    return false

  }




}

export default new UserService();

//