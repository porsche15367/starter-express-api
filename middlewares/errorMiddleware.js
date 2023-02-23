const ApiError = require("../utils/apiErrors");

// const handleJwtInvalidSignature = () =>
//   new ApiError("Invalid Token, please login again...", 401);
// const handleJwtExpired = () =>
//   new ApiError("Expired Token, please login again...", 401);

const globalError = (err, req, res, next) => {
  err.statsCode = err.statsCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    // if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForDev(err, res);
  } else {
    // if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    // if (err.name === "TokenExpiredError") err = handleJwtExpired();

    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  return res.status(500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  return res.status(500).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globalError;
