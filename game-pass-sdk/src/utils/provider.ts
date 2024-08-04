import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';



interface ConnectResult {
    program: anchor.Program;
    gamePassPublicKey: PublicKey;
    connection: Connection;
  }





export const getProvider = (wallet: anchor.Wallet):anchor.Provider => {


    // Create a new connection to the Solana devnet
    const connection = new Connection(clusterApiUrl('devnet'));
  
    // Ensure PRIVATE_KEY_BLOCK_CHAIN_PUBLIC is defined
   // const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC as string);
    //const secretKey = Uint8Array.from(secret);
  
    // Create Keypair from secret key
    //const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
  
    // Create an Anchor provider
    const provider = new anchor.AnchorProvider(connection,wallet, {
      commitment: 'confirmed',
    });
  
    return provider
    // Create the program instance
    //const program = new anchor.Program(idl , programId, provider);
  
    /*
    // Return the values
    return {
      program,
      gamePassPublicKey: keypair.publicKey,
      connection,
    };*/
};
