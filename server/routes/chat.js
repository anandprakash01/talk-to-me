const express = require("express");

const router = new express.Router();

const chatController = require("../controllers/chat.js");

router.post("/", chatController.accessChats);
router.get("/", chatController.fetchChats);
router.post("/group", chatController.createGroupChat);
router.put("/rename", chatController.renameGroup);
router.put("/add-group", chatController.addToGroup);
router.put("/remove-group", chatController.removeFromGroup);

module.exports = router;
