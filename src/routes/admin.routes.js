const router = require("express").Router();
const adminController = require("../controller/admin.controller");
const doctorsController = require("../controller/doctors.controller");
const eventsController = require("../controller/events.controller");
const sponsorsController = require("../controller/sponsers.controller");
const announcementsController = require("../controller/announcements.controller");
const pushnotifyController = require("../controller/pushNotify.controller");
const registrationController = require("../controller/registration.controller");
const certificateController = require("../controller/certificate.controller");
const quizController = require("../controller/quiz.controller");
const galleryController = require("../controller/gallery.controller");
const bulletinController = require("../controller/bulletin.controller");
const { verifyadmin } = require("../middleware/validation");
const { verifyWebToken } = require("../helpers/jwt");

//============================= Admin Account ==========================//
router.post("/admin/create_admin", adminController.createAdmin);
router.post("/admin/login", adminController.adminlogin);

//============================= Doctor Account ==========================//
router.get("/admin/getdoctors",verifyWebToken, doctorsController.getAllDoctors);
router.put("/admin/approvedoctor", verifyWebToken, doctorsController.approvedoctor);
// doctor account creation
router.post("/admin/doctor/create", verifyWebToken, doctorsController.createDoctorAccount);
router.get("/admin/getdoctor/:id", verifyWebToken, doctorsController.getDoctorById);
router.delete("/admin/remove_doctor/:id", verifyWebToken, doctorsController.removedocotraccount);

//============================= Events ==========================//
router.post("/admin/events/add", verifyWebToken, eventsController.addEvent);
router.get("/admin/events/getall", verifyWebToken, eventsController.getEvents);
router.get("/admin/events/:id", verifyWebToken, eventsController.getEventById);
router.put("/admin/updateevent/:id", verifyWebToken, eventsController.updateEvent);
router.delete("/admin/remove_event/:id", verifyWebToken, eventsController.removeEvent);

//============================= Sponsers ==========================//
router.post("/admin/sponser/add", verifyWebToken, sponsorsController.createSponser);
router.get("/admin/sponser/getall", verifyWebToken, sponsorsController.getSponsers);
router.get("/admin/sponser/:id", verifyWebToken, sponsorsController.getSposerById);
router.put("/admin/updatesponser/:id", verifyWebToken, sponsorsController.updateSponser);
router.delete("/admin/remove_sponser/:id", verifyWebToken, sponsorsController.removeSponser);

//============================= Announcement ==========================//
router.post("/admin/announcement/add", verifyWebToken, announcementsController.createannouncement);
router.get("/admin/announcement/getall", verifyWebToken, announcementsController.getAllAnnouncements);
router.get("/admin/announcementgetById/:id", verifyWebToken, announcementsController.getAnnouncementById);
router.put("/admin/announcement/update/:id", verifyWebToken, announcementsController.updateAnnouncement);
router.delete("/admin/remove_announcement/:id", verifyWebToken, announcementsController.removeAnnouncement);

//============================= Push Notification ==========================//
router.post("/admin/pushnotify/add", verifyWebToken, pushnotifyController.createNotification);
router.get("/admin/pushnotify/getall", verifyWebToken, pushnotifyController.getAll);

//============================= Certificate ==========================//
router.post("/admin/certificate/add", verifyWebToken, certificateController.addCertificate);
router.get("/admin/certificate/getall", verifyWebToken, certificateController.getall);
router.put("/admin/certificate/:id", verifyWebToken, certificateController.editCertificate);
router.delete("/admin/certificate/:id", verifyWebToken, certificateController.removecertificate);
router.get("/admin/certificategetById/:id", certificateController.getCertificateById);
router.delete("/admin/remove_certificate_file/:id", verifyWebToken, certificateController.removecartificatefile)


//============================= Event Registration ==========================//
router.get("/admin/registration/getall", verifyWebToken, registrationController.getAllRegistrations);
router.get("/admin/getregistrationbyid/:id", verifyWebToken, registrationController.getById)

//============================= Quiz ==========================//
router.post("/admin/quiz/add", verifyWebToken, quizController.createQuiz);

//============================= Gallery ==========================//
router.post("/admin/gallery/add", verifyWebToken, galleryController.createGallery);
router.get("/admin/gallery/getall", galleryController.getAllGallery);
router.get("/admin/gallery/:id", galleryController.getGallerybyId);
router.delete("/admin/remove_gallery/:id",verifyWebToken, galleryController.removeGallery);
router.put("/admin/gallery_update/:id", verifyWebToken,galleryController.updateGallery)
router.delete("/admin/remove_gallery_file/:id", verifyWebToken, galleryController.removeGalleryFile)

// ============================= Bulletin ==========================//
router.post("/admin/bulletin/add", verifyWebToken, bulletinController.addBulletin);
router.get("/admin/bulletin/getall", verifyWebToken, bulletinController.getAllBulletin);
router.get("/admin/bulletin/:id", verifyWebToken, bulletinController.getBulletinById);
router.put("/admin/bulletin_update/:id", verifyWebToken, bulletinController.updateBulletin);
router.delete("/admin/remove_bulletin/:id", verifyWebToken, bulletinController.deleteBulletin);



module.exports = router;

