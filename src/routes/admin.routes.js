const router = require("express").Router();
const adminController = require("../controller/admin.controller");
const doctorsController = require("../controller/doctors.controller");
const eventsController = require("../controller/events.controller");
const sponsorsController = require("../controller/sponsers.controller");
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
router.get("/admin/events/getAll", verifyWebToken, eventsController.getEvents);
router.get("/admin/events/:id", verifyWebToken, eventsController.getEventById); 
router.put("/admin/updateevent/:id", verifyWebToken, eventsController.updateEvent);
router.delete("/admin/remove_event/:id", verifyWebToken, eventsController.removeEvent);

//============================= Sponsers ==========================//
router.post("/admin/sponser/add",verifyWebToken,sponsorsController.createSponser);
router.get("/admin/sponser/getAll", verifyWebToken, sponsorsController.getSposers);
router.get("/admin/sponser/:id", verifyWebToken, sponsorsController.getSposerById); 
router.put("/admin/updatesponser/:id", verifyWebToken,sponsorsController.updateSponser);
router.delete("/admin/remove_sponser/:id", verifyWebToken, sponsorsController.removeSponser);

module.exports = router;

