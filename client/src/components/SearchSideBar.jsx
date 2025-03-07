import React, {useContext, useEffect, useState} from "react";
import ReactDOM from "react-dom";

import Contact from "./Contact";
import axios from "axios";
import {UserContext} from "../context/UserContext";
import CloseIcon from "../assets/icons/CloseIcon";

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
      className={`fixed bg-[#C1D8C3] h-screen w-1/3 top-0 rounded-r-md overflow-hidden transition-all duration-300 ${left}`}
    >
      {/* <div className="relative"> */}
      <div
        onClick={() => {
          onClick();
          setLeft("-left-60");
        }}
        className="absolute bg-[#EC7FA9] text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-[#BE5985] transition-all duration-300"
      >
        <CloseIcon />
      </div>
      {/* </div> */}
      <h1 className="mt-10 text-[#443627] text-center font-medium xs:text-sm md:text-lg">
        Discover Contacts
      </h1>
      <div className="flex mt-5">
        <input
          onChange={e => {
            setSearch(e.target.value);
            handleSearch(e.target.value);
          }}
          value={search}
          placeholder="Search"
          className="text-black xs:mx-1 md:mx-2 xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
        />
      </div>
      {errorMsg && (
        <div className="xs:text-[0.5rem] md:text-sm mx-3 text-red-500">{errorMsg}!</div>
      )}

      <div className="max-h-[75%] mt-4 overflow-y-scroll overflow-x-hidden message-scrollbar ">
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
    </div>,
    document.body
  );
};

export default SearchSideBar;
