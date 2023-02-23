const mongoose = require("mongoose");
//connect to mongodb
const dbConnection = () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(process.env.DB_URL).then((result) => {
    console.log(`Database connected: ${result.connection.host}`);
  });
};

module.exports = dbConnection;
