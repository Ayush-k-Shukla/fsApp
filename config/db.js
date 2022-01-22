require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  //Data base connection
  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });
  const connection = mongoose.connection;
  mongoose.connection
    .once("open", () => {
      console.log("db connected.");
    })
    .on("error", (err) => {
      console.error("Error : " + err);
    });
}

module.exports = connectDB;
