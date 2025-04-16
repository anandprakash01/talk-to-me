import axios from "axios";
import React, {createContext, useEffect, useState} from "react";

export const UserContext = createContext({});

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState({});
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(); //object
  const [fetchAgain, setFetchAgain] = useState(false);
  const [notification, setNotification] = useState([]); //store notifications

  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  useEffect(() => {
    //  axios
    //   .get("/api/v1/user/get-profile") // we need to authenticate cookie data in the backend
    //   .then(response => {
    //     // console.log(response);
    //     setUser(response.data);
    //     setLoadingUserInfo(false);
    //     // setUserName(response.data.name);
    //     // setId(response.data._id);
    //     // setUserEmail(response.data.email);
    //     // setUserProfilePicture(response.data.profilePicture);
    //   })
    //   .catch(err => {
    //     console.log("can not get User details, error message:", err);
    //     setLoadingUserInfo(false);
    //   });

    const getProfile = async () => {
      setIsLoadingUserInfo(true);
      try {
        const response = await axios.get("/api/v1/user/get-profile");
        setUser(response.data);
        setIsLoadingUserInfo(false);
      } catch (error) {
        console.log("can not get User details, error message:", error);
        // alert("Failed to fetch user profile. Please try again later.");
        setIsLoadingUserInfo(false);
      }
    };
    getProfile();

    // Get all cookies in a single string
    // HttpOnly Cookies Cannot be accessed via JavaScript.
    // const cookies = document.cookie;
    // // Split cookies into an array
    // const cookieArray = cookies.split("; ");

    // // Find a specific cookie
    // const getCookie = name => {
    //   const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    //   return match ? match[2] : null;
    // };

    // const token = getCookie("token");
    // console.log("Token:", token);
    // Set a cookie
    // document.cookie = "token=yourTokenValue; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
    // Remove a cookie
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

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
        isLoadingUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
