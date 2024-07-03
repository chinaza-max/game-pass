import {
    DataTypes,
    Model
  } from "sequelize";



  class Games extends Model {}

  export function init(connection) {
    Games.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      GameOwnerPublicKey: {
        type: DataTypes.TEXT,
        allowNull: false,
      }, 
      uniqueId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    }, {
      tableName: 'Games',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }



export default Games ;



  

  