const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // if status code is 200, set to 500
  // res.status(statusCode);

  res.status(500).json({
    success: false,
    message: "Something went wrong, Last Middleware: " + err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {notFound, errorHandler};
