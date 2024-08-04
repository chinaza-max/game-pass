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

class UserService {
  EmailandTelValidationModel=EmailandTelValidation 
  GamesModel=Games


  async handleGetTrasaction(data) {
    let { 
      gameOwnerPublicKey,
      gameName,
      gameId,
      userGameAcctPublicKey,
      score,
      level,
      gameAvatar,
      userAvatar,
      type
    } = await gameUtil.verifyHandleGetTrasaction.validateAsync(data);
  
    const {gamePassKeypair, program, connection}=DB.getBlockChainData()
         

    if(gameOwnerPublicKey){
      try {
        new PublicKey(gameOwnerPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user public key")
      }
    }      
   

    if(gameName){
      /*const result =await this.checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName, program)
      if(result==true){       
        throw new ConflictError("Game with this name already exist")
      }  */
    }

   /* if(userGameAcctPublicKey){
      try {
        new PublicKey(userGameAcctPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid gamer public key")
      }
    }*/

    if(userGameAcctPublicKey){
      try {
        new PublicKey(userGameAcctPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid User Game Account public key")
      }
    }

    if(userGameAcctPublicKey&&(type=="updateUserLevel"||type=="updateUserScore")){
      try {
       await program.account.userGameAccount.fetch(userGameAcctPublicKey);
      } catch (error) {
        throw new NotFoundError(error)
      }
    }

  

    

    try {


      const createdAt = Date.now();

      if(type=="initializeGame"){
                
        const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC)
        const secretKey = Uint8Array.from(secret)
        const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)
        
        const GamePassSDKInstance=new GamePassSDK(new Wallet(Keypair))
       // GamePassSDKInstance.intializeGamePass()
           
       
          try {
            //console.log(await GamePassSDKInstance.getAllGameAccountsForUser(Keypair.publicKey))
            return await GamePassSDKInstance.getAllGameAccountsForUser(Keypair.publicKey)
          } catch (error) {
              console.log("error")
              console.log("error")
              console.log("error")
              console.log(error)  
              console.log("error")
              console.log("error")
              console.log("error")
              console.log("error")


          }

        //console.log(await GamePassSDKInstance.getGamePassAccounts())
        /* 
        const uniqueId2 = Math.floor(Date.now() / 1000); 
        const uniqueIdBuffer = Buffer.alloc(8);
        uniqueIdBuffer.writeUInt32LE(uniqueId2, 0)

        const result = await this.GamesModel.findOne({
          where: {
            [Op.and]: [
              { GameOwnerPublicKey:gameOwnerPublicKey },
              { uniqueId: uniqueId2 }
            ]
          }
        });

        if (result) new ConflictError("Game with the id exist contact support")
    
          const [gameAcctPDA] = await findProgramAddressSync(
            [Buffer.from('game_acct'), new PublicKey(gameOwnerPublicKey).toBuffer(),uniqueIdBuffer],
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
                    user: gameOwnerPublicKey,
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              },
            }
          );

          const tx=transaction.add(instruction)
          tx.feePayer = new PublicKey(gameOwnerPublicKey);  

          const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
          tx.recentBlockhash = blockHash;

          const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');

          return { transaction: serializedTransaction , uniqueId: uniqueId2};
          */

      }
      else if(type=="initializeUserGameAccount"){


        try {
          const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC)
          const secretKey = Uint8Array.from(secret)
          const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)
          
          const GamePassSDKInstance=new GamePassSDK(new Wallet(Keypair))

          console.log(Keypair.publicKey.toString())
          return await GamePassSDKInstance.getSerializedInitializeUserGameAccountTransaction(gameId, userAvatar, Keypair.publicKey)
        } catch (error) {
          console.log(error)
        }



return




        const result=await this.doesGameIdExist(gameId, program ,gamePassKeypair)
        const result2=await this.getGameAccountInfor(gameId, program)
        const uniqueId=result2.uniqueId.toString()
        const GameOwnerPublicKey=new PublicKey(result2.owner).toString()

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
        new PublicKey(userGameAcctPublicKey).toBuffer()],
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
                user: userGameAcctPublicKey,
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
          },
        }
      );

      const tx=transaction.add(instruction)
      tx.feePayer = new PublicKey(userGameAcctPublicKey);  

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.recentBlockhash = blockHash;
    
      const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');
      return { transaction: serializedTransaction };
      }
      else if(type=="updateUserScore"){

       const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey, program)
       const GameAccountInfor=await this.getGameAccountInfor(UserGameAccountInfor.gameId, program)
       const transaction = new Transaction();
         
        const instruction = program.instruction.updateUserScore(
          new BN(score),
          {
              accounts: {
                userGameAcct: userGameAcctPublicKey,
                gameAcct: UserGameAccountInfor.gameId,
                signer: new PublicKey(GameAccountInfor.owner).toString()
            },
        })   

        const tx=transaction.add(instruction)
        tx.feePayer = new PublicKey(GameAccountInfor.owner);  
  
        const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
        tx.recentBlockhash = blockHash;
      
        const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');
        return { transaction: serializedTransaction };


      }
      else if(type=="updateUserLevel"){

        const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey, program)
        const GameAccountInfor=await this.getGameAccountInfor(UserGameAccountInfor.gameId, program)
        const transaction = new Transaction();
          
         const instruction = program.instruction.updateUserLevel(
           new BN(level),
           {
               accounts: {
                 userGameAcct: userGameAcctPublicKey,
                 gameAcct: UserGameAccountInfor.gameId,
                 signer: new PublicKey(GameAccountInfor.owner).toString()
             },
         })   
 
         const tx=transaction.add(instruction)
         tx.feePayer = new PublicKey(GameAccountInfor.owner);  
   
         const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
         tx.recentBlockhash = blockHash;
       
         const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true}).toString('base64');
         return { transaction: serializedTransaction };
 
 
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
          userGameAccounts.push({...userGameAccount,"level":Number(userGameAccount.level.toString()),
            "score":Number(userGameAccount.score.toString())})
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
      gameOwnerPublicKey
    } = await gameUtil.verifyHandleGetAllGameAccount.validateAsync(data);

    const {gamePassKeypair, program, connection}=DB.getBlockChainData()
    if(gameOwnerPublicKey){
      try {
        new PublicKey(gameOwnerPublicKey)
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
                  
                  if(new PublicKey(accountGameAccountInfo.owner).toString()==gameOwnerPublicKey){
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