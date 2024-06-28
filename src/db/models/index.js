import {  Sequelize } from "sequelize";
import PasswordReset, { init as initPasswordReset } from "./passwordReset.js";
import EmailandTelValidation, { init as initEmailandTelValidation } from "./emailAndTelValidation.js";



function associate() {


  /*
  User.hasMany(Task, {
    foreignKey: 'userId',
    as: "Tasks",
  });
  Task.belongsTo(User, {
    foreignKey: 'userId',
  })


  User.hasMany(TaskReponse, {
    foreignKey: 'userId',
    as: "userTaskReponse",
  });
  TaskReponse.belongsTo(User, {
    foreignKey: 'userId',
  })
  
  Task.hasMany(AsignTask, {
    foreignKey: 'userId',
    as: "asignTasks",
  });
  AsignTask.belongsTo(Task, {
    foreignKey: 'userId',
  })
  

  Task.hasMany(TaskReponse, {
    foreignKey: 'taskId',
    as: "taskReponses",
  });
  TaskReponse.belongsTo(Task, {
    foreignKey: 'taskId'
  })
*/
  
  
  //console.log(BusinessSpot.associations)
  //console.log(UserDate.associations)


  
}

async function authenticateConnection(connection) {
  try {
    await connection.authenticate();
    console.log('Connection to database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export {
 // User,
  //Task,
  //TaskReponse,
  PasswordReset,
  EmailandTelValidation,
}

export function init(connection) {
  //initUser(connection);
  //initTask(connection);
 // initTaskReponse(connection);
  initPasswordReset(connection)
  initEmailandTelValidation(connection)
  //initAsignTask(connection)
  associate();
  authenticateConnection(connection)
}
