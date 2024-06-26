const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Users = require("../models/user.js");

const {asyncFunction} = require("../utils/helper.js");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const registerUser = asyncFunction(async (req, res) => {
  //   throw new Error("help me");

  const {username, password} = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  //   const newUser = new User({username, password});
  //   await newUser.save();
  const user = await Users.create({
    username: username,
    password: hashedPassword,
  });
  // console.log(user);

  const tokenPayload = {
    username: user.username,
    userId: user._id,
  };

  // jwt.sign(tokenPayload, jwtSecretKey, {}, (err, token) => {
  //   if (err) throw err;
  //   res
  //     .cookie("token", token)
  //     .status(201)
  //     .json({success: "true", message: "user created successfully"});
  // });

  const token = jwt.sign(tokenPayload, jwtSecretKey);

  // send JWT in the headers.Authorization not in cookie, this is valunrable
  res.cookie("token", token, {sameSite: "none", secure: true}).status(201).json({
    success: "true",
    userId: user._id,
    username: user.username,
  });

  //   res.status(200).json({success: true});
});

const loginUser = asyncFunction(async (req, res) => {
  const {username, password} = req.body;

  const foundUser = await Users.findOne({username});

  if (foundUser) {
    const isPassword = bcrypt.compareSync(password, foundUser.password);
    if (isPassword) {
      const tokenPayload = {
        username: foundUser.username,
        userId: foundUser._id,
      };
      const token = jwt.sign(tokenPayload, jwtSecretKey);

      // const token = jwt.sign({ userId }, 'your_secret_key', { expiresIn: '1h' });

      // res.setHeader('Authorization', `Bearer ${token}`);
      // res.json({ message: 'Login successful' });

      res.cookie("token", token, {sameSite: "none", secure: true}).status(200).json({
        success: true,
        userId: foundUser._id,
        username: foundUser.username,
      });
    }
  }

  // res.json({success: true});
});

const logoutUser = asyncFunction(async (req, res) => {
  res.cookie("token", "", {sameSite: "none", secure: true}).status(200).json({
    success: true,
  });
});

const profileUser = asyncFunction(async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, jwtSecretKey, {}, (err, userData) => {
      if (err) {
        throw err;
      }
      // console.log(userData);
      const {userId, username} = userData;

      res.json(userData);
    });
  } else {
    res.status(401).json({
      success: false,
      message: "No token",
    });
  }
});

const peopleUser = asyncFunction(async (req, res) => {
  const users = await Users.find({}, {_id: 1, username: 1});
  res.json(users);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
  peopleUser,
};
