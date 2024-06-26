const errorHandler = (req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Something went wrong, Last Middleware",
  });
};

module.exports = errorHandler;
