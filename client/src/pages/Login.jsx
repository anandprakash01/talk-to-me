import React, {useContext, useEffect, useState} from "react";
import axios from "axios";

import {UserContext} from "../context/UserContext";
import {useNavigate} from "react-router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const {
    username: loggedInUser,
    setUsername: setLoggedInUsername,
    id,
    setId,
  } = useContext(UserContext);

  useEffect(() => {
    if (loggedInUser) {
      navigate("/chat");
      return;
    }
  }, [id]);

  const handleLogin = async e => {
    e.preventDefault();
    const response = await axios.post("/api/v1/user/login", {username, password});

    setLoggedInUsername(username);
    setId(response.data.userId);
    // console.log(response.data.userId);

    // setUsername("");
    // setPassword("");
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-72 mx-auto mb-12" onSubmit={handleLogin}>
        <input
          value={username}
          onChange={e => {
            setUsername(e.target.value);
          }}
          type="text"
          placeholder="Username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
          type="password"
          placeholder="Password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          Login
        </button>
        <div className="text-center mt-2">
          Don't have an account ?
          <a
            href=""
            onClick={e => {
              e.preventDefault();
              navigate("/register");
            }}
            className="text-blue-500 ml-2"
          >
            Register here
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
