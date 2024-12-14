const Messages = require("../models/message");
const Users = require("../models/user");
const Chats = require("../models/chat");

const jwt = require("jsonwebtoken");

const {asyncFunction} = require("../utils/helper");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const sendMessages = asyncFunction(async (req, res) => {
  const {content, chatId} = req.body;
  if (!content || !chatId) {
    console.log("Invalid data");
    return res.status(400).json({
      success: false,
      message: "Invalid data",
    });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Messages.create(newMessage);
    message = await message.populate("sender", "name profilePicture");
    message = await message.populate("chat");
    message = await Users.populate(message, {
      path: "chat.users",
      select: "name email profilePicture",
    });

    await Chats.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.status(200).json(message);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
});

const getMessages = asyncFunction(async (req, res) => {
  // const {userId} = req.params;
  // const token = req.cookies?.token;

  // this has been handled in authMiddleware
  // if (!token) {
  //   return res.status(401).json({
  //     success: false,
  //     message: "Token not found, Token Required!",
  //   });
  // }

  // const decodedToken = jwt.verify(token, jwtSecretKey, {}, async (err, decodedToken) => {
  //   if (err) {
  //     // throw new Error(`Token verification failed : ", ${err}`);

  //     return res.status(401).json({error: "Token verification failed"});
  //   }
  //   // console.log(decodedToken);
  //   // res.json(decodedToken);

  //   const ourUserId = decodedToken.userId;

  //   const messages = await Messages.find({
  //     sender: {$in: [ourUserId, userId]},
  //     recipient: {$in: [ourUserId, userId]},
  //   }).sort({createdAt: 1});

  //   res.json(messages);
  // });

  const {chatId} = req.params;
  // console.log(chatId);
  try {
    const messages = await Messages.find({
      chat: chatId,
    })
      .populate("sender", "name email profilePicture")
      .populate("chat");
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
});

module.exports = {
  getMessages,
  sendMessages,
};
