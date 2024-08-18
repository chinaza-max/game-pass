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

  
  async getSingleGameAccount(
    req,
    res,
    next
  ){
    const data=req.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetSingleGameAccount(my_bj);

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

  async getSingleUserGameAccount(
    req,
    res,
    next
  ){
    const data=req.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetSingleUserGameAccount(my_bj);

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
  
  async getAllUserGameAccount(
    req,
    res,
    next
  ){
    const data=req.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetAllUserGameAccount(my_bj);

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


  

  async doesUserGameAccountExist(
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
                          
        const response= await gameService.handleDoesUserGameAccountExist(my_bj);

        if(response){
          return res.status(200).json({
            status: 200,
            message: "success.",
            data: response
          });
        }else{
          return res.status(400).json({
            status: 400,
            message: "Action  failed.",
          });
        }
      

    } catch (error) {
      console.log(error)
      next(error);
    }
  }


  async userGameAccountActions(
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
                          
        const response= await gameService.handleUserGameAccountActions(my_bj);

        if(response){
          return res.status(200).json({
            status: 200,
            message: "success.",
            data: response
          });
        }else{
          return res.status(400).json({
            status: 400,
            message: "Action  failed.",
          });
        }
      

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

        if(response){
          return res.status(200).json({
            status: 200,
            message: "success.",
            data: response
          });
        }else{
          return res.status(400).json({
            status: 400,
            message: "account initialization failed.",
          });
        }
      

    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  
  async getSigleUserGameAccount(
    req,
    res,
    next
  ){
    const data=body.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetSigleUserGameAccount(my_bj);

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

  async getAllGameAccount(
    req,
    res,
    next
  ){
    const data=req.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetAllGameAccount(my_bj);

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

  async getSigleGameAccount(
    req,
    res,
    next
  ){
    const data=body.query
 
    try {
        const my_bj = {
          ...data,
          //userId:req.user.id,
        }
                          
        const response= await gameService.handleGetSigleGameAccount(my_bj);

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
