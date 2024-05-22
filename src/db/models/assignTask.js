import { Model, DataTypes } from "sequelize";

class AsignTask extends Model {}

export function init(connection) {
  AsignTask.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      
    },
    {
      timestamps: true,
      tableName: 'AsignTask',
      sequelize: connection,
      underscored:false
    }
  );
}

export default AsignTask;
