import gameService from "../../service/game.service.js";


export default class GameController {

  async initializeGame(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleInitializeGame(my_bj);
  

      return res.status(200).json({
        status: 200,
        message: "success.",
        data: response,

      });
    } catch (error) {
      console.log(error)
      next(error);
    }
  }




  async initializeUserGameAccount(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleInitializeUserGameAccount(my_bj);

      return res.status(200).json({
        status: 200,
        message: "success.",
        data: response
      });

    } catch (error) {
      console.log(error)
      next(error);
    }
  }
 


  async getTrasaction(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
      const response=await gameService.handleGetTrasaction(my_bj);
        console.log(response)

      return res.status(200).json({
        status: 200,
        data: response,
      });
    } catch (error) {
      console.log(error)
      next(error);
    }
  }


}
