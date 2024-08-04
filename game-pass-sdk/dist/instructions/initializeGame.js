"use strict";
/*import { GamePassSDK } from '../main/gamePassSDK.js';
import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import { Keypair, SystemProgram,PublicKey,Transaction } from '@solana/web3.js';


export class InitializeGame extends GamePassSDK {
  async initializeGame(GameOwnerkeypair: Keypair,uniqueId: number, gameName: string, createdAt: number) {

    try {
      const [gameAcctPDA, gameAcctBump] = findProgramAddressSync(
        [Buffer.from('game_acct'), GameOwnerkeypair.publicKey.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods.initializeGame(
        new anchor.BN(uniqueId),
        gameName,
        new anchor.BN(createdAt)
      )
      .accounts({
        gameAcct: gameAcctPDA,
        gamePass: this.gamePassPublicKey,
        user: GameOwnerkeypair.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([GameOwnerkeypair])
      .rpc();

    console.log('Transaction successful:', tx);

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error initializing game:', error.message);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
        console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }


  async getInitializeGameTransactionHash(gameOwnerPublicKey: string, gamePassPublicKey: PublicKey, gameName: string, createdAt: number) {
    try {
      const uniqueId2 = Math.floor(Date.now() / 1000);
      const uniqueIdBuffer = Buffer.alloc(8);
      uniqueIdBuffer.writeUInt32LE(uniqueId2, 0);

      const [gameAcctPDA] = findProgramAddressSync(
        [Buffer.from('game_acct'), new PublicKey(gameOwnerPublicKey).toBuffer(), uniqueIdBuffer],
        this.program.programId
      );

      const [gamePassPDA] = findProgramAddressSync(
        [Buffer.from('game_pass'), gamePassPublicKey.toBuffer()],
        this.program.programId
      );

      const transaction = new Transaction();

      const instruction = this.program.instruction.initializeGame(
        new anchor.BN(uniqueId2),
        gameName,
        new anchor.BN(createdAt),
        {
          accounts: {
            gameAcct: gameAcctPDA,
            gamePass: gamePassPDA,
            user: new PublicKey(gameOwnerPublicKey),
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );

      transaction.add(instruction);
      transaction.feePayer = new PublicKey(gameOwnerPublicKey);

      const blockHash = (await this.program.provider.connection.getLatestBlockhash('finalized')).blockhash;
      transaction.recentBlockhash = blockHash;

      const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');

      return { transaction: serializedTransaction, uniqueId: uniqueId2 };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting transaction hash:', error.message);
        throw new Error(`Failed to get transaction hash: ${error.message}`);
      } else {
        console.error('Unknown error getting transaction hash:', error);
        throw new Error('Failed to get transaction hash due to an unknown error.');
      }
    }
  }


}
*/ 
