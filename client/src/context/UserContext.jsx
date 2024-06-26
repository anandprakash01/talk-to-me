import axios from "axios";
import React, {createContext, useEffect, useState} from "react";

export const UserContext = createContext({});

export const UserContextProvider = ({children}) => {
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    axios
      .get("/api/v1/user/profile") // we need to authenticate cookie data in the backend
      .then(response => {
        // console.log(response);
        setId(response.data.userId);
        setUsername(response.data.username);
      })
      .catch(err => {
        console.log("error message:", err);
      });
  }, []);

  return (
    <UserContext.Provider value={{username, setUsername, id, setId}}>
      {children}
    </UserContext.Provider>
  );
};
