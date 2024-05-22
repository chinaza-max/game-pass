import { User,Task ,
  EmailandTelValidation,
  TaskReponse,AsignTask
} from "../db/models/index.js";
import userUtil from "../utils/user.util.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize } from "sequelize";
import mailService from "../service/mail.service.js";
import crypto from 'crypto';


import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";

class UserService {
  UserModel = User;
  TaskModel = Task;
  AsignTaskModel = AsignTask;
  EmailandTelValidationModel=EmailandTelValidation
  TaskReponseModel=TaskReponse
 

  

  
  async handleCreateTask(data,file) {
    let { 
      userId,
      title,
      taskDescription,
      amount,
      expiryDate
    } = await userUtil.verifyHandleCreateTask.validateAsync(data);

      let imageURL=''
      if(file){
    
        if(serverConfig.NODE_ENV == "production"){
          imageURL =
          serverConfig.DOMAIN +
          file.path.replace("/home", "");
        }
        else if(serverConfig.NODE_ENV == "development"){
    
          imageURL = serverConfig.DOMAIN+file.path.replace("public", "");
        }
    
       
      }

      if(imageURL!=''){
        await this.TaskModel.create({
          userId:userId,
          taskDescription:taskDescription,
          taskImage:imageURL,
          title,
          amount:amount,
          expiryDate
        });
      }else{
        await this.TaskModel.create({
          userId:userId,
          taskDescription:taskDescription,
          title,
          amount:amount,
          expiryDate
        });
      }

  }


  async handleRemoveChild(data) {
    let { 
      userId,
      userId2,
    } = await userUtil.verifyHandleRemoveChild.validateAsync(data);


    const result =await this.AsignTaskModel.findOne({
      where:{
        userId:userId2,
      }
    });

    console.log("result")
    console.log(result)
    console.log("result")


    if (result) throw new BadRequestError("Cant remove child that has task assigned ");



      const result2=await this.UserModel.findByPk(userId2)
      if(result2){

        result2.destroy()

        return "Child removed successfully"
      }
      else{
        return "No child found"

      }
  }
    
  async handleAsignTask(data) {
    let { 
      userId,
      taskId,
      userId2,
    } = await userUtil.verifyHandleAsignTask.validateAsync(data);


    const result =await this.UserModel.findOne({
      where:{
        id:userId2,
        parentUserId:userId
      }
    });

    const result2 =await this.AsignTaskModel.findOne({
      where:{
        taskId,
        userId:userId2
      }
    });

    if (!result) throw new ConflictError("Child does not belong to Parent");
    if (result2) return;

    await this.AsignTaskModel.create({
      taskId,
      userId:userId2
    });

  }


  async handleSubmitTask(data,file) {
    let { 
      userId,
      taskId,
      reponse,
    } = await userUtil.verifyHandleSubmitTask.validateAsync(data);

      let imageUrl=''
      if(file){
    
        if(serverConfig.NODE_ENV == "production"){
          imageUrl =
          serverConfig.DOMAIN +
          file.path.replace("/home", "");
        }
        else if(serverConfig.NODE_ENV == "development"){
    
          imageUrl = serverConfig.DOMAIN+file.path.replace("public", "");
        }
    
        
      }

      const  result=await this.TaskReponseModel.findOne({
        where:{
          userId,
          taskId
        }
      })

      const  result2=await this.TaskModel.findOne({
        where:{
          id:taskId
        }
      })

      const  result3=await this.AsignTaskModel.findOne({
        where:{
          taskId,
          userId
        }
      })

      console.log("result3")
      console.log(result3)
      console.log(userId)
      console.log(taskId)

      console.log("result3")

      
      if (result) throw new BadRequestError("Only 1 response is allowed");
      if (!result2||!result3) throw new BadRequestError("No task found ");


      try {

      if(imageUrl!=''){
        await this.TaskReponseModel.create({
          userId:userId,
          reponse,
          taskId,
          TaskResponseImage:imageUrl,
        });
      }else{
        await this.TaskReponseModel.create({
          userId:userId,
          taskId,
          reponse
        });
      }


     
        
      } catch (error) { 
        throw new SystemError(error.name,  error.parent)

      }


  }
  
  
  async handleDeleteResponse(data) {
    let { 
      taskResponseId,
    } = await userUtil.verifyHandleDeleteSubmitTask.validateAsync(data);


      const result=await this.TaskReponseModel.findOne({
        where:{
          id:taskResponseId
        }
      })

      if (result.status==true) throw new BadRequestError("You can delete task response that has been accepted");
        const result2 = await this.TaskReponseModel.findByPk(taskResponseId);
        await result2.destroy();
      
  }

  async handleDeleteSubmitTask(data) {
    let { 
      taskResponseId,
    } = await userUtil.verifyHandleDeleteSubmitTask.validateAsync(data);


      const result=await this.TaskReponseModel.findByPk(taskResponseId)

      if(result){
          
        if (result.status==true) throw new BadRequestError("You can delete task response that has been accepted");
        const result2 = await this.TaskReponseModel.findByPk(taskResponseId);
          await result2.destroy();
          return "Task response deleted successfully"
      } else{
        return "No response found"
      }


      
  }
  
  async handleAcceptTask(data) {
    let { 
      taskId,
      value,
      userId2 //this person who did the task 
    } = await userUtil.verifyHandleAcceptTask.validateAsync(data);

      const result=await this.TaskModel.findByPk(taskId)
      const result2=await this.AsignTaskModel.findOne({
        where:{
          taskId,
          userId:userId2
        }
      })

      if (result) throw new BadRequestError("No task with this id ");

        result.update({
          taskStatus:value
        });

        if(result2){
          result2.update({
            status:value
          });
        }
        
      
  }


  async handleDeleteTask(data) {
    let { 
      taskId,
    } = await userUtil.verifyHandleDeleteTask.validateAsync(data);


      const result=await this.TaskReponseModel.findOne({
        where:{
          taskId:taskId
        }
      })

        
      if (result) throw new BadRequestError("This task can not be deleted already has response");
        const result2 = await this.Task.findByPk(taskId);
        await result2.destroy();
      

  }


  async handleGetMyChildren(data) {
    let { 
      userId
    } = await userUtil.verifyHandleGetMyChildren.validateAsync(data);

    try {

      const result=await this.UserModel.findAll({
        where:{
          parentUserId:userId
        }
      })

      return result

    } catch (error) {
      console.log(error)
        throw new SystemError(error.name,  error.parent)
    }

  }
  async handleWhoIAm(data) {
    let { 
      userId
    } = await userUtil.verifyHandleWhoIAm.validateAsync(data);

    try {

      const result=await this.UserModel.findByPk(userId)

      return result

    } catch (error) {
      console.log(error)
        throw new SystemError(error.name,  error.parent)
    }

  }

  async handleAccountCount(data) {
    let { 
      userId,
   
    } = await userUtil.verifyHandleAccountCount.validateAsync(data);

    let result ={};

    try {

      const numberOfChildren=await this.UserModel.count({
            where:{
              parentUserId:userId
            }
      })

      const numberOfTask=await this.TaskModel.count({
        where:{
          userId
        }
      })

      const AmountSpent=await this.TaskModel.sum('amount', {
        where:{
          parentUserId:userId,
          taskStatus:true
        }
      })

      const AmountPending=await this.TaskModel.sum('amount', {
        where:{
          parentUserId:userId,
          taskStatus:true
        }
      })


      result.numberOfChildren
      result.AmountPending
      result.AmountSpent
      result.numberOfTask

      return result


    } catch (error) {
      console.log(error)
        throw new SystemError(error.name,  error.parent)
    }

  }
  
  async handleGetResponse(data) {
    let { 
      taskId,
      type,
      userId,
      offset,
      pageSize
    } = await userUtil.verifyHandleGetResponse.validateAsync(data);

    let result =[];
    let details=[];

    try {

      if(type=="myResponse"){
        details=await this.TaskReponseModel.findOne({
          where: {
            taskId,
            userId,
            isDeleted:false
          },
          include: [
            {
              model: this.UserModel,
              attributes:['id','firstName'
              ,'lastName','PublicKey',
              'parentUserId','image',
              'gender','emailAddress'],
            }
          ]
        })
      }else{
        details=await this.TaskReponseModel.findAll({
          limit:Number(pageSize),
          offset:Number(offset),
          where: {
            taskId,
            isDeleted:false
          },
          include: [
            {
              model: this.UserModel,
              attributes:['id','firstName'
              ,'lastName','PublicKey',
              'parentUserId','image',
              'gender','emailAddress'],
            }
          ]
        })
      }
    
      
        
      return result||[]
    } catch (error) {
      console.log(error)
        throw new SystemError(error.name,  error.parent)
    }

  }

  async handleGetTask(data,) {
    let { 
      userId,
      type,
      type2,
      offset,
      pageSize
    } = await userUtil.verifyHandleGetTask.validateAsync(data);

    let result =[];
    let details=[];


    try {

      if(type2=='parent'){

        if(Number(pageSize)){
          if(type=='Unassigned'){
            details=await this.TaskModel.findAll({
              limit:Number(pageSize),
              offset:Number(offset),
              where: {
                userId:userId,
                status:false,
                isDeleted:false,
                //'$AsignTasks.id$': null
              },
              include: [
                {
                  model: this.AsignTaskModel,
                  as: "AsignTasks",
                  required:false,
                  where: {
                    isDeleted: false,
                  }
                },
                {
                  model: this.UserModel,
                  attributes:['id','firstName'
                  ,'lastName','PublicKey',
                  'parentUserId','image',
                  'gender','emailAddress'],
                }
              ]
            })
          }
          else if(type=='Pending'){
            details=await this.TaskModel.findAll({
              limit:Number(pageSize),
              offset:Number(offset),
              where: {
                userId:userId,
                status:true,
                isDeleted:false
              },
              include: [
                {
                  model: this.TaskReponseModel,
                  as: "taskReponses",
                  required:false,
                  where: {
                    isDeleted: false,
                  }

                },
                {
                  model: this.AsignTaskModel,
                  as: "AsignTasks",
                  where: {
                    isDeleted: false,
                  },
                },
                {
                  model: this.UserModel,
                  attributes:['id','firstName'
                  ,'lastName','PublicKey',
                  'parentUserId','image',
                  'gender','emailAddress'],
                }
              ]
            })
          }
          else if(type=='Completed'){
            details=await this.TaskModel.findAll({
              limit:Number(pageSize),
              offset:Number(offset),
              where: {
                userId:userId,
                status:true,
                isDeleted:false
              },
              include: [
                {
                  model: this.TaskReponseModel,
                  as: "taskReponses",
                  required:false,
                  where: {
                    isDeleted: false,
                  },
                },
                {
                  model: this.UserModel,
                  attributes:['id','firstName'
                  ,'lastName','PublicKey',
                  'parentUserId','image',
                  'gender','emailAddress'],
                }
              ]
            })
          }
          else if(type=='All'){
            details=await this.TaskModel.findAll({
              limit:Number(pageSize),
              offset:Number(offset),
              where: {
                userId:userId,
                isDeleted:false
              },
              include: [
                {
                  model: this.TaskReponseModel,
                  as: "taskReponses",
                  required:false,
                  where: {
                    isDeleted: false,
                  },
                },
                {
                  model: this.UserModel,
                  attributes:['id','firstName'
                  ,'lastName','PublicKey',
                  'parentUserId','image',
                  'gender','emailAddress'],
                }
                
              ]
            })
          }
        }

      }
      else{

        const result = await this.UserModel.findByPk(userId)
        const userId2 = result.parentUserId
    

        if(userId2){
            if(type=='Pending'){


              console.log("dddddddddddddd")
              console.log(userId2)

              details=await this.TaskModel.findAll({
                limit:Number(pageSize),
                offset:Number(offset),
                where: {
                  userId:userId2,
                  status:false,
                  isDeleted:false
                },
                include: [
                  {
                    model: this.TaskReponseModel,
                    as: "taskReponses",
                    required:false,
                    where: {
                      isDeleted: false,
                    },
                    include: [
                      {
                        model: this.UserModel,
                        attributes:['id','firstName'
                        ,'lastName','PublicKey',
                        'parentUserId','image',
                        'gender','emailAddress'],
                      }
                    ]
                  },
                  {
                    model: this.AsignTaskModel,
                    as: "AsignTasks",
                    where:{
                      userId
                    }
                  }
                  
                ]
              })
            }
            else if(type=='Completed'){
              details=await this.TaskModel.findAll({
                limit:Number(pageSize),
                offset:Number(offset),
                where: {
                  userId:userId2,
                  status:true,
                  isDeleted:false
                },
                include: [
                  {
                    model: this.TaskReponseModel,
                    as: "taskReponses",
                    required:false,
                    where: {
                      isDeleted: false,
                    },
                    include: [
                      {
                        model: this.UserModel,
                        attributes:['id','firstName'
                        ,'lastName','PublicKey',
                        'parentUserId','image',
                        'gender','emailAddress'],
                      }
                    ]
                  },
                  
                  {
                    model: this.AsignTaskModel,
                    as: "AsignTasks",
                    where:{
                      userId
                    }
                  }
                  
                ]
              })
            }
            else if(type=='All'){
              details=await this.TaskModel.findAll({
                limit:Number(pageSize),
                offset:Number(offset),
                where: {
                  userId:userId2,
                  isDeleted:false
                },
                include: [
                  {
                    model: this.TaskReponseModel,
                    as: "taskReponses",
                    required:false,
                    where: {
                      isDeleted: false,
                    },
                    include: [
                      {
                        model: this.UserModel,
                        attributes:['id','firstName'
                        ,'lastName','PublicKey',
                        'parentUserId','image',
                        'gender','emailAddress'],
                      },
                      {
                        model: this.AsignTaskModel,
                        as: "AsignTasks",
                        where:{
                          userId
                        }
                      }
                    ]
                  },
                  
                ]
              })
            }
          
        }
       

      }
    
      return details
    } catch (error) {
      console.log(error)
        throw new SystemError(error.name,  error.parent)
    }

  }

  async  sendEmailVerificationCode(emailAddress, userId ,password) {

    try {
      
        let keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
        const verificationCode =Math.floor(Math.random() * 9000000) + 100000;
    
        await this.EmailandTelValidationAdminModel.upsert({
          userId,
          type: 'email',
          verificationCode,
          expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
        }, {
          where: {
            userId
          }
        });
    
        try {

          const params = new URLSearchParams();
                params.append('userId', userId);
                params.append('verificationCode',verificationCode);
                params.append('type', 'email');

            
            await mailService.sendMail({ 
              to: emailAddress,
              subject: "Account details and verification",
              templateName: "adminWelcome",
              variables: {
                password,
                email: emailAddress,
                domain: serverConfig.DOMAIN,
                resetLink:serverConfig.NODE_ENV==='development'?`http://localhost/COMPANYS_PROJECT/verifyEmail.html?${params.toString()}`: `${serverConfig.DOMAIN}/adminpanel/PasswordReset.html?${params.toString()}`
              },
            });
    
        } catch (error) {
            console.log(error)
        }
    
    
    } catch (error) {
      console.log(error);
    }

  }

  async generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }


}

export default new UserService();

//