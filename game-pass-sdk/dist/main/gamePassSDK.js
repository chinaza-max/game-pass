var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as anchor from '@project-serum/anchor';
import { getProvider } from '../utils/provider.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey.js';
import { SystemProgram, PublicKey, Transaction } from '@solana/web3.js';
const myProgramId = "JBJoGmeBtQ8NNhz4QqH1c1onikK4MERB5Sz3mvHwokmP";
import IDL from "../utils/idl.json" assert { type: 'json' };
import BN from 'bn.js';
const programId = new PublicKey(myProgramId);
export class GamePassSDK {
    constructor(wallet) {
        this.provider = getProvider(wallet);
        this.gamePassAccount = new PublicKey('HxXJeZzHM8hyimqqzoho7bpYoXzPd6sPoqBSfsFUQ93e');
        this.program = new anchor.Program(IDL, programId, this.provider);
    }
    initializeGame(GameOwnerkeypair, gameName, gameAvatar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.checkIfthisUserHastheGameName(GameOwnerkeypair.publicKey, gameName);
                if (result == false) {
                    const createdAt = Date.now();
                    const uniqueId = Math.floor(Date.now() / 1000);
                    const uniqueIdBuffer = Buffer.alloc(8);
                    uniqueIdBuffer.writeUInt32LE(uniqueId, 0);
                    const [gameAcctPDA, gameAcctBump] = findProgramAddressSync([Buffer.from('game_acct'), GameOwnerkeypair.publicKey.toBuffer(), uniqueIdBuffer], this.program.programId);
                    const tx = yield this.program.methods.initializeGame(new BN(uniqueId), gameName, gameAvatar, new BN(createdAt))
                        .accounts({
                        gameAcct: gameAcctPDA,
                        gamePass: this.gamePassAccount,
                        user: GameOwnerkeypair.publicKey,
                        systemProgram: SystemProgram.programId,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    })
                        .signers([GameOwnerkeypair])
                        .rpc();
                    console.log('Transaction successful:', tx);
                }
                else {
                    throw new Error('Failed to initialize game, game name already exist');
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    // console.error('Error initializing game:', error);
                    throw new Error(`Failed to initialize game: ${error.message}`);
                }
                else {
                    // console.error('Unknown error initializing game:', error);
                    throw new Error('Failed to initialize game due to an unknown error.');
                }
            }
        });
    }
    getSerializedInitializeGameTransaction(gameOwnerPublicKey, gameName, gameAvatar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName);
                if (result == false) {
                    const createdAt = Date.now();
                    const uniqueId2 = Math.floor(Date.now() / 1000);
                    const uniqueIdBuffer = Buffer.alloc(8);
                    uniqueIdBuffer.writeUInt32LE(uniqueId2, 0);
                    const [gameAcctPDA] = findProgramAddressSync([Buffer.from('game_acct'), new PublicKey(gameOwnerPublicKey).toBuffer(), uniqueIdBuffer], this.program.programId);
                    const gamePassPDA = this.gamePassAccount;
                    const transaction = new Transaction();
                    const instruction = yield this.program.methods.initializeGame(new BN(uniqueId2), gameName, gameAvatar, new BN(createdAt))
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
                    const blockHash = (yield this.program.provider.connection.getLatestBlockhash('finalized')).blockhash;
                    transaction.recentBlockhash = blockHash;
                    const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
                    return { transaction: serializedTransaction, uniqueId: uniqueId2 };
                }
                else {
                    throw new Error('Failed to initialize game, game name already exist');
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error getting transaction hash:', error.message);
                    throw new Error(`Failed to get transaction hash: ${error.message}`);
                }
                else {
                    console.error('Unknown error getting transaction hash:', error);
                    throw new Error('Failed to get transaction hash due to an unknown error.');
                }
            }
        });
    }
    intializeGamePass() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC || '');
                const secretKey = Uint8Array.from(secret);
                const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
                const [gamePassPDA, bump] = yield findProgramAddressSync([Buffer.from('game_pass'), Keypair.publicKey.toBuffer()], this.program.programId);
                const tx = yield this.program.methods.intializeGamePass()
                    .accounts({
                    gamePass: gamePassPDA,
                    user: Keypair.publicKey.toString(),
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                }).signers([Keypair])
                    .rpc();
                console.log('Transaction successful:', tx);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error intializeGamePass main account:', error.message);
                    console.error('Error intializeGamePass main account:', error);
                    throw new Error(`Failed to intialize GamePass  account: ${error.message}`);
                }
                else {
                    console.error('Unknown error initializing GamePass account:', error);
                    throw new Error('Failed to initialize main account due to an unknown error.');
                }
            }
        });
    }
    getSerializedInitializeUserGameAccountTransaction(gameId, userAvatar, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createdAt = Date.now();
                const program = this.program;
                const result = yield this.doesGameIdExist(gameId);
                const result2 = yield this.getGameAccountInfor(new PublicKey(gameId));
                const uniqueId = result2.uniqueId.toString();
                const GameOwnerPublicKey = new PublicKey(result2.owner);
                if (!result) {
                    throw new Error("gameId does not exist");
                }
                const uniqueIdBuffer = Buffer.alloc(8);
                uniqueIdBuffer.writeUInt32LE(Number(uniqueId), 0);
                console.log(GameOwnerPublicKey);
                const [gameAcctPDA] = yield findProgramAddressSync([Buffer.from('game_acct'), GameOwnerPublicKey.toBuffer(), uniqueIdBuffer], program.programId);
                const [userGameAcctPDA] = yield findProgramAddressSync([Buffer.from('user_game_acct'), gameAcctPDA.toBuffer(), new PublicKey(userGameAcctPublicKey).toBuffer()], program.programId);
                const transaction = new Transaction();
                const instruction = yield program.methods.initializeUserGameAccount(gameId, userAvatar, new BN(createdAt))
                    .accounts({
                    userGameAcct: userGameAcctPDA,
                    gamePass: this.gamePassAccount,
                    gameAcct: gameAcctPDA,
                    user: new PublicKey(userGameAcctPublicKey),
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                }).instruction();
                transaction.add(instruction);
                transaction.feePayer = new PublicKey(userGameAcctPublicKey);
                const blockHash = (yield this.provider.connection.getLatestBlockhash('finalized')).blockhash;
                transaction.recentBlockhash = blockHash;
                const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
                return { transaction: serializedTransaction };
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error initializing user game account:', error.message);
                    throw new Error(`Failed to initialize user game account: ${error.message}`);
                }
                else {
                    console.error('Unknown error initializing user game account:', error);
                    throw new Error('Failed to initialize user game account due to an unknown error.');
                }
            }
        });
    }
    getGamePassAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const gameAccount = yield this.program.account.gamePass.fetch(this.gamePassAccount.toString());
            return gameAccount;
        });
    }
    getGameAccountInfor(pubkeyKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameAccountInfor = yield this.program.account.gameAccts.fetch(pubkeyKey);
            return gameAccountInfor;
        });
    }
    getUserGameAccountInfor(pubkeyKey, program) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameAccountInfor = yield program.account.userGameAccount.fetch(pubkeyKey);
            return gameAccountInfor;
        });
    }
    doesGameIdExist(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamePassAccount = yield this.getGamePassAccounts();
            for (let index = 0; index < gamePassAccount.games.length; index++) {
                const element = gamePassAccount.games[index];
                if (element.gameId == gameId)
                    return true;
            }
            return false;
        });
    }
    updateUserLevel(level, GameOwnerkeypair, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const UserGameAccountInfor = yield this.getUserGameAccountInfor(userGameAcctPublicKey, this.program);
            const GameAccountInfor = yield this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId));
            const tx = yield this.program.methods.updateUserLevel(new BN(level))
                .accounts({
                userGameAcct: userGameAcctPublicKey,
                gameAcct: UserGameAccountInfor.gameId,
                signer: new PublicKey(GameAccountInfor.owner).toString(),
            })
                .signers([GameOwnerkeypair])
                .rpc();
            return tx;
        });
    }
    updateUserScore(score, GameOwnerkeypair, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const UserGameAccountInfor = yield this.getUserGameAccountInfor(userGameAcctPublicKey, this.program);
            const GameAccountInfor = yield this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId));
            const tx = yield this.program.methods.updateUserLevel(new BN(score))
                .accounts({
                userGameAcct: userGameAcctPublicKey,
                gameAcct: UserGameAccountInfor.gameId,
                signer: new PublicKey(GameAccountInfor.owner).toString(),
            })
                .signers([GameOwnerkeypair])
                .rpc();
            return tx;
        });
    }
    checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            let myState = false;
            const result = yield this.getGamePassAccounts();
            for (let index = 0; index < result.games.length; index++) {
                const gameId = result.games[index].gameId;
                const result2 = yield this.program.account.gameAccts.fetch(gameId);
                console.log(gameOwnerPublicKey.toString() == new PublicKey(result2.owner).toString());
                if (gameOwnerPublicKey.toString() == new PublicKey(result2.owner).toString()) {
                    if (result2.gameName == gameName) {
                        myState = true;
                        break;
                    }
                }
            }
            return myState;
        });
    }
    getAllGameUniqueId(gameOwnerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniqueId = [];
            const result = yield this.getGamePassAccounts();
            for (let index = 0; index < result.games.length; index++) {
                const gameId = result.games[index].gameId;
                const result2 = yield this.program.account.gameAccts.fetch(gameId);
                if (gameOwnerPublicKey.toString() == new PublicKey(result2.owner).toString()) {
                    uniqueId.push(Number(result2.uniqueId.toString()));
                }
            }
            return uniqueId;
        });
    }
    getAllGameAccountsForUser(gameOwnerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameAccount = [];
                const result = yield this.getGamePassAccounts();
                if (result) {
                    for (let index = 0; index < result.games.length; index++) {
                        const element = result.games[index];
                        const accountGameAccountInfo = yield this.getGameAccountInfor(new PublicKey(element.gameId));
                        if (new PublicKey(accountGameAccountInfo.owner).toString() == gameOwnerPublicKey.toString()) {
                            gameAccount.push(Object.assign(Object.assign({}, accountGameAccountInfo), { uniqueId: Number(accountGameAccountInfo.uniqueId.toString()) }));
                        }
                    }
                }
                return gameAccount;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(` ${error.message}`);
                }
                else {
                    console.error(error);
                    return [];
                }
            }
        });
    }
    getAllGameAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gameAccount = [];
                const result = yield this.getGamePassAccounts();
                if (result) {
                    for (let index = 0; index < result.games.length; index++) {
                        const element = result.games[index];
                        const accountGameAccountInfo = yield this.getGameAccountInfor(new PublicKey(element.gameId));
                        gameAccount.push(Object.assign(Object.assign({}, accountGameAccountInfo), { uniqueId: Number(accountGameAccountInfo.uniqueId.toString()) }));
                    }
                }
                return gameAccount;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(` ${error.message}`);
                }
                else {
                    console.error(error);
                    return [];
                }
            }
        });
    }
}
