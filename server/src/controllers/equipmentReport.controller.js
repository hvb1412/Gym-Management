import { EquipmentReport, Equipment, Room, EquipmentType } from '../models/index.js';

export const getEquipmentReports = async (req, res) => {
  try {
    const reports = await EquipmentReport.findAll({
      where: { isActive: true },
      include: [
        {
          model: Equipment,
          attributes: ['equipmentCode', 'equipmentId'],
          include: [
            { model: Room, attributes: ['roomName'] },
            { model: EquipmentType, attributes: ['equipmentName'] }
          ]
        }
      ]
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách báo cáo bảo trì", error: error.message });
  }
};

export const createEquipmentReport = async (req, res) => {
  try {
    const newReport = await EquipmentReport.create(req.body);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo báo cáo", error: error.message });
  }
};

export const updateEquipmentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await EquipmentReport.update(req.body, { where: { reportId: id } });
    if (updated) {
      const updatedReport = await EquipmentReport.findByPk(id);
      res.status(200).json(updatedReport);
    } else {
      res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật báo cáo", error: error.message });
  }
};

export const deleteEquipmentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await EquipmentReport.findOne({ where: { reportId: id, isActive: true } });
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }
    await report.update({ isActive: false });
    res.status(200).json({ message: "Đã vô hiệu hóa báo cáo bảo trì thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi vô hiệu hóa báo cáo", error: error.message });
  }
};
