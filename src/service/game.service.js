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
import {  SystemProgram ,Transaction,PublicKey, sendAndConfirmRawTransaction} from '@solana/web3.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import * as anchor from '@project-serum/anchor';
import BN from 'bn.js';
import {   
  GamePassSDK
  } from "game-pass-sdk"


  
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";
import { Console } from "console";


const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC)
const secretKey = Uint8Array.from(secret)
const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)

const GamePassSDKInstance=new GamePassSDK(Keypair)

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


      const createdAt = Date.now();

      if(type=="initializeGame"){
                           
        try {
          return await GamePassSDKInstance.initializeGame(gameName, gameAvatar)
        } catch (error) {
          console.log(error)  
        }

      }
      else if(type=="initializeUserGameAccount"){


        try {        
          
          //return await GamePassSDKInstance.getSerializedUpdateUserAvatarTransaction(new PublicKey(userGameAcctPublicKey) , new PublicKey(gamerPublicKey), userAvatar) 

          //return await GamePassSDKInstance.getSerializedInitializeUserGameAccountTransaction(new PublicKey(gameId) ,userAvatar , new PublicKey(userGameAcctPublicKey)) 

          return await GamePassSDKInstance.getGamePassAccounts() 

        } catch (error) {
          console.log(error)
        }     

     
      }
      else if(type=="updateUserScore"){

        
        try {        
            
          return await GamePassSDKInstance.updateUserScore(2, userGameAcctPublicKey)

        } catch (error) {
          console.log(error)
        }   
       

      }
      else if(type=="updateUserLevel"){

        try {        
            
          return await GamePassSDKInstance.updateUserLevel(2, userGameAcctPublicKey)

        } catch (error) {
          console.log(error)
        }   
 
      }
     

    } catch (error) {
      console.error(error);
    }

  }


  async handleUserGameAccountActions(data) {
    let { 
      signedTransaction,
      type
    } = await gameUtil.verifyHandleUserGameAccountActions.validateAsync(data);

    try { 

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
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

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
     return { transaction: txnSignature };

    } catch (error) {
   
      const logs = error.transactionLogs;
      if (logs.some(log => log.includes("Error Code: UserAlreadyRegistered"))) {
          throw new BadRequestError("User is already registered. Please try with a different account.");
      } else {
          throw new BadRequestError("Transaction failed with error:", error)
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
        
    const {gamePassKeypair, program, connection}=DB.getBlockChainData()

    if(gameId){
      try {
        new PublicKey(gameId)
      } catch (error) {
        throw new BadRequestError("this is an invalid gameId")
      }
    }

    const result= await this.doesGameIdExist(gameId, program ,gamePassKeypair)
    if(result){

      const getGameAccountInfor=await this.getGameAccountInfor(gameId,program)
     
      return getGameAccountInfor

    }else{
      throw new NotFoundError("gameId is not found ")
    }
 

    } catch (error) {
      console.error('Error fetching  game account:', error);
    }
  }

  async handleGetSingleUserGameAccount(data) {
    let { 
      gameId,
      userGameAcctPublicKey
    } = await gameUtil.verifyHandleGetSingleUserGameAccount.validateAsync(data);

    let singleUserGameAccount=''

    try {  
        
    const {gamePassKeypair, program, connection}=DB.getBlockChainData()

    if(gameId){
      try {
        new PublicKey(gameId)
      } catch (error) {
        throw new BadRequestError("this is an invalid gameId")
      }
    }

    const result= await this.doesGameIdExist(gameId, program ,gamePassKeypair)
    if(result){

      const gamePassAccount=await this.getGamePassAccounts(program ,gamePassKeypair)

      for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
        const accountPDA = gamePassAccount.userGameAccount[index].accountId;
        const userGameAccount= await this.getUserGameAccountInfor(accountPDA, program)
        if(userGameAccount.gameId==gameId&&userGameAccount.owner == userGameAcctPublicKey){
          singleUserGameAccount={...userGameAccount,"level":Number(userGameAccount.level.toString()),
            "score":Number(userGameAccount.score.toString())}

            break
        }
      }

    }else{
      throw new NotFoundError("gameId is not found ")
    }
    if(singleUserGameAccount==''){
      throw new NotFoundError("No user account found")
    }
    return singleUserGameAccount

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

    const result= await GamePassSDK.getAllUserGameAccount()

    } catch (error) {
      console.error('Error initializing game:', error);
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
      gameOwnerPublicKey,
      signedTransaction,
      uniqueId
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {   

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
      if(txnSignature){
        this.GamesModel.create({
          GameOwnerPublicKey:gameOwnerPublicKey,
          uniqueId: uniqueId
        });
      }
     return { transaction: txnSignature };

    } catch (error) {
      console.error('Error initializing game:', error);
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