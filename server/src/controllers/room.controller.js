import { Room } from '../models/index.js';

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách phòng tập", error: error.message });
    }
};
