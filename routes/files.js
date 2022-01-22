const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    //date + random + file extension
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { fileSize: 1000000 * 100 }, //100mb approx
}).single("myfile");

router.post("/", (req, res) => {
  //store file
  upload(req, res, async (err) => {
    //request validation
    if (!req.file) {
      return res.json({ error: "File can not be empty" });
    }
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    //store into database
    const file = new File({
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      uuid: uuid4(),
    });

    const response = await file.save();
    return res.json({
      file: `{process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
});

module.exports = router;
