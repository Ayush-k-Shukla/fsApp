const File = require("./models/file");
const fs = require("fs");
const connectDB = require("./config/db");

connectDB();

async function fetchData() {
  //fetch all files and delete after 24 hours
  const previousDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const files = await File.find({ createdAt: { $lt: previousDate } });
  if (files.length) {
    for (const file of files) {
      try {
        //from upload fold
        fs.unlinkSync(file.path);
        //from db
        await file.remove();
        console.log(`removed ${file.filename}`);
      } catch (err) {
        console.log(`While deleting file get error: ${err}`);
      }
    }
    console.log("Job done !");
  }
}

fetchData().then(() => {
  process.exit();
});
