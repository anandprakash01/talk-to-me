import axios from "axios";
import React, {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export const UserContext = createContext({});

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState({});
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(); //object
  const [fetchAgain, setFetchAgain] = useState(false);
  const [notification, setNotification] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/v1/user/get-profile") // we need to authenticate cookie data in the backend
      .then(response => {
        // console.log(response);
        setUser(response.data);
        setLoading(false);
        // setUserName(response.data.name);
        // setId(response.data._id);
        // setUserEmail(response.data.email);
        // setUserProfilePicture(response.data.profilePicture);
      })
      .catch(err => {
        console.log("can not get User details, error message:", err);
        setLoading(false);
      });
  }, []);

  // if (loading) return <div>Loading...</div>;
  // Display loading state while fetching data

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchAgain,
        setFetchAgain,
        notification,
        setNotification,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
