const express = require("express");
const app = express();
const path = require("path");

const PORT = process.env.PORT | 2000;

const connectDB = require("./config/db");
connectDB();

//template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//routes
app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.listen(PORT, () => {
  console.log(`server running at port : ${PORT}`);
});
