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
import {  SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import {Wallet} from '@project-serum/anchor';



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
     
      const {userKeypair, program }=DB.getBlockChainData()

      const wallet=userKeypair
      const [gamePassPDA, bump] = await findProgramAddressSync(
        [Buffer.from('game_pass'), wallet.publicKey.toBuffer()],
        program.programId
      );
/*
      console.log(userKeypair.publicKey.toString())

      console.log("gamePassPDA")
      console.log(gamePassPDA.toString())
      console.log(bump[0])
      console.log("gamePassPDA")*/
      //const gamePassAccount = await connection.getAccountInfo(gamePassPDA);

      const gameAccount = await program.account.gamePass.fetch(gamePassPDA);

      console.log(gameAccount)
/*
      console.log("wallet.publicKey")
      console.log(wallet.publicKey)
      console.log("wallet.publicKey")

      const tx = await program.methods.initializeMainAccount()
        .accounts({
          gamePass: gamePassPDA,      
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent:anchor.web3.SYSVAR_RENT_PUBKEY       
        }
      ).signers([wallet])
      .rpc(); 
      console.log(tx)*/

    } catch (error) {
      console.log(error)
    }

  }


}

export default new UserService();