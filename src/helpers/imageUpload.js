const AWS = require("aws-sdk");
const { errorResponse, successResponse } = require("../helpers/response");

let s3bucket = new AWS.S3({
  endpoint: process.env.END_POINT,
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
});

exports.Imageupload = async (files, res) => {
  var ResponseData = [];
  for (let file of files) {
  s3bucket.createBucket(function () {
    var params = {
      Bucket: `bmb.${file.type}`,
      Key: file.fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: `${file.mimetype}`,
    };
    
    s3bucket.upload(params, async function (err, data) {
      if (err) {
        errorResponse(500, "somthing went wrong", res)
      } else {
        ResponseData.push(data);
        if (ResponseData.length === files.length) {
          console.log('ResponseData', ResponseData);
          return successResponse(200, "Image uploaded successfully.",ResponseData, res);
        }
      }
    });
  }); 
  }
};

exports.removeImage = async (path, res) => {
  let key = path.url.split("/");
  var params = {
    Bucket: `${key[3]}`,
    Key: `${key[4]}`,
  };
  console.log('params',params);
  s3bucket.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else return successResponse(200,"Image removed successfully.",data, res);
  });
};

exports.existedImageremove = async ( path)=>{
  let key = path.split("/");
  var params = {
    Bucket: `${key[3]}`,
    Key: `${key[4]}`,
  };
  s3bucket.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log('image remove successfully');
  });
}