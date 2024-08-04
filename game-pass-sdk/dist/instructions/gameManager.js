"use strict";
/*import { GamePassSDK } from '../main/gamePassSDK.js';
import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { GamePassAccount, GameAccountInfo, UserGameAccount } from '../utils/interfaces.js'; // Import the interfaces


export class GameManager extends GamePassSDK {
  async updateUserLevel(level: number, GameOwnerkeypair: anchor.web3.Keypair, userGameAcctPublicKey:PublicKey) {

    const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey, this.program)
    const GameAccountInfor=await this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId), this.program)

    const tx = await this.program.methods.updateUserLevel(
      new anchor.BN(level)
    )
    .accounts({
      userGameAcct: userGameAcctPublicKey,
      gameAcct:  UserGameAccountInfor.gameId,
      signer: new PublicKey(GameAccountInfor.owner).toString(),
    })
    .signers([GameOwnerkeypair])
    .rpc();
    
    return tx;
  }

  async updateUserScore(score: number, GameOwnerkeypair: anchor.web3.Keypair, userGameAcctPublicKey:PublicKey) {

    const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey, this.program)
    const GameAccountInfor=await this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId), this.program)

    const tx = await this.program.methods.updateUserLevel(
      new anchor.BN(score)
    )
    .accounts({
      userGameAcct: userGameAcctPublicKey,
      gameAcct: UserGameAccountInfor.gameId,
      signer: new PublicKey(GameAccountInfor.owner).toString(),
    })
    .signers([GameOwnerkeypair])
    .rpc();
    
    return tx;

  }

  async getGameAccountInfor(pubkeyKey: PublicKey, program: anchor.Program): Promise<GameAccountInfo> {
    const gameAccountInfor = await program.account.gameAccts.fetch(pubkeyKey.toString());
    return gameAccountInfor as GameAccountInfo;
  }

  async getUserGameAccountInfor(pubkeyKey: PublicKey, program: anchor.Program): Promise<GameAccountInfo> {
    const gameAccountInfor = await program.account.userGameAccount.fetch(pubkeyKey);
    return gameAccountInfor as GameAccountInfo;
  }

}
*/ 
