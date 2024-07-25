import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router";

import {UserContext} from "../context/UserContext";
import Chat from "./Chat";
import Logo from "../components/Logo";
import Popup from "../components/Popup";

import show from "../assets/icons/show.svg";
import hide from "../assets/icons/hide.svg";
import loadingIcon from "../assets/loading.svg";

const Register = () => {
  const navigate = useNavigate();

  const {
    userName,
    setUserName,
    _id,
    setId,
    userEmail,
    setUserEmail,
    UserProfilePicture,
    setUserProfilePicture,
  } = useContext(UserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [nameErr, setNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmPasswordErr, setConfirmPasswordErr] = useState("");

  const [firebaseErr, setFirebaseErr] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState({
    title: "",
    text: "",
  });

  //Email Validation
  const emailValidation = email => {
    // validation for should include @,dot, and length min 4
    return String(email)
      .toLowerCase()
      .match(/^[a-zA-Z0-9._-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  };

  const handleProfilePic = e => {
    // console.log(e.target.files);
    const pic = e.target.files[0];
    setIsLoading(true);
    if (!pic) {
      setPopupMsg({
        title: "Error",
        text: "Please select a profile picture",
      });
      setProfilePicture(""); //to remove the old uploads
      setPopup(true);
      setIsLoading(false);
      return;
    }

    if (pic.type === "image/jpeg" || "image/png") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "talk-to-me");
      data.append("cloud_name", "anandprakash");

      // axios not working(cors error)
      // axios
      //   .post("https://api.cloudinary.com/v1_1/anandprakash/image/upload", data)
      //   .then(res => {
      //     console.log(res);
      //     setProfilePic(res.data.url.toString());
      //     setIsLoading(false);
      //   });

      fetch("https://api.cloudinary.com/v1_1/anandprakash/image/upload", {
        method: "post",
        body: data,
      })
        .then(res => res.json())
        .then(data => {
          // console.log(data);
          setProfilePicture(data.url.toString());
          setIsLoading(false);
        })
        .catch(err => {
          console.log(err);
          setIsLoading(false);
        });

      // const reader = new FileReader();
      // //file will load as base64
      // reader.readAsDataURL(e.target.files[0]);
      // reader.onload = () => {
      //   setProfilePic({
      //     fileData: reader.result,
      //     fileName: e.target.files[0].name,
      //   });
      // };
    } else {
      setPopupMsg({
        title: "Error",
        text: "Please select an image!",
      });
      setPopup(true);
      setIsLoading(false);
    }
  };

  const handleRegistration = async e => {
    e.preventDefault();
    setIsLoading(true);

    if (!name) {
      setNameErr("! Enter your Name");
    }
    if (!email) {
      setEmailErr("! Enter your email");
      // setFirebaseErr("");
    }
    //  else {
    //   if (!emailValidation(email)) {
    //     setEmailErr("! Enter a valid email");
    //   }
    // }
    if (!password) {
      setPasswordErr("! Enter your Password");
    } else {
      if (password.length < 6) {
        setPasswordErr("! Minimum 6 character required");
      }
    }
    if (!confirmPassword) {
      setConfirmPasswordErr("! Enter confirm Password");
    } else {
      if (password !== confirmPassword) {
        setConfirmPasswordErr("! Password must be same");
      } else {
        setConfirmPasswordErr("");
      }
    }

    if (
      nameErr ||
      emailErr ||
      passwordErr ||
      password.length < 6 ||
      confirmPassword != password
    ) {
      setIsLoading(false);
      setPopup(true);
      popupMsg.text = "Please fill all the required fields";
      popupMsg.title = "Error";
      // console.log("hey");
      return;
    }

    try {
      // const config = {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // };

      const response = await axios.post("/api/v1/user/register", {
        name,
        email,
        password,
        profilePicture,
      });
      // console.log(response);
      // console.log(response.headers.Authorization);//received in network tab headers but can not access it

      const {data} = response;
      // setUserName(data.name);
      // setUserEmail(data.email);
      // setId(data._id);
      // setUserProfilePicture(data.profilePicture);

      // setting up info in local storage
      localStorage.setItem("userInfo", JSON.stringify(data));

      setPopup(true);
      popupMsg.text = "Successfully created User, redirecting you to chat page";
      popupMsg.title = "User created";
      setTimeout(() => {
        setPopup(false);
        navigate("/chat");
      }, 3000);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setPopup(true);
      popupMsg.text = error.response.data.message;
      popupMsg.title = "Error";
      setTimeout(() => {
        setPopup(false);
      }, 4000);
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = e => {
    // e.preventDefault();
    // setLoading(true);
    // signInWithPopup(auth, provider)
    //   .then(result => {
    //     console.log(result);
    //     const user = result.user;
    //     dispatch(
    //       setUserInfo({
    //         id: user.uid,
    //         userName: user.displayName,
    //         email: user.email,
    //         photoURL: user.photoURL,
    //       })
    //     );
    //     setLoading(false);
    //     setSuccessMsg(
    //       "Logged in Successfully! Welcome you back. Redirecting you to Home page..."
    //     );
    //     setTimeout(() => {
    //       navigate("/");
    //     }, 3000);
    //   })
    //   .catch(error => {
    //     setLoading(false);
    //     console.log("ERROR: ", error);
    //   });
  };

  // useEffect(() => {
  // console.log(id, loggedInUser);
  // if (id && loggedInUser) {
  //   navigate("/chat");
  // }
  // }, [id]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#003C43] relative">
      {popup && (
        <Popup
          onClick={() => {
            setPopup(!popup);
          }}
          text={popupMsg.text}
          title={popupMsg.title}
        />
      )}
      <div className="bg-[#135D66] p-3 rounded-lg flex flex-col gap-3 absolute top-10">
        <Logo />
        <div className="flex justify-evenly items-center my-4 text-white gap-1">
          <Link
            to="/login"
            className="cursor-pointer py-1 rounded-2xl text-center w-1/2 hover:bg-blue-600 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="cursor-pointer bg-blue-500  py-1 px-4 rounded-2xl text-center w-1/2 hover:bg-blue-600 transition-all duration-300"
          >
            Register
          </Link>
        </div>

        <form className="w-96 mx-auto" onSubmit={handleRegistration}>
          <div className="mb-3">
            <div className="flex items-center">
              <label htmlFor="name" className="text-white w-2/5">
                Name<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setNameErr("");
                }}
                placeholder="Name"
                className="block h-10 w-3/5 rounded-lg pl-3 bg-[#E3FEF7] border outline-none focus-within:border-yellow-500"
              />
            </div>
            {nameErr && (
              <p
                className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 justify-end
              "
              >
                {nameErr}
              </p>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-center">
              <label htmlFor="email" className="text-white w-2/5">
                Email Address<span className="text-red-500"> *</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setEmailErr("");
                }}
                placeholder="Email Address"
                className="block h-10 w-3/5 rounded-lg p-3 bg-[#E3FEF7] border outline-none focus-within:border-yellow-500"
              />
            </div>

            {emailErr && (
              <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 justify-end">
                {emailErr}
              </p>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-center">
              <label htmlFor="password" className="text-white w-2/5">
                Password<span className="text-red-500"> *</span>
              </label>
              <div className="w-3/5 relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordErr("");
                  }}
                  placeholder="Password"
                  className="block h-10 w-full rounded-lg p-3 bg-[#E3FEF7] border outline-none focus-within:border-yellow-500"
                />
                <div
                  onClick={() => {
                    setShowPass(!showPass);
                  }}
                  className="absolute top-1.5 right-3 cursor-pointer select-none"
                >
                  <img src={showPass ? show : hide} className="w-6" />
                </div>
              </div>
            </div>

            {passwordErr && (
              <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 justify-end">
                {passwordErr}
              </p>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-center">
              <label htmlFor="confirmPassword" className="text-white w-2/5">
                Confirm Password<span className="text-red-500"> *</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="text"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordErr("");
                }}
                placeholder="Confirm Password"
                className="block h-10 w-3/5 rounded-lg p-3 bg-[#E3FEF7] border outline-none focus-within:border-yellow-500"
              />
            </div>
            {confirmPasswordErr && (
              <p className="text-red-500 text-xs font-semibold tracking-wide flex items-center gap-1 justify-end">
                {confirmPasswordErr}
              </p>
            )}
          </div>

          <div className="mb-5">
            <div className="flex items-center">
              <label htmlFor="profile-pic" className="text-white w-2/5">
                Upload Picture
              </label>
              <input
                id="profile-pic"
                name="Profile Picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePic}
                placeholder=""
                className="block h-10 w-3/5 rounded-lg border text-white input-file"
              />
            </div>
          </div>

          <button
            className="bg-blue-500 text-white block h-9 w-full rounded-lg hover:bg-blue-600 transition-all duration-300 "
            disabled={isLoading ? true : false}
          >
            {isLoading ? <img src={loadingIcon} className="w-8 mx-auto" /> : "Register"}
          </button>
        </form>
        <button className="bg-blue-500 text-white block h-9 w-full rounded-lg mb-3 hover:bg-blue-600 transition-all duration-300">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
