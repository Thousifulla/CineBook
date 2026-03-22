const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
    });

    if (error) {
        const errors = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message.replace(/['"]/g, ''),
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body = value;
    next();
};

module.exports = validate;
