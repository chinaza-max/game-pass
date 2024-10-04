import { Router } from "express";
import GameController from"../controllers/game/game.controller.js";
//import uploadHandler from "../middlewares/upload.middleware.js";

class GameRoutes extends GameController {

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  routes() {    

    this.router.post("/initializeGamePassAccount", this.initializeGamePassAccount);
    this.router.post("/initializeGame", this.initializeGame);       
    this.router.post("/getTrasaction", this.getTrasaction);
    this.router.post("/initializeUserGameAccount", this.initializeUserGameAccount);
    this.router.post("/userGameAccountActions", this.userGameAccountActions);
    this.router.post("/doesUserGameAccountExist", this.doesUserGameAccountExist);
    
    this.router.get("/getAllGameAccount", this.getAllGameAccount);
    this.router.get("/getAllUserGameAccount", this.getAllUserGameAccount);
    this.router.get("/getSingleUserGameAccount", this.getSingleUserGameAccount);
    this.router.get("/getSingleGameAccount", this.getSingleGameAccount);
 
  } 

} 

export default new GameRoutes().router;
