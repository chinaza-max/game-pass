import { Model, DataTypes } from "sequelize";

class TaskResponse extends Model {}

export function init(connection) {
  TaskResponse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reponse:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      TaskResponseImage:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      
    },
    {
      timestamps: true,
      tableName: 'TaskResponse',
      sequelize: connection,
      underscored:false
    }
  );
}

export default TaskResponse;
