const router = require("express").Router();
const adminController = require("../controller/admin.controller");
const doctorsController = require("../controller/doctors.controller");
const eventsController = require("../controller/events.controller");
const sponsorsController = require("../controller/sponsers.controller");
const announcementsController = require("../controller/announcements.controller");
const pushnotifyController = require("../controller/pushNotify.controller");
const registrationController = require("../controller/registration.controller");
const certificateController = require("../controller/certificate.controller");
const { verifyadmin } = require("../middleware/validation");
const { verifyWebToken } = require("../helpers/jwt");

//============================= Admin Account ==========================//
router.post("/admin/create_admin", adminController.createAdmin);
router.post("/admin/login", adminController.adminlogin);

//============================= Doctor Account ==========================//
router.get("/admin/getdoctors", verifyWebToken, doctorsController.getAllDoctors);
router.put("/admin/approvedoctor",verifyWebToken, doctorsController.approvedoctor);
router.get("/admin/getdoctor/:id",verifyWebToken, doctorsController.getDoctorById);

//============================= Events ==========================//
router.post("/admin/events/add",verifyWebToken, eventsController.addEvent);
router.get("/admin/events/getall", verifyWebToken, eventsController.getEvents);
router.get("/admin/events/:id", verifyWebToken, eventsController.getEventById); 
router.put("/admin/updateevent/:id", verifyWebToken, eventsController.updateEvent);
router.delete("/admin/remove_event/:id", verifyWebToken, eventsController.removeEvent);

//============================= Sponsers ==========================//
router.post("/admin/sponser/add",verifyWebToken,sponsorsController.createSponser);
router.get("/admin/sponser/getall", verifyWebToken, sponsorsController.getSponsers);
router.get("/admin/sponser/:id", verifyWebToken, sponsorsController.getSposerById); 
router.put("/admin/updatesponser/:id", verifyWebToken,sponsorsController.updateSponser);
router.delete("/admin/remove_sponser/:id", verifyWebToken, sponsorsController.removeSponser);

//============================= Announcement ==========================//
router.post("/admin/announcement/add",verifyWebToken, announcementsController.createannouncement);
router.get("/admin/announcement/getall",verifyWebToken, announcementsController.getAllAnnouncements);
router.get("/admin/announcementgetById/:id",verifyWebToken, announcementsController.getAnnouncementById);
router.put("/admin/announcement/update/:id",verifyWebToken,announcementsController.updateAnnouncement);
router.delete("/admin/remove_announcement/:id", verifyWebToken, announcementsController.removeAnnouncement);

//============================= Push Notification ==========================//
router.post("/admin/pushnotify/add",verifyWebToken, pushnotifyController.createNotification);

//============================= Certificate ==========================//
router.post("/admin/certificate/add",verifyWebToken, certificateController.addCertificate);
router.get("/admin/certificate/getall",verifyWebToken, certificateController.getall);
router.put("/admin/certificate/:id",verifyWebToken, certificateController.editCertificate);
router.delete("/admin/certificate/:id",verifyWebToken, certificateController.removecertificate);

//============================= Registration ==========================//
router.get("/admin/registration/getall",verifyWebToken, registrationController.getAllRegistrations);
router.get("/admin/getregistrationbyid/:id",verifyWebToken, registrationController.getById)


module.exports = router;

