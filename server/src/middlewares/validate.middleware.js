import AppError from "../utils/AppError.js";

const validate = (schema) => (req, res, next) => {
    const described = typeof schema?.describe === 'function' ? schema.describe() : null;
    const keys = described?.keys || {};

    const objectToValidate = {};
    if (keys.body) objectToValidate.body = req.body;
    if (keys.query) objectToValidate.query = req.query;
    if (keys.params) objectToValidate.params = req.params;

    const { value, error } = schema.validate(objectToValidate, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');

        return next(new AppError(`Dữ liệu không hợp lệ: ${errorMessage}`, 400));
    }

    if (value.body) req.body = value.body;
    if (value.params) Object.assign(req.params, value.params);
    return next();
};

export default validate;