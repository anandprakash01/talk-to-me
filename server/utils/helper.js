// Global error handler
const asyncFunction = fn => {
  return (req, res, next) => {
    fn(req, res).catch(err => {
      console.log("ERROR OCCURED", err.message);

      res.status(500).json({
        success: false,
        message: `Something went wrong, Error Occured in Global error Handler, Message: ${err.message}`,
      });

      // next();
    });
  };
};

module.exports = {
  asyncFunction,
};
