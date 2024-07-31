const jwt = require("jsonwebtoken");

const Messages = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat.js");
const {asyncFunction} = require("../utils/helper");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

// one-on-one
const accessChats = asyncFunction(async (req, res) => {
  // console.log(req.body);
  const {userId} = req.body;
  // const {userId}=req.params;

  if (!userId) {
    console.log("UserId unknown in one-on-on chat");
    res.status(400).json({
      success: false,
      message: "Please try again later",
    });
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      {users: {$elemMatch: {$eq: userId}}},
      //logged in user
      {users: {$elemMatch: {$eq: req.user._id}}},
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email profilePicture",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({_id: createdChat._id}).populate(
        "users",
        "-password"
      );

      res.status(200).json(fullChat);
    } catch (err) {
      console.log("Couldn't create chat", err);
      res.status(400).json({
        success: false,
        message: "Please try again",
      });
    }
  }
});

const fetchChats = asyncFunction(async (req, res) => {
  try {
    let chats = await Chat.find({
      users: {
        $elemMatch: {$eq: req.user._id},
      },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({updatedAt: -1});

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email profilePicture",
    });

    res.status(200).json(chats);
  } catch (err) {
    console.log("error while getting chats", err);
    res.status(400).json({
      success: false,
      message: "Please try again",
    });
  }
});

const createGroupChat = asyncFunction(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(400)
      .json({success: false, message: "Please provide all the fields"});
  }
  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Please select at least 2 People to create group",
    });
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({_id: groupChat._id})
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.json(fullGroupChat);
  } catch (err) {
    console.log("error while creating group chat", err);
    res.status(400).json({
      success: false,
      message: "error while creating group chat, please try again",
    });
  }
});

const renameGroup = asyncFunction(async (req, res) => {
  const {chatId, chatName} = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(chatId, {chatName}, {new: true})
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    console.log("unable to update group name");
    return res.status(404).json({
      message: "Unable to update group name, Please try again",
    });
  }

  res.status(200).json(updatedChat);
});

const addToGroup = asyncFunction(async (req, res) => {
  const {chatId, userId} = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {$push: {users: userId}},
    {new: true}
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    console.log("unable to add User to group");
    return res.status(404).json({
      message: "Unable to add user, Please try again",
    });
  }

  res.status(200).json(added);
});

const removeFromGroup = asyncFunction(async (req, res) => {
  const {chatId, userId} = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {$pull: {users: userId}},
    {new: true}
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    console.log("unable to remove User to group");
    return res.status(404).json({
      message: "Unable to remove user, Please try again",
    });
  }

  res.status(200).json(removed);
});

module.exports = {
  accessChats,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
