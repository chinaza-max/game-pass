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

    this.router.post("/initializeGame", this.initializeGame);
    this.router.post("/getTrasaction", this.getTrasaction);
    this.router.post("/initializeUserGameAccount", this.initializeUserGameAccount);
    
    //admin and user and use this route 
    this.router.get("/getAllGameAccount", this.getAllGameAccount);

    this.router.get("/getAllUserGameAccount", this.getAllUserGameAccount);

  } 

}

export default new GameRoutes().router;
