import { Model, DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

class Bill extends Model {}

Bill.init({
    billId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 } // Chỗ này để ae đảm bảo tiền không được âm nhé
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    payDate: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Bill',
    tableName: 'bills',
    underscored: true, // Cái này giúp map billId -> bill_id
    timestamps: true,
});

export default Bill;

