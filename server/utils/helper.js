// Global error handler
const asyncFunction = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      console.log("Error Occurred in Global error Handler, Message:", err.message);

      return res.status(500).json({
        success: false,
        message: "Something went wrong, Please try again",
      });

      // next();
    });
  };
};

module.exports = {
  asyncFunction,
};
