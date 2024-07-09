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

class UserService {
  EmailandTelValidationModel=EmailandTelValidation 
  GamesModel=Games




  
  async handleGetTrasaction(data) {
    let { 
      userPublicKey,
      gamerPublicKey,
      gameName,
      uniqueId,
      type
    } = await gameUtil.verifyHandleGetTrasaction.validateAsync(data);


    if(userPublicKey){
      try {
        new PublicKey(userPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid user publick key")
      }
    }
   

    if(gamerPublicKey){
      try {
        new PublicKey(gamerPublicKey)
      } catch (error) {
        throw new BadRequestError("this is an invalid gamer publick key")
      }
    }

    try {

      const {gamePassKeypair, program,  connection}=DB.getBlockChainData()

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

        if(serializedTransaction){
          this.GamesModel.create({
            GameOwnerPublicKey:userPublicKey,
            uniqueId: uniqueId2 
          });
        }
        return { transaction: serializedTransaction };
      }
      else if(type=="initializeUserGameAccount"){

        const result=this.GamesModel.findOne({
          where:{
            uniqueId
          }
        })

        if(!result){
          throw new NotFoundError("Game Id does not exist")
        }

        const uniqueIdBuffer = Buffer.alloc(8);
        uniqueIdBuffer.writeUInt32LE(uniqueId, 0)

        const {gamePassKeypair, program,  connection}=DB.getBlockChainData()

      const [gameAcctPDA] = await findProgramAddressSync(
        [Buffer.from('game_acct'), new PublicKey(userPublicKey).toBuffer(), uniqueIdBuffer],
        program.programId
      );

      const [userGameAcctPDA] = await findProgramAddressSync(
        [Buffer.from('user_game_acct')], new PublicKey(gameAcctPDA).toBuffer(),
        new PublicKey(gamerPublicKey).toBuffer(),
        program.programId
      );

      const [gamePassPDA] = await findProgramAddressSync(
        [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
        program.programId
      );
     
      const transaction = new Transaction();

      const instruction = program.instruction.initializeUserGameAccount(
        new BN(uniqueId),
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
      tx.feePayer = new PublicKey(userPublicKey);  

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
      console.error('Error initialize User Game Account:', error);
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


  async handleInitializeGame(data) {
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


}

export default new UserService();

//