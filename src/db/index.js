import { Sequelize } from "sequelize";
import serverConfig from "../config/server.js";
import { init as initModels } from "./models/index.js";
//const { PublicKey, Keypair, SystemProgram, Connection, sendAndConfirmTransaction } = require('@solana/web3.js');
import { Connection, clusterApiUrl, PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import idl from "./idl.json" assert { type: 'json' };
import {Wallet} from '@project-serum/anchor';


class DB {

  static program = null;
  static userKeypair = null;
  static connection = null;
    
  constructor() {
    this.sequelize 
  }

  async connectDB() {

    /*
    let caCertBuffer;
    try {
      caCertBuffer = fs.readFileSync('./ca-cert.pem').toString();
    } catch (error) {
      console.error('Error reading ca-cert.pem:', error);
      process.exit(1);
    }*/

    const options= { 
      logging: console.log,
      dialect: "mysql",
      host: serverConfig.DB_HOST,
      username: serverConfig.DB_USERNAME,
      password: serverConfig.DB_PASSWORD,
      port: Number(serverConfig.DB_PORT),
      database: serverConfig.DB_NAME,
      logQueryParameters: true
    };
    
    this.sequelize = new Sequelize(
      serverConfig.DB_NAME,
      serverConfig.DB_USERNAME,
      serverConfig.DB_PASSWORD,
      options
    );

    initModels(this.sequelize);
    if (serverConfig.NODE_ENV == "development") {  


        //await this.sequelize.sync({ alter: true }); 
        //await this.sequelize.sync({ force: true }); 
      }            
/*         
        (async () => {
          try {
            const [results] = await this.sequelize.query('SHOW TABLES;');
            const tables = results.map(result => result.Tables_in_your_database_name);
            console.log('List of tables:', tables);
          } catch (error) {
            console.error('Error retrieving tables:', error);
          } finally {
            await this.sequelize.close();
          }
        })();
*/
/*
        const disableForeignKeyChecks = 'SET foreign_key_checks = 0;';
const dropTable = 'DROP TABLE IF EXISTS WishList;';
const enableForeignKeyChecks = 'SET foreign_key_checks = 1;';

// Execute SQL commands
this.sequelize.query(disableForeignKeyChecks)
  .then(() => this.sequelize.query(dropTable))
  .then(() => this.sequelize.query(enableForeignKeyChecks))
  .then(() => {
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');

  })
  .catch((error) => {
    console.error('Error dropping table:', error);
  });
*/




       
  }
  
  async connectCLUSTERandReturnProgram() {

    const programId = new PublicKey(process.env.PROGRAM_ID);
    const connection = new Connection(clusterApiUrl('devnet'));


    const secret = JSON.parse(process.env.PRIVATE_KEY_BLOCK_CHAIN_PUBLIC)
    const secretKey = Uint8Array.from(secret)
    const Keypair = anchor.web3.Keypair.fromSecretKey(secretKey)
    
    const provider = new anchor.AnchorProvider(connection, new Wallet(Keypair), {});
    const program = new anchor.Program(idl, programId, provider);
     
    DB.program=program
    DB.userKeypair=Keypair
    DB.connection=connection

  }
  
  getBlockChainData() {
    return {gamePassKeypair:DB.userKeypair,program:DB.program,connection:DB.connection};
  }


}

export default new DB();
