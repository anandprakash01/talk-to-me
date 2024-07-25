import axios from "axios";
import React, {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export const UserContext = createContext({});

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState({});
  const [selectedChat, setSelectedChat] = useState({});
  const [chats, setChats] = useState([]);

  useEffect(() => {
    axios
      .get("/api/v1/user/get-profile") // we need to authenticate cookie data in the backend
      .then(response => {
        // console.log(response);
        setUser(response.data);

        // setUserName(response.data.name);
        // setId(response.data._id);
        // setUserEmail(response.data.email);
        // setUserProfilePicture(response.data.profilePicture);
      })
      .catch(err => {
        console.log("can not get User details, error message:", err);
      });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
