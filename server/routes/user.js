const express = require("express");
const router = new express.Router();

const userController = require("../controllers/user.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/login-guest", userController.loginGuestUser);
router.post("/login-google", userController.loginGoogleUser);
router.get("/logout", authMiddleware, userController.logoutUser);
router.get("/get-profile", authMiddleware, userController.profileUser);
router.get("/people", userController.peopleUser);
router.get("/search", authMiddleware, userController.searchUsers);

module.exports = router;
