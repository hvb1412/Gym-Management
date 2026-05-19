export const successResponse = (res, statusCode, message, data = null) => {
    const responsePayload = {
        success: true,
        message: message,
    };

    // Chỉ đính kèm data nếu có dữ liệu trả về (để JSON nhìn gọn gàng)
    if (data !== null) {
        responsePayload.data = data;
    }

    return res.status(statusCode).json(responsePayload);
};