/*import { GamePassSDK } from '../main/gamePassSDK.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import * as anchor from '@project-serum/anchor';
import dotenv from 'dotenv';
import path from 'path';


import { SystemProgram } from '@solana/web3.js';
//dotenv.config({ path: path.resolve(__dirname, '../../.env') });


export class InitializeMainAccount extends GamePassSDK {


  async initializeMainAccount() {
    
    try {

    const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC||'')
    const secretKey = Uint8Array.from(secret)
    const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)


    const [gamePassPDA, bump] = await findProgramAddressSync(
      [Buffer.from('game_pass'), Keypair.publicKey.toBuffer()],
      this.program.programId
    );
 
    

    const tx = await this.program.methods.initializeMainAccount()
        .accounts({
          gamePass: gamePassPDA,      
          user: Keypair.publicKey.toString(),
          systemProgram: SystemProgram.programId,
          rent:anchor.web3.SYSVAR_RENT_PUBKEY       
        }
      ).signers([Keypair])
      .rpc(); 
      console.log('Transaction successful:', tx);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error initializing main account:', error.message);
        throw new Error(`Failed to initialize main account: ${error.message}`);
      } else {
        console.error('Unknown error initializing main account:', error);
        throw new Error('Failed to initialize main account due to an unknown error.');
      }
    }
  }
}*/
