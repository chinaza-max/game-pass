import { Model, DataTypes } from "sequelize";


class User extends Model {}

export function init(connection) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isEmailValid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      publicKey: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      parentUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }, 
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isImageVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      }, 
      gender: {
        type: DataTypes.ENUM(
          'Male',
          'Female',
          'Others',
        ),
        allowNull: true,
      },

   
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:true
      },
     
      disableAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      notificationAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:true
      },   
     
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'User',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default User ;



  

  