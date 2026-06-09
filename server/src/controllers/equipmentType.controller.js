import { EquipmentType } from '../models/index.js';

export const getEquipmentTypes = async (req, res) => {
  try {
    const types = await EquipmentType.findAll({ where: { isActive: true } });
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách loại thiết bị", error: error.message });
  }
};

export const createEquipmentType = async (req, res) => {
  try {
    const newType = await EquipmentType.create(req.body);
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo loại thiết bị", error: error.message });
  }
};

export const updateEquipmentType = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await EquipmentType.update(req.body, { where: { typeId: id } });
    if (updated) {
      const updatedType = await EquipmentType.findByPk(id);
      res.status(200).json(updatedType);
    } else {
      res.status(404).json({ message: "Không tìm thấy loại thiết bị" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
  }
};

export const deleteEquipmentType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await EquipmentType.findOne({ where: { typeId: id, isActive: true } });
    if (!type) {
      return res.status(404).json({ message: "Không tìm thấy loại thiết bị" });
    }
    await type.update({ isActive: false });
    res.status(200).json({ message: "Đã vô hiệu hóa loại thiết bị thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi vô hiệu hóa", error: error.message });
  }
};
