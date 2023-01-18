const router = require("express").Router();
const doctorsController = require("../controller/doctors.controller");
const announcementController = require("../controller/announcements.controller");
const eventsController = require("../controller/events.controller");
const registrationController = require("../controller/registration.controller");
const {verifyEmail,verifyPhone, verifyDocAccount} = require("../middleware/validation");
const  UploadFileController = require("../controller/uploadImage.controller");
const uploadMiddleware = require("../middleware/upload");
const { verifyWebToken } = require("../helpers/jwt");

//============================= Docotor Account ==========================//
router.post("/doctor/register",verifyEmail, verifyPhone, verifyDocAccount, doctorsController.register);
router.post("/doctor/login",doctorsController.doctorlogin);
router.post("/doctor/importdoctors",doctorsController.importexcel);
router.put("/doctor/update",verifyWebToken, doctorsController.updatedoctor);
router.get("/doctor/getall",verifyWebToken, doctorsController.getAllDoctors);
router.get("/doctor/getdoctor/:id",verifyWebToken, doctorsController.getDoctorById);

//============================= Announcement ==========================//
router.get("/announcement/getall",announcementController.getAllAnnouncements );

//============================= Events ==========================//
router.get("/events/getall",verifyWebToken, eventsController.getEvents);
router.get("/events/:id",verifyWebToken, eventsController.getEventById);

//============================= Registration ==========================//
router.post("/eventregister",verifyWebToken,registrationController.createRegistration);
// router.get("/events/:id",verifyWebToken, eventsController.getEventById);

//=========================== Image Upload ====================
router.post(
    "/imageUpload/:type",
    uploadMiddleware.single("file"),
    UploadFileController.UploadFile
  );
  
  router.delete("/removefile", UploadFileController.removeFile);

module.exports = router;
