const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");
const sendMail = require("../services/emailServices");
const emailTemplate = require("../services/emailTemplate");

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
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
});

router.post("/send", async (req, res) => {
  //validate request
  console.log(req.body);
  const { uuid, emailTo, emailFrom } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All Fields Required." });
  }

  //get data from db

  const file = await File.findOne({ uuid: uuid });
  // if (file.sender) {
  //   return res.status(422).send({ error: "email already sent." });
  // }

  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  //send email
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "FileSharingApp",
    text: `${emailFrom} has sent you a file`,
    html: emailTemplate({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 Hours",
    }),
  });

  return res.send({ success: true });
});

module.exports = router;
