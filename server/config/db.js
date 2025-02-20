const mongoose = require("mongoose");
const colors = require("colors");

// let conn;
// const connectDB = async () => {
//   conn = await mongoose.connect(process.env.MONGO_URI, {});
// };

// connectDB()
//   .then(() => {
//     console.log(`MongoDB Connected: ${conn.connection.host}`.blue.bold);
//   })
//   .catch(err => {
//     console.log("Error while connecting mongoDB".red.bold, err);
//   });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`.blue.bold);
  } catch (err) {
    console.error("Error while connecting to MongoDB".red.bold, err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
