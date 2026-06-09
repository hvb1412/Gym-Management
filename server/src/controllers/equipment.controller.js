import { Equipment, EquipmentType, Room } from '../models/index.js';

export const getEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      where: { isActive: true },
      include: [
        { model: EquipmentType, attributes: ['equipmentName'] },
        { model: Room, attributes: ['roomName'] }
      ]
    });
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách thiết bị", error: error.message });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const newEquipment = await Equipment.create(req.body);
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo thiết bị", error: error.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Equipment.update(req.body, { where: { equipmentId: id } });
    if (updated) {
      const updatedEq = await Equipment.findByPk(id);
      res.status(200).json(updatedEq);
    } else {
      res.status(404).json({ message: "Không tìm thấy thiết bị" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findOne({ where: { equipmentId: id, isActive: true } });
    if (!equipment) {
      return res.status(404).json({ message: "Không tìm thấy thiết bị" });
    }
    await equipment.update({ isActive: false, usageStatus: "Đã vô hiệu hóa" });
    res.status(200).json({ message: "Đã vô hiệu hóa thiết bị thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi vô hiệu hóa", error: error.message });
  }
};
