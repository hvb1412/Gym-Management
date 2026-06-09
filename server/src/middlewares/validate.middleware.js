import AppError from "../utils/AppError.js";

const validate = (schema) => (req, res, next) => {
    const validateSchema = {};
    if(schema.body) validateSchema.body = schema.body;
    if(schema.query) validateSchema.query = schema.query;
    if(schema.params) validateSchema.params = schema.params;

    const objectToValidate = {};
    if(schema.body) objectToValidate.body = req.body;
    if(schema.query) objectToValidate.query = req.query;
    if(schema.params) objectToValidate.params = req.params;

    const { value, error } = schema.validate(objectToValidate, { abortEarly: false });

    if(error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');

        return next(new AppError(`Dữ liệu không hợp lệ: ${errorMessage}`, 400));
    }

    Object.assign(req, value);
    return next();
};

export default validate;