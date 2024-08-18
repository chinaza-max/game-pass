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
    constructor(keypair) {
        this.provider = getProvider(keypair);
        this.GameOwnerkeypair = keypair;
        this.gamePassAccount = new PublicKey('HxXJeZzHM8hyimqqzoho7bpYoXzPd6sPoqBSfsFUQ93e');
        this.program = new anchor.Program(IDL, programId, this.provider);
    }
    initializeGame(gameName, gameAvatar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.GameOwnerkeypair)
                    throw new Error('You need to initial the SDK with your keypair');
                const result = yield this.checkIfthisUserHastheGameName(this.GameOwnerkeypair.publicKey, gameName);
                if (result == false) {
                    const createdAt = Date.now();
                    const uniqueId = Math.floor(Date.now() / 1000);
                    const uniqueIdBuffer = Buffer.alloc(8);
                    uniqueIdBuffer.writeUInt32LE(uniqueId, 0);
                    const [gameAcctPDA, gameAcctBump] = findProgramAddressSync([Buffer.from('game_acct'), this.GameOwnerkeypair.publicKey.toBuffer(), uniqueIdBuffer], this.program.programId);
                    const tx = yield this.program.methods.initializeGame(new BN(uniqueId), gameName, gameAvatar, new BN(createdAt))
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
                }
                else {
                    throw new Error('Failed to initialize game, game name already exist');
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Failed to initialize game: ${error.message}`);
                }
                else {
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
                    return { serializedTransaction: serializedTransaction, uniqueId: uniqueId2 };
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
                return {
                    transactionSignature: tx
                };
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
    getSerializedInitializeUserGameAccountTransaction(gameId, userAvatar, gamerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createdAt = Date.now();
                const program = this.program;
                const result = yield this.doesGameIdExist(gameId.toString());
                const result2 = yield this.getGameAccountInfor(new PublicKey(gameId));
                const uniqueId = result2.uniqueId.toString();
                const GameOwnerPublicKey = new PublicKey(result2.owner);
                if (!result) {
                    throw new Error("gameId does not exist");
                }
                const uniqueIdBuffer = Buffer.alloc(8);
                uniqueIdBuffer.writeUInt32LE(Number(uniqueId), 0);
                const [gameAcctPDA] = yield findProgramAddressSync([Buffer.from('game_acct'), GameOwnerPublicKey.toBuffer(), uniqueIdBuffer], program.programId);
                const [userGameAcctPDA] = yield findProgramAddressSync([Buffer.from('user_game_acct'), gameAcctPDA.toBuffer(), new PublicKey(gamerPublicKey).toBuffer()], program.programId);
                const transaction = new Transaction();
                const instruction = yield program.methods.initializeUserGameAccount(gameId.toString(), userAvatar, new BN(createdAt))
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
                const blockHash = (yield this.provider.connection.getLatestBlockhash('finalized')).blockhash;
                transaction.recentBlockhash = blockHash;
                const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
                return { serializedTransaction: serializedTransaction };
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
    getGameAccountInfor(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameAccountInfor = yield this.program.account.gameAccts.fetch(gameId);
            return gameAccountInfor;
        });
    }
    getUserGameAccountInfor(PublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameAccountInfor = yield this.program.account.userGameAccount.fetch(PublicKey.toString());
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
    doesUserGameAccoutExist(userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamePassAccount = yield this.getGamePassAccounts();
            for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
                const element = gamePassAccount.userGameAccount[index];
                if (element.accountId == userGameAcctPublicKey)
                    return true;
            }
            return false;
        });
    }
    doesUserGameAccoutExist2(gameId, gamerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const gamePassAccount = yield this.getGamePassAccounts();
            try {
                for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
                    const element = gamePassAccount.userGameAccount[index];
                    const UserGameAccountInfor = yield this.getUserGameAccountInfor(new PublicKey(element.accountId));
                    if (UserGameAccountInfor.owner.toString() == gamerPublicKey.toString() && UserGameAccountInfor.gameId == gameId.toString()) {
                        return Object.assign(Object.assign({}, UserGameAccountInfor), { "level": Number(UserGameAccountInfor.level.toString()), "score": Number(UserGameAccountInfor.score.toString()) });
                    }
                }
                return null;
            }
            catch (error) {
                throw (error);
            }
        });
    }
    updateUserLevel(level, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const UserGameAccountInfor = yield this.getUserGameAccountInfor(userGameAcctPublicKey);
                const GameAccountInfor = yield this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId));
                const tx = yield this.program.methods.updateUserLevel(new BN(level))
                    .accounts({
                    userGameAcct: userGameAcctPublicKey,
                    gameAcct: UserGameAccountInfor.gameId,
                    signer: new PublicKey(GameAccountInfor.owner).toString(),
                })
                    .signers([this.GameOwnerkeypair])
                    .rpc();
                return { transactionSignature: tx };
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error updating score: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while updating level");
                }
            }
        });
    }
    updateUserScore(score, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const UserGameAccountInfor = yield this.getUserGameAccountInfor(userGameAcctPublicKey);
                const GameAccountInfor = yield this.getGameAccountInfor(new PublicKey(UserGameAccountInfor.gameId));
                const tx = yield this.program.methods.updateUserScore(new BN(score))
                    .accounts({
                    userGameAcct: userGameAcctPublicKey,
                    gameAcct: UserGameAccountInfor.gameId,
                    signer: new PublicKey(GameAccountInfor.owner).toString(),
                })
                    .signers([this.GameOwnerkeypair])
                    .rpc();
                return { transactionSignature: tx };
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error updating score: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while updating score");
                }
            }
        });
    }
    checkIfthisUserHastheGameName(gameOwnerPublicKey, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            let myState = false;
            const result = yield this.getGamePassAccounts();
            for (let index = 0; index < result.games.length; index++) {
                const gameId = result.games[index].gameId;
                const result2 = yield this.program.account.gameAccts.fetch(gameId);
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
    getSerializedUpdateUserAvatarTransaction(userGameAcctPublicKey, gamerPublicKey, avatar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = new Transaction();
                const instruction = yield this.program.methods.updateUserAvatar(avatar).accounts({
                    userGameAccount: userGameAcctPublicKey,
                    signer: gamerPublicKey
                }).instruction();
                transaction.add(instruction);
                transaction.feePayer = new PublicKey(gamerPublicKey);
                const blockHash = (yield this.provider.connection.getLatestBlockhash('finalized')).blockhash;
                transaction.recentBlockhash = blockHash;
                const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: true }).toString('base64');
                return { serializedTransaction: serializedTransaction };
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error updating user avatar: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while updating user avatar");
                }
            }
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
    getSingleUserGameAccount(gameId, gamerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const gamePassAccount = yield this.getGamePassAccounts();
                    for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
                        const accountPDA = gamePassAccount.userGameAccount[index].accountId;
                        const userGameAccount = yield this.getUserGameAccountInfor(new PublicKey(accountPDA));
                        if (userGameAccount.gameId == gameId.toString() && userGameAccount.owner.toString() == gamerPublicKey.toString()) {
                            return Object.assign(Object.assign({}, userGameAccount), { level: Number(userGameAccount.level.toString()), score: Number(userGameAccount.score.toString()) });
                        }
                    }
                }
                else {
                    throw ("gameId is not found ");
                }
                throw ("No user account found");
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error fetching user game account: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while fetching user game account");
                }
            }
        });
    }
    getSingleUserGameAccountAccountId(userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userGameAccount = yield this.getUserGameAccountInfor(userGameAcctPublicKey);
                return Object.assign(Object.assign({}, userGameAccount), { level: Number(userGameAccount.level.toString()), score: Number(userGameAccount.score.toString()) });
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error fetching user game account: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while fetching user game account");
                }
            }
        });
    }
    getAllUserGameAccount(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userGameAccounts = [];
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const gamePassAccount = yield this.getGamePassAccounts();
                    for (let index = 0; index < gamePassAccount.userGameAccount.length; index++) {
                        const accountPDA = gamePassAccount.userGameAccount[index].accountId;
                        const userGameAccount = yield this.getUserGameAccountInfor(new PublicKey(accountPDA));
                        if (userGameAccount.gameId == gameId.toString()) {
                            userGameAccounts.push(Object.assign(Object.assign({}, userGameAccount), { "level": Number(userGameAccount.level.toString()), "score": Number(userGameAccount.score.toString()) }));
                        }
                    }
                }
                else {
                    throw ("gameId is not found ");
                }
                return userGameAccounts;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error fetching user game account: ${error.message}`);
                }
                else {
                    console.error("Unknown error:", error);
                    throw new Error("An unknown error occurred while fetching user game account");
                }
            }
        });
    }
    createBadge(gameId, badgeMintAddress, badgeName, badgeDescription, badgeImageUri, criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const tx = yield this.program.methods.createBadge(badgeName, badgeDescription, badgeImageUri, criteria)
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
                }
                else {
                    throw new Error('gameId is not found');
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
    assignBadge(gameId, badgeMintAddress, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const tx = yield this.program.methods.assignBadge()
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
                }
                else {
                    throw new Error('gameId is not found');
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
    updateLeaderboard(gameId, leaderboardAddress, userGameAcctPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const tx = yield this.program.methods.updateLeaderboard()
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
                }
                else {
                    throw new Error('gameId is not found');
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
    createTieredBadge(gameId, badgeMintAddress, badgeName, badgeDescription, tiers, criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const tiersWithBN = tiers.map((tier) => (Object.assign(Object.assign({}, tier), { requiredProgress: new BN(tier.requiredProgress) })));
            try {
                const result = yield this.doesGameIdExist(gameId.toString());
                if (result) {
                    const tx = yield this.program.methods.createTieredBadge(badgeName, badgeDescription, tiersWithBN, criteria)
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
                }
                else {
                    throw new Error('gameId is not found');
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
    updateBadgeProgress(userGameAcctPublicKey, progress, userBadgeProgressAddress, badgeMintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.doesUserGameAccoutExist(userGameAcctPublicKey.toString());
                if (result) {
                    const tx = yield this.program.methods.createTieredBadge(new BN(progress))
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
                }
                else {
                    throw new Error('user game account is not found please check your userGameAcctPublicKey');
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
}
