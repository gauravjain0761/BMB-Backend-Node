const router = require("express").Router();

const doctorsController = require("../controller/doctors.controller");
const {verifyEmail, verifyDocAccount} = require("../middleware/validation");

router.post("/doctor/register",verifyEmail, verifyDocAccount, doctorsController.register);
router.post("/doctor/login",doctorsController.doctorlogin);
router.post("/doctor/importdoctors",doctorsController.importexcel);
router.put("/doctor/update/:id",doctorsController.updatedoctor);

module.exports = router;
