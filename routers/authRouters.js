const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {identifier} = require("../middlewares/identification");


router.post("/signup",authController.signup);
router.post("/signin",authController.signin);
router.post("/signout",identifier,authController.signout);
router.post("/changePassword",identifier,authController.changePassword);


router.patch("/sendVerificationCode",identifier,authController.sendVerificationCode);
router.patch("/verifyVerificationCode",identifier,authController.verifyVerificationCode);
router.patch("/sendforgotPasswordCode",identifier,authController.sendForgotPasswordCode);
router.patch("/verifyForgotPasswordCode",identifier,authController.verifyForgotPasswordCode);

module.exports = router;
