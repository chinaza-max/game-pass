import {
  EmailandTelValidation,
  Games
} from "../db/models/index.js";
import gameUtil from "../utils/game.util.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize } from "sequelize";
import mailService from "./mail.service.js";
import crypto from 'crypto';
import DB from '../db/index.js';
import {  SystemProgram ,Transaction,PublicKey, sendAndConfirmRawTransaction} from '@solana/web3.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import * as anchor from '@project-serum/anchor';
import BN from 'bn.js';

import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";
import { Console } from "console";

class UserService {
  EmailandTelValidationModel=EmailandTelValidation 
  GamesModel=Games


  async handleGetTrasaction(data) {
    let { 
      userPublicKey,
      gamerPublicKey,
      gameName,
      gameId,
      type
    } = await gameUtil.verifyHandleGetTrasaction.validateAsync(data);
  
    const {gamePassKeypair, program, connection}=DB.getBlockChainData()
    

    if(userPublicKey){
      try {
        new PublicKey(userPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user public key")
      }
    }      
   

    if(gameName){
      const result =await this.checkIfthisUserHastheGameName(userPublicKey, gameName, program)
      if(result==true){       
        throw new ConflictError("Game with this name already exist")
      }  
    }

    if(gamerPublicKey){
      try {
        new PublicKey(gamerPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid gamer public key")
      }
    }

    try {


      const createdAt = Date.now();

      if(type=="initializeGame"){
                
        const uniqueId2 = Math.floor(Date.now() / 1000); 
        const uniqueIdBuffer = Buffer.alloc(8);
        uniqueIdBuffer.writeUInt32LE(uniqueId2, 0)

        const result = await this.GamesModel.findOne({
          where: {
            [Op.and]: [
              { GameOwnerPublicKey:userPublicKey },
              { uniqueId: uniqueId2 }
            ]
          }
        });

        if (result) new ConflictError("Game with the id exist contact support")
    
          const [gameAcctPDA] = await findProgramAddressSync(
            [Buffer.from('game_acct'), new PublicKey(userPublicKey).toBuffer(),uniqueIdBuffer],
            program.programId
          );

          const [gamePassPDA] = await findProgramAddressSync(
            [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
            program.programId
          );

          const transaction = new Transaction();

          const instruction = program.instruction.initializeGame(
            new BN(uniqueId2),
            gameName,
            new BN(createdAt), 
            {
                accounts: {
                    gameAcct: gameAcctPDA,
                    gamePass: gamePassPDA, 
                    user: userPublicKey,
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              },
            }
          );

          const tx=transaction.add(instruction)
          tx.feePayer = new PublicKey(userPublicKey);  

          const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
          tx.recentBlockhash = blockHash;

          const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');

          return { transaction: serializedTransaction , uniqueId: uniqueId2};
      }
      else if(type=="initializeUserGameAccount"){

        const result=await this.doesGameIdExist(gameId, program ,gamePassKeypair)
        const result2=await this.getGameAccountInfor(gameId, program)
        const uniqueId=result2.uniqueId.toString()
        const GameOwnerPublicKey=new PublicKey(result2.owner).toString()

        console.log(result2.owner)
        console.log(GameOwnerPublicKey)

        if(!result){
          throw new NotFoundError("gameId does not exist")
        }

        const uniqueIdBuffer = Buffer.alloc(8);
        uniqueIdBuffer.writeUInt32LE(uniqueId, 0)


      const [gameAcctPDA] = await findProgramAddressSync(
        [Buffer.from('game_acct'), new PublicKey(GameOwnerPublicKey).toBuffer(), uniqueIdBuffer],
        program.programId
      );
      
      const [userGameAcctPDA] = await findProgramAddressSync(
        [Buffer.from('user_game_acct'), new PublicKey(gameAcctPDA).toBuffer(),
        new PublicKey(gamerPublicKey).toBuffer()],
        program.programId
      );
      
      const [gamePassPDA] = await findProgramAddressSync(
        [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
        program.programId
      );

      const transaction = new Transaction();
         
      const instruction = program.instruction.initializeUserGameAccount(
        new PublicKey(gameAcctPDA).toString(),
        new BN(createdAt),
        {
            accounts: {
                userGameAcct: userGameAcctPDA,
                gamePass: gamePassPDA,
                gameAcct: gameAcctPDA,
                user: gamerPublicKey,
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
          },
        }
      );

      const tx=transaction.add(instruction)
      tx.feePayer = new PublicKey(gamerPublicKey);  

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.recentBlockhash = blockHash;
    
      const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');
      return { transaction: serializedTransaction };
    }

    } catch (error) {
      console.error('Error initialize User Game Account:', error);
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
          throw new BadRequestError("Transaction failed with error:", err.message)
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


  
  async handleGetAllUserGameAccount(data) {
    let { 
      gameId
    } = await gameUtil.verifyHandleGetAllUserGameAccount.validateAsync(data);

    const userGameAccounts=[]

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
        if(userGameAccount.gameId==gameId){
          userGameAccounts.push(userGameAccount)
        }
      }

    }else{
      throw new NotFoundError("gameId is not found ")
    }

    return userGameAccounts

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
      userPublicKey
    } = await gameUtil.verifyHandleGetAllGameAccount.validateAsync(data);

    const {gamePassKeypair, program, connection}=DB.getBlockChainData()
    if(userPublicKey){
      try {
        new PublicKey(userPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user PublicKey")
      }
    }


    try {   

      const gameAccount=[]
      if(type=="admin"){
        const accountPassAccount= await this.getGamePassAccounts(program,gamePassKeypair)
            
        if(accountPassAccount){
            console.log(accountPassAccount)
            for (let index = 0; index < accountPassAccount.games.length; index++) {
              const element = accountPassAccount.games[index];
              

              const accountGameAccountInfo= await this.getGameAccountInfor(element.gameId,program)
              
              gameAccount.push(accountGameAccountInfo)
              
            }
        }
      }
      else{
            const accountPassAccount= await this.getGamePassAccounts(program,gamePassKeypair)
            
            if(accountPassAccount){
                console.log(accountPassAccount)
                for (let index = 0; index < accountPassAccount.games.length; index++) {
                  const element = accountPassAccount.games[index];
                  
  
                  const accountGameAccountInfo= await this.getGameAccountInfor(element.gameId,program)
                  
                  if(new PublicKey(accountGameAccountInfo.owner).toString()==userPublicKey){
                    gameAccount.push(accountGameAccountInfo)
                  }
  
                }
            }
      }




      return gameAccount
    } catch (error) {
      console.error('Error initializing game:', error);
    }

  }


  async handleInitializeGame(data) {
    let { 
      userPublicKey,
      signedTransaction,
      uniqueId
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {   

      const { connection }=DB.getBlockChainData() 

      const serializedTransaction = Buffer.from(signedTransaction, 'base64');
      
      const txnSignature = await sendAndConfirmRawTransaction(connection, serializedTransaction);
      
      if(txnSignature){
        this.GamesModel.create({
          GameOwnerPublicKey:userPublicKey,
          uniqueId: uniqueId
        });
      }
     return { transaction: txnSignature };

    } catch (error) {
      console.error('Error initializing game:', error);
    }

  }

  async checkIfthisUserHastheGameName(userPublicKey, gameName, program){

    let myState=false




    const result = await this.GamesModel.findAll({
      where: 
          { GameOwnerPublicKey:userPublicKey },
    });
    
    if(result.length==0){
        return myState
    }else{

      for (let index = 0; index < result.length; index++) {
        const element = result[index];
          const uniqueIdBuffer = Buffer.alloc(8);
          uniqueIdBuffer.writeUInt32LE(element.uniqueId, 0)
    
          const [gameAcctPDA] = await findProgramAddressSync(
            [Buffer.from('game_acct'), new PublicKey(userPublicKey).toBuffer(),uniqueIdBuffer],
            program.programId
          );

          console.log( program.account ) 
          
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