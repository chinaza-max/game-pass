import * as anchor from '@project-serum/anchor';
import { getProvider } from '../utils/provider.js';
import { Wallet , Idl } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js'
import { Keypair, SystemProgram, PublicKey, Transaction } from '@solana/web3.js';
import { GamePass, GameAccts, UserGameAccount, 
  GameAccts2 , UserGameAccount2,  
  BadgeCreationResult, InitializeGameResult,
  GetSerializedInitializeGameTransactionResult,
  IntializeGamePassResult,
  GetSerializedInitializeUserGameAccountTransactionResult,
  UpdateUserLevelResult,
  UpdateUserScoreResult,
  GetSerializedUpdateUserAvatarTransactionResult,
  AssignBadgeResult,
  UpdateLeaderboardResult,
  createTieredBadgeResult,
  Tier ,
  UpdateBadgeProgressResult} from '../utils/interfaces.js'; // Import the interfaces
const myProgramId="JBJoGmeBtQ8NNhz4QqH1c1onikK4MERB5Sz3mvHwokmP"
import IDL  from "../utils/idl.json"  assert { type: 'json' };
import BN from 'bn.js';



const programId = new PublicKey(myProgramId as string);

       

export class GamePassSDK {
  provider: anchor.Provider;
  program: anchor.Program;
  gamePassAccount: PublicKey;
  GameOwnerkeypair: Keypair;

  constructor(keypair: Keypair) {
    this.provider = getProvider(keypair);
    this.GameOwnerkeypair=keypair
    this.gamePassAccount = new PublicKey('HxXJeZzHM8hyimqqzoho7bpYoXzPd6sPoqBSfsFUQ93e');
    this.program = new anchor.Program(IDL as Idl, programId, this.provider);
  }

  async initializeGame(gameName: string , gameAvatar: string): Promise<InitializeGameResult> {

    try {
    
      if(!this.GameOwnerkeypair)  throw new Error('You need to initial the SDK with your keypair');

      const result=await  this.checkIfthisUserHastheGameName(this.GameOwnerkeypair.publicKey, gameName)

      if(result==false){
          const createdAt = Date.now();

          const uniqueId = Math.floor(Date.now() / 1000); 
          const uniqueIdBuffer = Buffer.alloc(8);
          uniqueIdBuffer.writeUInt32LE(uniqueId, 0)

          const [gameAcctPDA, gameAcctBump] = findProgramAddressSync(
            [Buffer.from('game_acct'), this.GameOwnerkeypair.publicKey.toBuffer(),uniqueIdBuffer],
            this.program.programId
          );


          const tx = await this.program.methods.initializeGame(
            new BN(uniqueId),
            gameName,
            gameAvatar,
            new BN(createdAt)
          )
          .accounts({
            gameAcct: gameAcctPDA,
            gamePass: this.gamePassAccount,
            user: this.GameOwnerkeypair.publicKey,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

          //console.log('Transaction successful:', tx);
      }else{
        throw new Error('Failed to initialize game, game name already exist');
      }
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }


  async getSerializedInitializeGameTransaction(gameOwnerPublicKey: PublicKey, gameName: string, gameAvatar: string): Promise<GetSerializedInitializeGameTransactionResult> {
    try {

      const result=await  this.checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName)

      if(result==false){

          const createdAt = Date.now();

          const uniqueId2 = Math.floor(Date.now() / 1000);
          const uniqueIdBuffer = Buffer.alloc(8);
          uniqueIdBuffer.writeUInt32LE(uniqueId2, 0);

          const [gameAcctPDA] = findProgramAddressSync(
            [Buffer.from('game_acct'), new PublicKey(gameOwnerPublicKey).toBuffer(), uniqueIdBuffer],
            this.program.programId
          );

          const gamePassPDA = this.gamePassAccount

          const transaction = new Transaction();

          
          const instruction =await this.program.methods.initializeGame(
            new BN(uniqueId2),
            gameName,
            gameAvatar,
            new BN(createdAt),
          )
          .accounts({
                gameAcct: gameAcctPDA,
                gamePass: gamePassPDA,
                user: new PublicKey(gameOwnerPublicKey),
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              
            })
            .instruction();

          transaction.add(instruction);
          transaction.feePayer = new PublicKey(gameOwnerPublicKey);

          const blockHash = (await this.program.provider.connection.getLatestBlockhash('finalized')).blockhash;
          transaction.recentBlockhash = blockHash;

          const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');

          return { serializedTransaction: serializedTransaction, uniqueId: uniqueId2 };
      }else{
        throw new Error('Failed to initialize game, game name already exist');
      }

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


  async intializeGamePass(): Promise<IntializeGamePassResult> {
    
    try {

    const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC||'')
    const secretKey = Uint8Array.from(secret)
    const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)


    const [gamePassPDA, bump] = await findProgramAddressSync(
      [Buffer.from('game_pass'), Keypair.publicKey.toBuffer()],
      this.program.programId
    );
 
  
    const tx = await this.program.methods.intializeGamePass()
        .accounts({
          gamePass: gamePassPDA,      
          user: Keypair.publicKey.toString(),
          systemProgram: SystemProgram.programId,
          rent:anchor.web3.SYSVAR_RENT_PUBKEY       
        }
      ).signers([Keypair])
      .rpc(); 

      return {
        transactionSignature: tx
      };
      console.log('Transaction successful:', tx);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error intializeGamePass main account:', error.message);
        console.error('Error intializeGamePass main account:', error);
        throw new Error(`Failed to intialize GamePass  account: ${error.message}`);
      } else {     
        console.error('Unknown error initializing GamePass account:', error);
        throw new Error('Failed to initialize main account due to an unknown error.');
      }
    }
  }

  async getSerializedInitializeUserGameAccountTransaction(
    gameId: PublicKey,
    userAvatar: string,
    gamerPublicKey: PublicKey
  ): Promise<GetSerializedInitializeUserGameAccountTransactionResult>  {

    try {

    const createdAt = Date.now();


    const program = this.program;

    const result = await this.doesGameIdExist(gameId.toString());
    const result2 = await this.getGameAccountInfor(new PublicKey(gameId));
    const uniqueId = result2.uniqueId.toString(); 
    const GameOwnerPublicKey = new PublicKey(result2.owner);

    if (!result) {
      throw new Error("gameId does not exist");
    }

    const uniqueIdBuffer = Buffer.alloc(8);
    uniqueIdBuffer.writeUInt32LE(Number(uniqueId), 0);

    const [gameAcctPDA] = await findProgramAddressSync(
      [Buffer.from('game_acct'), GameOwnerPublicKey.toBuffer(), uniqueIdBuffer],
      program.programId
    );

    const [userGameAcctPDA] = await findProgramAddressSync(
      [Buffer.from('user_game_acct'), gameAcctPDA.toBuffer(), new PublicKey(gamerPublicKey).toBuffer()],
      program.programId
    );

    const transaction = new Transaction();

    const instruction =await program.methods.initializeUserGameAccount(
      gameId.toString(),
      userAvatar,
      new BN(createdAt)
    )
      .accounts({
          userGameAcct: userGameAcctPDA,
          gamePass: this.gamePassAccount,
          gameAcct: gameId,
          user: gamerPublicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }).instruction();

    transaction.add(instruction);
    transaction.feePayer = new PublicKey(gamerPublicKey);

    const blockHash = (await this.provider.connection.getLatestBlockhash('finalized')).blockhash;
    transaction.recentBlockhash = blockHash;

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
    return { serializedTransaction: serializedTransaction };

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


  async getGamePassAccounts(): Promise<GamePass> {


    const gameAccount = await this.program.account.gamePass.fetch(this.gamePassAccount.toString());

    return gameAccount as GamePass;
  }

async getGameAccountInfor(gameId: PublicKey): Promise<GameAccts> {
  const gameAccountInfor = await this.program.account.gameAccts.fetch(gameId);
  return gameAccountInfor as GameAccts;
}

async getUserGameAccountInfor(PublicKey: PublicKey): Promise<UserGameAccount2> {

  const gameAccountInfor = await this.program.account.userGameAccount.fetch(PublicKey.toString());
  return gameAccountInfor as UserGameAccount2;
}




async doesGameIdExist(gameId: string): Promise<boolean> {

const gamePassAccount = await this.getGamePassAccounts();

  for (let index = 0; index < gamePassAccount.games.length; index++) {
    const element = gamePassAccount.games[index];

    if (element.gameId == gameId) return true;

  }

  return false;
}


async doesUserGameAccoutExist(userGameAcctPublicKey: string): Promise<boolean> {

  const gamePassAccount = await this.getGamePassAccounts();

    for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
      const element = gamePassAccount.userGameAccount[index];
  
      if (element.accountId == userGameAcctPublicKey) return true;
  
    }
  
    return false;
}

async doesUserGameAccoutExist2(gameId:PublicKey, gamerPublicKey: PublicKey ): Promise<boolean> {

  const gamePassAccount = await this.getGamePassAccounts();

    for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
      const element = gamePassAccount.userGameAccount[index];
      const UserGameAccountInfor=await this.getUserGameAccountInfor(new PublicKey(element.accountId))
 
      if (UserGameAccountInfor.owner.toString() == gamerPublicKey.toString()) return true;
  
    }
  
    return false;
}

  
async updateUserLevel(level: number, userGameAcctPublicKey:PublicKey): Promise<UpdateUserLevelResult> {


    try {

      const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey)
      const GameAccountInfor=await this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId))
  
      const tx = await this.program.methods.updateUserLevel(
        new BN(level)
      )
      .accounts({
        userGameAcct: userGameAcctPublicKey,
        gameAcct:  UserGameAccountInfor.gameId,
        signer: new PublicKey(GameAccountInfor.owner).toString(),
      })
      .signers([this.GameOwnerkeypair])
      .rpc();
      
      return {transactionSignature:tx};
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error updating score: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        throw new Error("An unknown error occurred while updating level");
      }
    }

}

async updateUserScore(score: number, userGameAcctPublicKey:PublicKey): Promise<UpdateUserScoreResult> {

  try {

      const UserGameAccountInfor=await this.getUserGameAccountInfor(userGameAcctPublicKey)
      const GameAccountInfor=await this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId))

      const tx = await this.program.methods.updateUserScore(
        new BN(score)
      )
      .accounts({
        userGameAcct: userGameAcctPublicKey,
        gameAcct: UserGameAccountInfor.gameId,
        signer: new PublicKey(GameAccountInfor.owner).toString(),
      })
      .signers([this.GameOwnerkeypair])
      .rpc();

      return {transactionSignature:tx};

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error updating score: ${error.message}`);
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unknown error occurred while updating score");
    }
  }

}

async checkIfthisUserHastheGameName(gameOwnerPublicKey: PublicKey, gameName: string): Promise<boolean> {
  let myState = false;

  const result= await this.getGamePassAccounts()
  for (let index = 0; index < result.games.length; index++) {
    const gameId = result.games[index].gameId;
    const result2= await this.program.account.gameAccts.fetch(gameId) as GameAccts;

    if(gameOwnerPublicKey.toString() == new PublicKey(result2.owner).toString()){
        if (result2.gameName==gameName) {
          myState = true;
          break
        }
    }

  }

  return myState;
}

  async  getSerializedUpdateUserAvatarTransaction(
    userGameAcctPublicKey: PublicKey, 
    gamerPublicKey: PublicKey,
    avatar: string): Promise<GetSerializedUpdateUserAvatarTransactionResult>  {

    try {

      const transaction = new Transaction();

      const instruction = await this.program.methods.updateUserAvatar(
        avatar
      ).accounts({
            userGameAccount:userGameAcctPublicKey,
            signer: gamerPublicKey
        }).instruction();
  
      transaction.add(instruction);
      transaction.feePayer = new PublicKey(gamerPublicKey);
  
      const blockHash = (await this.provider.connection.getLatestBlockhash('finalized')).blockhash;
      transaction.recentBlockhash = blockHash;
  
      const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
      return { serializedTransaction: serializedTransaction };
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error updating user avatar: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        throw new Error("An unknown error occurred while updating user avatar");
      }
    }

  }


  async getAllGameUniqueId(gameOwnerPublicKey: PublicKey):Promise<number[]>  {

    const uniqueId:number[]=[]

    const result= await this.getGamePassAccounts()
    for (let index = 0; index < result.games.length; index++) {
      const gameId = result.games[index].gameId;
      const result2= await this.program.account.gameAccts.fetch(gameId) as GameAccts;
      
      if(gameOwnerPublicKey.toString() == new PublicKey(result2.owner).toString()){
        
        uniqueId.push(Number(result2.uniqueId.toString()))
          
      }

    }

    return uniqueId
  }


  async getAllGameAccountsForUser(gameOwnerPublicKey: PublicKey): Promise<GameAccts2[]>{
   

    try {
      const gameAccount:GameAccts2[] =[];

      const result= await this.getGamePassAccounts()
      if(result){
        for (let index = 0; index < result.games.length; index++) {
          const element = result.games[index];
          
          const accountGameAccountInfo= await this.getGameAccountInfor(new PublicKey(element.gameId))
          if(new PublicKey(accountGameAccountInfo.owner).toString()== gameOwnerPublicKey.toString()){
            gameAccount.push({...accountGameAccountInfo,uniqueId:Number(accountGameAccountInfo.uniqueId.toString())})
          }
  
        }
      }
  
     return gameAccount 


    } catch (error) {
      if (error instanceof Error) {
        throw new Error(` ${error.message}`);
      } else {
        console.error( error);
        return [];
      }


    }
  }

  async getAllGameAccounts(): Promise<GameAccts2[]>{
   

    try {
      const gameAccount:GameAccts2[] =[];

      const result= await this.getGamePassAccounts()
      if(result){
        for (let index = 0; index < result.games.length; index++) {
          const element = result.games[index];
          
          const accountGameAccountInfo= await this.getGameAccountInfor(new PublicKey(element.gameId))
          gameAccount.push({...accountGameAccountInfo,uniqueId:Number(accountGameAccountInfo.uniqueId.toString())})
        
        }
      }
  
     return gameAccount 


    } catch (error) {
      if (error instanceof Error) {
        throw new Error(` ${error.message}`);
      } else {
        console.error( error);
        return [];
      }


    }
  }

  async getSingleUserGameAccount(gameId:PublicKey, gamerPublicKey:PublicKey): Promise<UserGameAccount2>{
   
    try {  
        
    const result= await this.doesGameIdExist(gameId.toString())
    if(result){


      const gamePassAccount=await this.getGamePassAccounts()

      for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
        const accountPDA = gamePassAccount.userGameAccount[index].accountId;
        const userGameAccount= await this.getUserGameAccountInfor(new PublicKey(accountPDA))

        if(userGameAccount.gameId==gameId.toString() && userGameAccount.owner.toString() == gamerPublicKey.toString()){

          return {
            ...userGameAccount,
            level: Number(userGameAccount.level.toString()),
            score: Number(userGameAccount.score.toString())
          };

        }
      }

    }else{
      throw("gameId is not found ")
    }
    throw("No user account found")

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching user game account: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        throw new Error("An unknown error occurred while fetching user game account");
      }

    }
  }

  async getSingleUserGameAccountAccountId(userGameAcctPublicKey:PublicKey): Promise<UserGameAccount2>{
   
    try {  
      const userGameAccount= await this.getUserGameAccountInfor(userGameAcctPublicKey)

      return {
        ...userGameAccount,
        level: Number(userGameAccount.level.toString()),
        score: Number(userGameAccount.score.toString())
      };


    } catch (error) {
       if (error instanceof Error) {
      throw new Error(`Error fetching user game account: ${error.message}`);
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unknown error occurred while fetching user game account");
    }

    }
  }

  async getAllUserGameAccount(gameId:PublicKey): Promise<UserGameAccount2[]>{

    const userGameAccounts:UserGameAccount2[] =[];

    try {  

    const result= await this.doesGameIdExist(gameId.toString())
    if(result){

      const gamePassAccount=await this.getGamePassAccounts()

      for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
        const accountPDA = gamePassAccount.userGameAccount[index].accountId;
        const userGameAccount= await this.getUserGameAccountInfor(new PublicKey(accountPDA))
        if(userGameAccount.gameId==gameId.toString()){
          userGameAccounts.push({...userGameAccount,"level":Number(userGameAccount.level.toString()),
            "score":Number(userGameAccount.score.toString())})
        }
      }

    }else{
      throw("gameId is not found ")
    }

    return userGameAccounts 

    } catch (error) {

      if (error instanceof Error) {
        throw new Error(`Error fetching user game account: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        throw new Error("An unknown error occurred while fetching user game account");
      }


    }

  }

  async createBadge(gameId: PublicKey ,badgeMintAddress: PublicKey ,badgeName: string , badgeDescription: string, badgeImageUri: string, criteria: string): Promise<BadgeCreationResult> {

    try {
      const result=await  this.doesGameIdExist(gameId.toString())

      if(result){

          const tx = await this.program.methods.createBadge(
            badgeName,
            badgeDescription,
            badgeImageUri,
            criteria
          )
          .accounts({
            gameAcct: gameId,
            badge: badgeMintAddress,
            user: this.GameOwnerkeypair.publicKey,
            systemProgram: SystemProgram.programId
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

      }else{
        throw new Error('gameId is not found');
      }


      
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }



  async assignBadge(gameId: PublicKey ,badgeMintAddress: PublicKey ,userGameAcctPublicKey: PublicKey ): Promise<AssignBadgeResult> {

    try {
      const result=await  this.doesGameIdExist(gameId.toString())

      if(result){

          const tx = await this.program.methods.assignBadge()
          .accounts({
            gameAcct: gameId,
            badge: badgeMintAddress,
            user: this.GameOwnerkeypair.publicKey,
            userGameAcct: userGameAcctPublicKey
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

      }else{
        throw new Error('gameId is not found');
      }


      
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }



  async updateLeaderboard(gameId: PublicKey ,leaderboardAddress: PublicKey ,userGameAcctPublicKey: PublicKey ): Promise<UpdateLeaderboardResult> {

    try {
      const result=await  this.doesGameIdExist(gameId.toString())

      if(result){

          const tx = await this.program.methods.updateLeaderboard()
          .accounts({
            gameAcct: gameId,
            leaderboard: leaderboardAddress,
            userGameAcct: userGameAcctPublicKey,
            user: this.GameOwnerkeypair.publicKey,
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

      }else{
        throw new Error('gameId is not found');
      }
      
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }


  async createTieredBadge(gameId: PublicKey ,badgeMintAddress: PublicKey , badgeName:string, badgeDescription:string, tiers: Tier[], criteria:string ): Promise<createTieredBadgeResult> {


    const tiersWithBN= tiers.map((tier) => ({
      ...tier,
      requiredProgress: new BN(tier.requiredProgress)
    }));

    try {
      const result=await  this.doesGameIdExist(gameId.toString())

      if(result){
          const tx = await this.program.methods.createTieredBadge(
            badgeName,
            badgeDescription,
            tiersWithBN,
            criteria
          )
          .accounts({
            gameAcct: gameId,
            badge: badgeMintAddress,
            user:  this.GameOwnerkeypair.publicKey,
            systemProgram: SystemProgram.programId
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

      }else{
        throw new Error('gameId is not found');
      }
      
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }

  async updateBadgeProgress(userGameAcctPublicKey: PublicKey ,progress:number, userBadgeProgressAddress: PublicKey, badgeMintAddress: PublicKey): Promise<UpdateBadgeProgressResult> {

    try {
      const result=await  this.doesUserGameAccoutExist(userGameAcctPublicKey.toString())

      if(result){

          const tx = await this.program.methods.createTieredBadge(
            new BN(progress)
          )
          .accounts({
            badge: badgeMintAddress,
            userBadgeProgress: userBadgeProgressAddress,
            userGameAcct: userGameAcctPublicKey,
            user: this.GameOwnerkeypair.publicKey
          })
          .signers([this.GameOwnerkeypair])
          .rpc();

          return {
            transactionSignature: tx
          };

      }else{
        throw new Error('user game account is not found please check your userGameAcctPublicKey');
      }
      
    } catch (error) {
      if (error instanceof Error) {
       // console.error('Error initializing game:', error);
        throw new Error(`Failed to initialize game: ${error.message}`);
      } else {
       // console.error('Unknown error initializing game:', error);
        throw new Error('Failed to initialize game due to an unknown error.');
      }
    }
  
  }


}
