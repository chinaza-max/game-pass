import { Router } from "express";
import OwnerController from"../controllers/owner/owner.controller.js";

class OwnerRoutes extends OwnerController {

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post("/initializeMainAccount", this.initializeMainAccount);
    
  } 

}

export default new OwnerRoutes().router;
