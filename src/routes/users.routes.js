const router = require("express").Router();
const doctorsController = require("../controller/doctors.controller");
const announcementController = require("../controller/announcements.controller");
const eventsController = require("../controller/events.controller");
const sponsorsController = require("../controller/sponsers.controller");
const registrationController = require("../controller/registration.controller");
const {verifyEmail,verifyPhone, verifyDocAccount} = require("../middleware/validation");
const  UploadFileController = require("../controller/uploadImage.controller");
const dashboardController = require("../controller/dashboard.controller");
const galleryController = require("../controller/gallery.controller");
const quizController = require("../controller/quiz.controller");
const uploadMiddleware = require("../middleware/upload");
const { verifyWebToken } = require("../helpers/jwt");
const bulletinController = require("../controller/bulletin.controller");


//============================= Docotor Account ==========================//
router.post("/doctor/signup",verifyEmail, verifyPhone, verifyDocAccount, doctorsController.register);
router.post("/doctor/login",doctorsController.doctorlogin);
router.post("/doctor/importdoctors",doctorsController.importexcel);
router.put("/doctor/update",verifyWebToken, doctorsController.updatedoctor);
router.get("/doctor/getall",verifyWebToken, ((req, res, next)=>{req.type = "USER"; next()}),doctorsController.getAllDoctors);
router.get("/doctor/getdoctor/:id",verifyWebToken, doctorsController.getDoctorById);
router.post("/doctor/postUpload",verifyWebToken, doctorsController.postUpload);
router.get("/doctor/getdoctorsposts",verifyWebToken, doctorsController.getdoctorsPosts);
router.post("/doctor/send_otp",  doctorsController.send_otp)
router.post("/doctor/forget_password",doctorsController.forget_password)
router.post("/doctor/verify_otp", doctorsController.verify_otp)
router.post("/doctor/reset_password", doctorsController.reset_password);
router.post("/device_token", verifyWebToken, doctorsController.device_token);
router.post("/doctor/member_ship/:id", registrationController.membership)
router.get("/doctor/get",verifyWebToken,doctorsController.getAllDoctorsDetails);
router.post("/doctor/check_first_time_login", doctorsController.check_first_time_login);


router.get("/dashboard/", dashboardController.getDashboardData)
//============================= Announcement ==========================//
router.get("/announcement/getall",((req, res, next)=> {req.type = "USER"; next()}),announcementController.getAllAnnouncements );

//============================= Events ==========================//
router.get("/events/getall",((req, res, next)=> {req.type = "USER"; next()}),verifyWebToken, eventsController.getEvents);
router.get("/events/:id",verifyWebToken, eventsController.getEventById);

//============================= Sponsors ==========================//
router.get("/sponsor/getall",((req, res, next)=> {req.type = "USER"; next()}), sponsorsController.getSponsers);

//============================= Registration ==========================//
router.post("/eventregister",verifyWebToken,registrationController.createRegistration);
// router.get("/events/:id",verifyWebToken, eventsController.getEventById);

//=========================== Image Upload ====================
router.post("/imageUpload/:type",uploadMiddleware.array("file"),UploadFileController.UploadFile);
router.delete("/removefile", UploadFileController.removeFile);

//=========================== Payments ====================
router.post("/make_payment", verifyWebToken, registrationController.makePayment);
router.post("/verify_payment", registrationController.verifyPayment);

//=========================== Galllery ====================
router.get("/gallery/getall", galleryController.getAllGallery);

//============================= Quiz ==========================//
router.get("/quiz/get", verifyWebToken, quizController.getQuiz);

//============================= Bulletin ==========================//
router.get("/bulletin/getall", bulletinController.getAllBulletinByGroupDate);


module.exports = router;
