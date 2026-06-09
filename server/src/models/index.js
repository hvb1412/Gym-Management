import sequelize from "../configs/database.js";
import Account from "./user/account.model.js";
import Member from "./user/member.model.js";
import Staff from "./user/staff.model.js";
import Room from "./facility/room.model.js";
import Bill from "./operation/bill.model.js";
import Feedback from "./operation/feedback.model.js";
import Equipment from "./facility/equipment.model.js";
import WorkoutLog from "./operation/workoutLog.model.js";
import StaffWorkLog from "./facility/staffWorkLog.model.js";
import EquipmentType from "./facility/equipmentType.model.js";
import EquipmentReport from "./facility/equipmentReport.model.js";
import SubscriptionPlan from "./operation/subscriptionPlan.model.js";
import SubscriptionPackage from "./operation/subscriptionPackage.model.js";

// 1. Account <-> Member/Staff (1-1)
Account.hasOne(Member, { foreignKey: "accountId" });
Member.belongsTo(Account, { foreignKey: "accountId" });

Account.hasOne(Staff, { foreignKey: "accountId" });
Staff.belongsTo(Account, { foreignKey: "accountId" });

// 2. Staff <-> WorkLog (1-N)
Staff.hasMany(StaffWorkLog, { foreignKey: "staffId" });
StaffWorkLog.belongsTo(Staff, { foreignKey: "staffId" });

// 3. Cơ sở vật chất (1-N)
Room.hasMany(Equipment, { foreignKey: "roomId" });
Equipment.belongsTo(Room, { foreignKey: "roomId" });

EquipmentType.hasMany(Equipment, { foreignKey: "typeId" });
Equipment.belongsTo(EquipmentType, { foreignKey: "typeId" });

Equipment.hasMany(EquipmentReport, { foreignKey: "equipmentId" });
EquipmentReport.belongsTo(Equipment, { foreignKey: "equipmentId" });

Staff.hasMany(EquipmentReport, { foreignKey: "reporterId" });
EquipmentReport.belongsTo(Staff, { foreignKey: "reporterId", as: "Reporter" });

// 4. Gói tập và Hóa đơn (Logic mới)
Member.hasMany(SubscriptionPlan, { foreignKey: "memberId" });
SubscriptionPlan.belongsTo(Member, { foreignKey: "memberId" });

SubscriptionPackage.hasMany(SubscriptionPlan, { foreignKey: "packageId" });
SubscriptionPlan.belongsTo(SubscriptionPackage, { foreignKey: "packageId" });

// Khóa ngoại bill_id nằm trong SubscriptionPlan (cho phép null)
Bill.hasMany(SubscriptionPlan, { foreignKey: "billId" });
SubscriptionPlan.belongsTo(Bill, { foreignKey: "billId" });

// 5. Nhật ký tập luyện
Member.hasMany(WorkoutLog, { foreignKey: "memberId" });
WorkoutLog.belongsTo(Member, { foreignKey: "memberId" });

Staff.hasMany(WorkoutLog, { foreignKey: "recorderId" });
WorkoutLog.belongsTo(Staff, { foreignKey: "recorderId", as: "Recorder" });

// 6. Phản hồi
Member.hasMany(Feedback, { foreignKey: "memberId" });
Feedback.belongsTo(Member, { foreignKey: "memberId" });

Staff.hasMany(Feedback, { foreignKey: "answererId" });
Feedback.belongsTo(Staff, { foreignKey: "answererId", as: "Answerer" });

// Export tất cả để các Controller sử dụng
export {
  sequelize,
  Account,
  Member,
  Staff,
  Room,
  EquipmentType,
  Equipment,
  EquipmentReport,
  StaffWorkLog,
  SubscriptionPackage,
  Bill,
  SubscriptionPlan,
  WorkoutLog,
  Feedback,
};
