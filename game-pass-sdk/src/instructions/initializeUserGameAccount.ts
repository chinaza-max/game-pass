
/*import { GamePassSDK } from '../main/gamePassSDK.js';
import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import { Keypair, SystemProgram, PublicKey, Transaction } from '@solana/web3.js';
import { GamePassAccount, GameAccountInfo, UserGameAccount } from '../utils/interfaces.js'; // Import the interfaces


export class InitializeUserGameAccount extends GamePassSDK {
    async initializeUserGameAccount(
        gameId: string,
        userGameAcctPublicKey: string,
        createdAt: number,
        gamePassKeypair: Keypair
      ) {

        try {

        const program = this.program;

        const result = await this.doesGameIdExist(gameId, program, gamePassKeypair);
        const result2 = await this.getGameAccountInfor(new PublicKey(gameId), program);
        const uniqueId = result2.uniqueId.toString();
        const GameOwnerPublicKey = new PublicKey(result2.owner).toString();
  
        if (!result) {
          throw new Error("gameId does not exist");
        }
  
        const uniqueIdBuffer = Buffer.alloc(8);
        uniqueIdBuffer.writeUInt32LE(Number(uniqueId), 0);
  
        const [gameAcctPDA] = await findProgramAddressSync(
          [Buffer.from('game_acct'), new PublicKey(GameOwnerPublicKey).toBuffer(), uniqueIdBuffer],
          program.programId
        );
  
        const [userGameAcctPDA] = await findProgramAddressSync(
          [Buffer.from('user_game_acct'), gameAcctPDA.toBuffer(), new PublicKey(userGameAcctPublicKey).toBuffer()],
          program.programId
        );
  
        const [gamePassPDA] = await findProgramAddressSync(
          [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
          program.programId
        );
  
        const transaction = new Transaction();
  
        const instruction = program.instruction.initializeUserGameAccount(
          new PublicKey(gameAcctPDA).toString(),
          new anchor.BN(createdAt),
          {
            accounts: {
              userGameAcct: userGameAcctPDA,
              gamePass: this.gamePassPublicKey,
              gameAcct: gameAcctPDA,
              user: new PublicKey(userGameAcctPublicKey),
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
        );
  
        transaction.add(instruction);
        transaction.feePayer = new PublicKey(userGameAcctPublicKey);
  
        const blockHash = (await this.provider.connection.getLatestBlockhash('finalized')).blockhash;
        transaction.recentBlockhash = blockHash;
  
        const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
        return { transaction: serializedTransaction };

    } catch (error) {
        if (error instanceof Error) {
          console.error('Error initializing user game account:', error.message);
          throw new Error(`Failed to initialize user game account: ${error.message}`);
        } else {
          console.error('Unknown error initializing user game account:', error);
          throw new Error('Failed to initialize user game account due to an unknown error.');
        }
      }
  }


  async getGamePassAccounts(program: anchor.Program, gamePassKeypair: Keypair): Promise<GamePassAccount> {
    const [gamePassPDA] = await findProgramAddressSync(
      [Buffer.from('game_pass'), gamePassKeypair.publicKey.toBuffer()],
      program.programId
    );

    const gameAccount = await program.account.gamePass.fetch(gamePassPDA);

    return gameAccount as GamePassAccount;
}

  async getGameAccountInfor(pubkeyKey: PublicKey, program: anchor.Program): Promise<GameAccountInfo> {
    const gameAccountInfor = await program.account.gameAccts.fetch(pubkeyKey);
    return gameAccountInfor as GameAccountInfo;
  }

  async getUserGameAccountInfor(pubkeyKey: PublicKey, program: anchor.Program) {
    const gameAccountInfor = await program.account.userGameAccount.fetch(pubkeyKey);
    return gameAccountInfor;
  }


  async doesGameIdExist(gameId: string, program: anchor.Program, gamePassKeypair: Keypair): Promise<boolean> {
    const gamePassAccount = await this.getGamePassAccounts(program, gamePassKeypair);

    for (let index = 0; index < gamePassAccount.games.length; index++) {
      const element = gamePassAccount.games[index];
      if (element.gameId == gameId) return true;
    }

    return false;
  }
  
}
*/