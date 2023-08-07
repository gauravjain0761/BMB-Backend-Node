const multer = require("multer");

const uploadMiddleware = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = uploadMiddleware;
