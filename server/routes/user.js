const express = require("express");
const router = new express.Router();

const userController = require("../controllers/user.js");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.get("/profile", userController.profileUser);
router.get("/people", userController.peopleUser);

module.exports = router;
