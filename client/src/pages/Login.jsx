import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {useNavigate} from "react-router";

import {UserContext} from "../context/UserContext";

import Logo from "../components/Logo";
import Popup from "../components/Popup";
import LoadingPage from "../components/LoadingPage";
import show from "../assets/icons/show.svg";
import hide from "../assets/icons/hide.svg";
import loadingIcon from "../assets/loading.svg";

import {auth, provider} from "../firebase";
import {signInWithPopup} from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const {user, setUser, isLoadingUserInfo} = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false); // show loading inside button
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState({
    title: "",
    text: "",
  });

  useEffect(() => {
    if (user.name) {
      navigate("/chat");
    }
  });

  const handleLogin = async e => {
    e.preventDefault();
    setIsFullLoading(true);
    if (!email) {
      setEmailErr("! Enter your email");
      // setFirebaseErr("");
    }
    if (!password) {
      setPasswordErr("! Enter your Password");
    }
    if (!email || !password) {
      setIsFullLoading(false);
      return;
    }

    try {
      // const config = {// for sending token in headers
      //   headers: {
      //     "Content-Type": "application/json",
      //      Authorization: `Bearer TOKEN_HERE`,
      //   },
      // };
      const response = await axios.post(
        "/api/v1/user/login",
        {email, password},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer MY_TOKEN",
          },
        }
      );
      setUser(response.data);
      // setUserName(data.name);
      // setUserEmail(data.email);
      // setId(data._id);
      // setUserProfilePicture(data.profilePicture);

      // setting up info in local storage
      // localStorage.setItem("userInfo", JSON.stringify(data));
      setIsFullLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: "Successfully Logged in, redirecting you to chat page",
        title: "Logged in",
      });
      setTimeout(() => {
        setIsPopup(false);
        navigate("/chat");
      }, 3000);
    } catch (error) {
      console.log("error in login:=> ", error);
      setIsFullLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: error.response?.data.message || "Something went wrong, Please try again!",
        title: "Error",
      });
      setTimeout(() => {
        setIsPopup(false);
      }, 4000);
    }
  };

  const handleLoginGuest = async e => {
    e.preventDefault();
    setIsFullLoading(true);
    try {
      const response = await axios.post("/api/v1/user/login-guest", {
        email: "guestuser.talktome@gmail.com",
      });
      setUser(response.data);
      // localStorage.setItem("userInfo", JSON.stringify(data));
      setIsFullLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: "Successfully Logged in, redirecting you to chat page",
        title: "Logged in",
      });
      setTimeout(() => {
        setIsPopup(false);
        navigate("/chat");
      }, 3000);
    } catch (error) {
      console.log("error in login guest:=> ", error);
      setIsFullLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: error.response?.data.message || "Something went wrong, Please try again!",
        title: "Error",
      });
      setTimeout(() => {
        setIsPopup(false);
      }, 4000);
    }
  };

  const handleLoginWithGoogle = async e => {
    e.preventDefault();
    setIsFullLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      // console.log("accessToken : ", result.user.accessToken);
      const accessToken = result.user.accessToken;
      const response = await axios.post("/api/v1/user/login-google", {accessToken});
      // console.log(response);
      setUser(response.data);
      // localStorage.setItem("userInfo", JSON.stringify(data));

      // dispatch(
      //   setUserInfo({
      //     id: user.uid,
      //     userName: user.displayName,
      //     email: user.email,
      //     photoURL: user.photoURL,
      //   })
      // );
      setIsFullLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: "Successfully Logged in, redirecting you to chat page",
        title: "Logged in",
      });
      setTimeout(() => {
        setIsPopup(false);
        navigate("/chat");
      }, 3000);
    } catch (error) {
      console.log("error in Google login:=> ", error);
      setIsPopup(true);
      setIsFullLoading(false);
      setPopupMsg({
        text: error.response?.data.message || "Something went wrong, Please try again!",
        title: "Error",
      });
      setTimeout(() => {
        setIsPopup(false);
      }, 4000);
    }
  };

  if (isLoadingUserInfo) {
    return <LoadingPage width={12} />;
  }
  return (
    <div className="h-screen flex justify-center items-center bg-bg_primary_dark">
      {isFullLoading && <LoadingPage width={12} />}
      {isPopup && (
        <Popup
          onClick={() => {
            setIsPopup(!isPopup);
          }}
          text={popupMsg.text}
          title={popupMsg.title}
        />
      )}
      <div className="bg-bg_primary_lite p-3 rounded-lg flex flex-col gap-3 xs:scale-75 md:scale-100">
        {/* =======Logo */}
        <div className="text-logo_color bg-primary_color font-bold flex gap-1 justify-center items-center h-10">
          <Logo />
          <div className="select-none text-nowrap text-xl">Talk To Me</div>
        </div>
        {/* =======Logo End */}

        <div className="flex justify-evenly items-center my-4 text-white gap-1">
          <Link
            to="/login"
            className="cursor-pointer bg-blue-500 py-1 rounded-2xl text-center w-1/2 hover:bg-blue-600 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="cursor-pointer py-1 px-4 rounded-2xl text-center w-1/2 hover:bg-blue-600 transition-all duration-300"
          >
            Register
          </Link>
        </div>

        <form className="w-96 mx-auto" onSubmit={handleLogin}>
          <div className="mb-3">
            <div className="flex items-center">
              <label htmlFor="email" className="text-white w-2/5">
                Email Address <span className="text-red-500"> *</span>
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
                className="block h-10 w-3/5 rounded-lg p-3 bg-bg_input border outline-none focus-within:border-yellow-500"
              />
            </div>
            {emailErr && (
              <p className="text-red-500 text-xs font-semibold tracking-wide flex gap-1 items-center justify-end">
                {emailErr}
              </p>
            )}
          </div>

          <div className="mb-5">
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
                  className="block h-10 w-full rounded-lg p-3 bg-bg_input border outline-none focus-within:border-yellow-500"
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
              <p className="text-red-600 text-xs font-semibold tracking-wide flex gap-1 items-center justify-end">
                {passwordErr}
              </p>
            )}
          </div>

          <button
            className="bg-blue-500 text-white block h-9 w-full rounded-lg hover:bg-blue-600 transition-all duration-300"
            disabled={isBtnLoading ? true : false}
          >
            {isBtnLoading ? <img src={loadingIcon} className="w-8 mx-auto" /> : "Login"}
          </button>
        </form>
        <button
          onClick={handleLoginWithGoogle}
          className="bg-blue-500 text-white block h-9 w-full rounded-lg hover:bg-blue-600 transition-all duration-300"
        >
          Login with Google
        </button>
        <button
          onClick={handleLoginGuest}
          className="bg-red-500 text-white block h-9 w-full rounded-lg hover:bg-red-600 transition-all duration-300"
        >
          Login as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
