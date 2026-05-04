import { Model, DataTypes } from "sequelize";
import sequelize from '../../configs/database.js';

class Account extends Model {}

Account.init({
    accountId:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email:{   
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
    },
    password:{ 
        type: DataTypes.STRING, 
        allowNull: false 
    },
}, {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    underscored: true,
    timestamps: true
});

export default Account;