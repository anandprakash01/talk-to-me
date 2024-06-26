const Messages = require("../models/message");
const jwt = require("jsonwebtoken");

const {asyncFunction} = require("../utils/helper");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const getMessages = asyncFunction(async (req, res) => {
  const {userId} = req.params;
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found, Token Required!",
    });
  }

  const decodedToken = jwt.verify(token, jwtSecretKey, {}, async (err, decodedToken) => {
    if (err) {
      // throw new Error(`Token verification failed : ", ${err}`);

      return res.status(401).json({error: "Token verification failed"});
    }
    // console.log(decodedToken);
    // res.json(decodedToken);

    const ourUserId = decodedToken.userId;

    const messages = await Messages.find({
      sender: {$in: [ourUserId, userId]},
      recipient: {$in: [ourUserId, userId]},
    }).sort({createdAt: 1});

    res.json(messages);
  });

  // here this decoded token is undefined
  // console.log(decodedToken.userId);
});

module.exports = {
  getMessages,
};
