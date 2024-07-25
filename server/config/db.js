const mongoose = require("mongoose");
const colors = require("colors");

let conn;
const connectDB = async () => {
  conn = await mongoose.connect(process.env.MONGO_URI, {});
};

connectDB()
  .then(() => {
    console.log(`MongoDB Connected: ${conn.connection.host}`.blue.bold);
  })
  .catch(err => {
    console.log("Error while connecting mongoDB".red.bold, err);
  });

module.exports = connectDB;
