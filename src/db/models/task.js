import { Model, DataTypes } from "sequelize";

class Task extends Model {}

export function init(connection) {
  Task.init(
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
      title:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      taskDescription:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      taskImage:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amount:{
        type: DataTypes.FLOAT,
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
      tableName: 'Task',
      sequelize: connection,
      underscored:false
    }
  );
}

export default Task;
