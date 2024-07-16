import { Router } from "express";
import UserController from"../controllers/user/user.controller.js";
//import uploadHandler from "../middlewares/upload.middleware.js";

class UserRoutes extends UserController {

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  routes() {
  
   this.router.get("/getMainAccount", this.getMainAccount);

  } 

}

export default new UserRoutes().router;
