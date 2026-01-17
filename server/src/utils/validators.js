export const requireFields = (fields = []) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (field) => req.body[field] === undefined || req.body[field] === "",
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        fields: missing,
      });
    }

    next();
  };
};

export const validateEnum = (field, allowedValues = []) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && !allowedValues.includes(value)) {
      return res.status(400).json({
        message: `Invalid value for ${field}`,
        allowedValues,
      });
    }
    next();
  };
};
