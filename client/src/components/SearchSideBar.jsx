import React, {useContext, useEffect, useState} from "react";
import ReactDOM from "react-dom";

import Contact from "./Contact";
import axios from "axios";
import {UserContext} from "../context/UserContext";

const SearchSideBar = ({onClick}) => {
  const [left, setLeft] = useState("-left-1/3");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [errorMsg, setErrorMsg] = useState(false);

  const {user, selectedChat, setSelectedChat, chats, setChats} = useContext(UserContext);

  const handleSearch = async search => {
    if (!search) {
      setErrorMsg("Please write to search");
      setSearchResult([]);
      return;
    }
    setErrorMsg("");

    try {
      const config = {
        Headers: {
          Authorization: `Bearer ${user}`,
        },
      };
      const response = await axios.get(`/api/v1/user/search?search=${search}`, config);
      console.log(response.data);

      setSearchResult(response.data.users);
    } catch (err) {
      console.log(err);
      // show no users or please try again message in UI..... (pending)
    }
  };

  const accessChat = async userId => {
    try {
      const config = {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${user}`,
        },
      };
      const response = await axios.post("/api/v1/chat/", {userId}, config);
      // console.log(response);
      if (!chats.find(c => c._id === response.data._id)) {
        setChats([response.data, ...chats]);
      }
      setSelectedChat(response.data);
    } catch (err) {
      console.log("ERROR OCCURRED : ", err);
    }
  };

  useEffect(() => {
    setLeft("left-0");
  });
  return ReactDOM.createPortal(
    // <div className="fixed h-screen w-full top-0 left-0 bottom-0 right-0">
    <div
      className={`fixed bg-white h-screen w-1/3 top-0 rounded-r-md overflow-hidden transition-all duration-300 ${left}`}
    >
      {/* <div className="relative"> */}
      <div
        onClick={() => {
          onClick();
          setLeft("-left-60");
        }}
        className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>
      {/* </div> */}
      <h1 className="mt-5 py-4 text-center font-medium text-lg">
        Search user to message
      </h1>
      <div className="flex gap-2 items-center">
        <input
          onChange={e => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          value={search}
          placeholder="Search"
          className="mx-5 w-full border h-9 bg-bg_input p-3 rounded-md outline-none focus-within:border-yellow-500"
        />
      </div>
      {errorMsg && <div className="text-sm mx-3 text-red-500">{errorMsg}!</div>}

      <div className="mt-5 bg-bg_primary_lite">
        {searchResult &&
          searchResult.map(user => (
            <Contact
              key={user._id}
              online={false}
              userId={user._id}
              username={user.name}
              email={user.email}
              onClick={() => {
                accessChat(user._id);
                onClick();
              }}
              selected={false}
            />
          ))}
      </div>

      {/* </div> */}
    </div>,
    document.body
  );
};

export default SearchSideBar;
