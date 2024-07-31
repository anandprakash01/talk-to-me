const express = require("express");

const router = new express.Router();

const messageController = require("../controllers/message.js");

router.post("/", messageController.sendMessages);
router.get("/:chatId", messageController.getMessages);

module.exports = router;
