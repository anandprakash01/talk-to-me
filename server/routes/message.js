const express = require("express");

const router = new express.Router();

const messageController = require("../controllers/message.js");

router.get("/:userId", messageController.getMessages);

module.exports = router;
