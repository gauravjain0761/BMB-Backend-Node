const sharp = require("sharp");
const { Imageupload, removeImage } = require("../helpers/imageUpload");
//=========== Upload Image ==================
exports.UploadFile = async (req, res) => {
  const file = req.file;
  const type = req.params.type;
  if (!file) {
    return res.status(406).send({
      message: "Please select an image",
      code: 406,
    });
  }
  console.log("file------>", file);
  // if (file.size > 20000) {
    let extNames = file.originalname.split(/\.(?=[^\.]+$)/);
    if (["jpg", "jpeg", "png", "svg", "pdf", "webp"].includes(extNames[1].toLowerCase())) {
      var fileName = `image_${Date.now().toString()}.${extNames[1]}`;
      switch (type.toUpperCase()) {
        case "ANNOUNCEMENT":
          await sharp(file.buffer)
            .resize(500, 450)
            .toBuffer()
            .then((data) => {
              file["buffer"] = data;
              file["fileName"] = fileName;
              file["type"] = type;
            });
          break;
        case "PROFILE":
          await sharp(file.buffer)
            .resize(350, 350)
            .toBuffer()
            .then((data) => {
              file["buffer"] = data;
              file["fileName"] = fileName;
              file["type"] = type;
            });
          break;
        case "SPONSOR":
        case "EVENT":  
        case "CERTIFICATE":
          await sharp(file.buffer)
            // .resize(446, 446)
            .toBuffer()
            .then((data) => {
          file["buffer"] = data;
          });
          file["fileName"] = fileName;
          file["type"] = type;
          break;
        default:
          break;
      }
      if (file["type"]) {
        console.log('file size', file);
        await Imageupload(file, res);
      }
    } else
      return res.status(400).send({
        message: "File format is not supported",
        code: 400,
      });
  // } else {
  //   return res.status(406).send({
  //     message: "File size is too short",
  //     code: 406,
  //   });
  // }
};

//=============== Remove Image ===================
exports.removeFile = async (req, res) => {
  console.log("removeImage api called");
  await removeImage(req.body, res);
};
