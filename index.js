const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const dbConnection = require("./config/database");
dotenv.config({ path: "config.env" });

const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const tweetRoute = require("./routes/tweetRoute");

const ApiError = require("./utils/apiErrors");
const globalError = require("./middlewares/errorMiddleware");
//DB Connection
dbConnection();

const app = express();
app.use("/", express.static(path.join(__dirname, "/public")));
app.use(cors());
app.options("*", cors());

app.use(compression());

//middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node: ${process.env.NODE_ENV}`);
}

//routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/myTweets", tweetRoute);

app.all("*", require("./routes/root"));

//global error handling middleware within express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

//handle rejections outside of express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err} | ${err.message}`);
  server.close(() => {
    console.log(`shutting down....`);
    process.exit(1);
  });
});
