import {
  EmailandTelValidation,
} from "../db/models/index.js";
import gameUtil from "../utils/game.util.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize } from "sequelize";
import mailService from "./mail.service.js";
import crypto from 'crypto';


import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";

class UserService {
  EmailandTelValidationModel=EmailandTelValidation 

  
  async handleInitializeGame(data) {
    let { 
      user,
      uniqueId,
      gameName,
      createdAt
    } = await gameUtil.verifyHandleInitializeGame.validateAsync(data);

    try {

      const userKeypair = Keypair.fromSecretKey(new Uint8Array(user));

      const gameAcct = Keypair.generate();
      const [gamePassPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('game_pass')],
        programId
      );
  
      const tx = await program.methods.initializeGame(
        new web3.BN(uniqueId),
        gameName,
        new web3.BN(createdAt),
        {
          accounts: {
            gameAcct: gameAcct.publicKey,
            gamePass: gamePassPDA,
            user: userKeypair.publicKey,
            systemProgram: SystemProgram.programId,
            rent: web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [userKeypair, gameAcct],
        }
      );
  
      res.send({ tx, gameAcct: gameAcct.publicKey.toString() });
    } catch (error) {
      
    }

  }


}

export default new UserService();

//