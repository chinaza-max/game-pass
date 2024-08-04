import { 
  EmailandTelValidation
} from "../db/models/index.js";
import userUtil from "../utils/user.util.js";
import bcrypt from'bcrypt';
//import serverConfig from "../config/server.js";
//import {  Op, Sequelize } from "sequelize";
//import mailService from "./mail.service.js";
import DB from '../db/index.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import {  PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import {Wallet} from '@project-serum/anchor';
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

class UserService { 
 
    

  async handleInitializeMainAccount(data) {
    /*let { 
      userId,
    } = await userUtil.verifyHandleInitializeMainAccount.validateAsync(data);
    */

    try {
      
      const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC)
      const secretKey = Uint8Array.from(secret)
      const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)
      
      const GamePassSDKInstance=new GamePassSDK(new Wallet(Keypair))

      GamePassSDKInstance.intializeGamePass()

            
  /*
      const {gamePassKeypair, program, connection}=DB.getBlockChainData()

      const [gamePassPDA, bump] = await findProgramAddressSync(
        [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
        program.programId
      );*/
      
/*
      console.log(gamePassKeypair.publicKey.toString())

      console.log("gamePassPDA")
      console.log(gamePassPDA.toString())
      console.log(bump[0])
      console.log("gamePassPDA")*/

    /*  const gameAccount = await program.account.gamePass.fetch(gamePassPDA);

      console.log(gameAccount)   */ 

      //below is game accout
      //const gamePassAccount = await connection.getAccountInfo(new PublicKey("5XpUCd6TWzWLyPVGkU8VkdW3hM7m13akUdSNCZEHNmrc"));
      //const gamePassAccount = await connection.getAccountInfo(new PublicKey("7na7Yed7Xhs7FZpbziHHWPogwQBHxv4hUCgsh1KTew1Z"));
      
      //const gamePassAccount = await program.account.userGameAccount.fetch("7na7Yed7Xhs7FZpbziHHWPogwQBHxv4hUCgsh1KTew1Z");
     // const gamePassAccount = await program.account  //.gameAccts.fetch("5XpUCd6TWzWLyPVGkU8VkdW3hM7m13akUdSNCZEHNmrc");
      //const gameAccount = await program.account.gamePass.fetch(gamePassPDA);
      //const gamePassAccount = await program.account.userGameAcct.fetch("7na7Yed7Xhs7FZpbziHHWPogwQBHxv4hUCgsh1KTew1Z");
      //const gamePassAccount = await connection.getAccountInfo(new PublicKey("7na7Yed7Xhs7FZpbziHHWPogwQBHxv4hUCgsh1KTew1Z"));
  
      //console.log(gamePassAccount)
   
      /*

      const tx = await program.methods.initializeMainAccount()
        .accounts({
          gamePass: gamePassPDA,      
          user: gamePassKeypair.publicKey,
          systemProgram: SystemProgram.programId,
          rent:anchor.web3.SYSVAR_RENT_PUBKEY       
        }
      ).signers([gamePassKeypair])
      .rpc(); 
      console.log(tx)

      */

    } catch (error) {
      console.log(error)
    }

  }


}

export default new UserService();