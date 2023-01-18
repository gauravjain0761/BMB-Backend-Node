const sharp = require("sharp");
const { Imageupload, removeImage } = require("../helpers/imageUpload");

//=========== Upload Image ==================
exports.UploadFile = async (req, res) => {
  console.log("imageUpload api called", req.params);
  const file = req.file;
  const type = req.params.type;
  console.log("type", type);
  if (!file) {
    return res.status(406).send({
      message: "Please select an image",
      code: 406,
    });
  }
  if (file.size > 20000) {
    let extNames = file.originalname.split(/\.(?=[^\.]+$)/);
    if (["jpg", "jpeg", "png", "svg", "pdf"].includes(extNames[1].toLowerCase())) {
      var fileName = `${extNames[0]}_${Date.now().toString()}`;
      switch (type.toUpperCase()) {
        case "CATEGORY":
        case "PRODUCT":
          await sharp(file.buffer)
            .resize(300, 300)
            .toBuffer()
            .then((data) => {
              file["buffer"] = data;
              file["fileName"] = fileName;
              file["type"] = type;
            });
          break;
        case "PROFILE":
          await sharp(file.buffer)
            .resize(250, 250)
            .toBuffer()
            .then((data) => {
              file["buffer"] = data;
              file["fileName"] = fileName;
              file["type"] = type;
            });
          break;
        case "STORE":
          await sharp(file.buffer)
            .resize(300, 300)
            .toBuffer()
            .then((data) => {
              file["buffer"] = data;
              file["fileName"] = fileName;
              file["type"] = type;
            });
          break;
        case "CERTIFICATE":
          // await sharp(file.buffer)
          //   .resize(446, 446)
          //   .toBuffer()
          //   .then((data) => {
          // file["buffer"] = data;
          // });
          file["fileName"] = fileName;
          file["type"] = type;
          break;
        default:
          break;
      }
      if (file["type"]) {
        await Imageupload(file, res);
      }
    } else
      return res.status(400).send({
        message: "File format is not supported",
        code: 400,
      });
  } else {
    return res.status(406).send({
      message: "File size is too short",
      code: 406,
    });
  }
};

//=============== Remove Image ===================
exports.removeFile = async (req, res) => {
  console.log("removeImage api called");
  await removeImage(req.body, res);
};
