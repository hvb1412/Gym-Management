import { Room } from '../models/index.js';

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll({ where: { operatingStatus: 'active' } });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách phòng tập", error: error.message });
    }
};

export const createRoom = async (req, res) => {
    try {
        const { roomCode, roomName, roomType, operatingStatus } = req.body;
        const newRoom = await Room.create({ roomCode, roomName, roomType, operatingStatus });
        res.status(201).json({ success: true, data: newRoom });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo phòng tập", error: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomCode, roomName, roomType, operatingStatus } = req.body;
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ message: "Không tìm thấy phòng tập" });
        }
        await room.update({ roomCode, roomName, roomType, operatingStatus });
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật phòng tập", error: error.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findOne({ where: { roomId: id, operatingStatus: 'active' } });
        if (!room) {
            return res.status(404).json({ message: "Không tìm thấy phòng tập" });
        }
        await room.update({ operatingStatus: 'inactive' });
        res.status(200).json({ success: true, message: "Đã vô hiệu hóa phòng tập thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi vô hiệu hóa phòng tập", error: error.message });
    }
};
