const router = require("express").Router();
const adminController = require("../controller/admin/admin.controller");
const {verifydmin} = require("../middleware/validation");
const { verifyWebToken } = require("../helpers/jwt");

router.post("/admin/create_admin", adminController.createAdmin);
router.post("/admin/login",verifydmin, adminController.adminlogin);
// router.post("/doctor/importdoctors",doctorsController.importexcel);
// router.put("/doctor/update/:id",doctorsController.updatedoctor);
// router.get("/doctor/getall",verifyWebToken, doctorsController.getAllDoctors);
// router.get("/doctor/getdoctor/:id",verifyWebToken, doctorsController.getDoctorById);
module.exports = router;
