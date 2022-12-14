const router = require("express").Router();
const doctorsController = require("../controller/doctors.controller");
const {verifyEmail, verifyDocAccount} = require("../middleware/validation");
const { verifyWebToken } = require("../helpers/jwt");

//============================= Docotor Account ==========================//
router.post("/doctor/register",verifyEmail, verifyDocAccount, doctorsController.register);
router.post("/doctor/login",doctorsController.doctorlogin);
router.post("/doctor/importdoctors",doctorsController.importexcel);
router.put("/doctor/update/:id",doctorsController.updatedoctor);
router.get("/doctor/getall",verifyWebToken, doctorsController.getAllDoctors);
router.get("/doctor/getdoctor/:id",verifyWebToken, doctorsController.getDoctorById);

//============================= ==========================//

module.exports = router;
