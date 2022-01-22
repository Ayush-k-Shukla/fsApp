const router = require("express").Router();
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.render("download", {
        error: "something went wrong(not in db)",
      });
    }

    return res.render("download", {
      uuid: file.uuid,
      filename: file.filename,
      filesize: file.size,
      download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
    });
  } catch (e) {
    return res.render("download", { error: "something went wrong(...)" });
  }
});

module.exports = router;
