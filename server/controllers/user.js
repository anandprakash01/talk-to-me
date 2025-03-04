const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const admin = require("../config/firebaseAdmin.js");
const Users = require("../models/user.js");

const {asyncFunction} = require("../utils/helper.js");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

//Register User
const registerUser = asyncFunction(async (req, res) => {
  //   throw new Error("help me");

  const {name, email, password, profilePicture} = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  const alreadyRegistered = await Users.findOne({email});
  if (alreadyRegistered) {
    return res.status(400).json({
      success: false,
      message: "User is already Registered, please login",
    });
  }

  // const salt = bcrypt.genSaltSync(10);
  // const hashedPassword = bcrypt.hashSync(password, salt);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //   const newUser = new User({name, password});
  //   await newUser.save();
  const user = await Users.create({
    name,
    email,
    password: hashedPassword,
    ...(profilePicture ? {profilePicture} : {}),
  });

  const tokenPayload = {
    // expiresIn: "30d",
    // exp: Math.floor(Date.now() / 1000 + 36000),
    email,
    _id: user._id,
  };

  // jwt.sign(tokenPayload, jwtSecretKey, {}, (err, token) => {
  //   if (err) throw err;
  //   res
  //     .cookie("token", token)
  //     .status(201)
  //     .json({success: "true", message: "user created successfully"});
  // });

  const token = jwt.sign(tokenPayload, jwtSecretKey);
  await Users.findByIdAndUpdate(user._id, {token});

  //sending token in cookies
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 day from now
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript access, reducing XSS attack risks.
    secure: true, // Ensures the cookie is sent over HTTPS
    // sameSite: "Strict", // Prevents CSRF attacks
    // sameSite: "Lax", // Allows cookies to be sent in cross-site requests under certain conditions
    sameSite: "None",
    // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day expiration in milliseconds
    expires: expires,
  });

  //sending token in headers
  res.setHeader("Authorization", "Bearer " + token);

  res.status(201).json({
    success: true,
    message: "User registered successfully, please login",
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
  });
});

// Login User
const loginUser = asyncFunction(async (req, res) => {
  const {email, password} = req.body;

  const user = await Users.findOne({email});
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not Registered",
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Incorrect email or password",
    });
  }

  const tokenPayload = {
    // exp: Math.floor(Date.now() / 1000 + 36000),
    expiresIn: "30d",
    email: user.email,
    _id: user._id,
  };
  const token = jwt.sign(tokenPayload, jwtSecretKey);

  // const token = jwt.sign({ userId }, 'your_secret_key', { expiresIn: '1h' });

  // also store token in database for verification purpose
  await Users.findOneAndUpdate({email}, {token});

  //sending token in cookies
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript access, reducing XSS attack risks.
    secure: true, // Ensures the cookie is sent over HTTPS
    // sameSite: "Strict", // Prevents CSRF attacks
    // sameSite: "Lax", // Allows cookies to be sent in cross-site requests under certain conditions
    sameSite: "None",
    // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day expiration in milliseconds
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day from now,
  });

  //sending token in headers
  res.setHeader("Authorization", `Bearer ${token}`);

  res.status(201).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
  });
});

// Login Guest User
const loginGuestUser = asyncFunction(async (req, res) => {
  const {email} = req.body;
  const user = await Users.findOne({email});

  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  //sending token in cookies
  res.cookie("token", user.token, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    expires: expires,
  });

  //sending token in headers
  res.setHeader("Authorization", `Bearer ${user.token}`);

  res.status(201).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
  });
});

// login Google User
const loginGoogleUser = asyncFunction(async (req, res, next) => {
  const accessToken = req.body.accessToken;
  try {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const {name, email, picture} = decodedToken;
    let user = await Users.findOne({email});
    if (!user) {
      user = await Users.create({
        name,
        email,
        profilePicture: picture,
      });
    }
    const tokenPayload = {
      expiresIn: "30d",
      email: user.email,
      _id: user._id,
    };
    const token = jwt.sign(tokenPayload, jwtSecretKey);
    user = await Users.findByIdAndUpdate(user._id, {token});
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.log(err);
    res.status(401).send("Unauthorized, please try again");
  }
});

const logoutUser = asyncFunction(async (req, res) => {
  if (req.user.email != "guestuser.talktome@gmail.com") {
    try {
      const user = await Users.findByIdAndUpdate(req.user._id, {
        token: "",
      });
    } catch (err) {
      console.log("error while logging out");
    }
  }
  res.cookie("token", "", {sameSite: "none", secure: true}).status(200).json({
    success: true,
    message: "Logged out Successfully",
  });
});

// Get Profile of User
const profileUser = asyncFunction(async (req, res) => {
  const user = await Users.findOne({email: req.user.email}).select("-password -token");
  res.status(200).json(user);
});

const peopleUser = asyncFunction(async (req, res) => {
  const users = await Users.find({}, {_id: 1, username: 1});
  res.json(users);
});

const searchUsers = asyncFunction(async (req, res) => {
  // console.log(req);
  const keyword = req.query.search
    ? {
        $or: [
          {name: {$regex: req.query.search, $options: "i"}},
          {email: {$regex: req.query.search, $options: "i"}},
        ],
      }
    : {};
  const users = await Users.find(keyword).find({_id: {$ne: req.user._id}});

  return res.status(200).json({
    success: true,
    users,
  });
});

module.exports = {
  registerUser,
  loginUser,
  loginGuestUser,
  loginGoogleUser,
  logoutUser,
  profileUser,
  peopleUser,
  searchUsers,
};
