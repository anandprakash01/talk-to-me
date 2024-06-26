import React, {useContext, useEffect, useState} from "react";
import axios from "axios";

import {UserContext} from "../context/UserContext";
import {useNavigate} from "react-router";
import Chat from "./Chat";

const Register = () => {
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
    // console.log(id, loggedInUser);
    if (id && loggedInUser) {
      navigate("/chat");
    }
  }, [id]);

  const handleRegister = async e => {
    e.preventDefault();
    const response = await axios.post("/api/v1/user/register", {username, password});
    // console.log(response);

    setLoggedInUsername(username);
    setId(response.data.userId);

    // setUsername("");
    // setPassword("");
    navigate("/chat");
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-72 mx-auto mb-12" onSubmit={handleRegister}>
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
          Register
        </button>
        <div className="text-center mt-2">
          Already a member ?{" "}
          <a
            href=""
            onClick={e => {
              e.preventDefault();
              navigate("/login");
            }}
            className="text-blue-500 ml-2"
          >
            Login here
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;
