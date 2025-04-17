import React, {useContext, useEffect, useState, useRef} from "react";
import ReactDOM from "react-dom";

import Contact from "./Contact";
import axios from "axios";
import {UserContext} from "../context/UserContext";
import CloseIcon from "../assets/icons/CloseIcon";
import loadingIcon from "../assets/icons/loading.svg";
import searchUserIcon from "../assets/icons/Search.png";
import Popup from "./Popup";

const SearchSideBar = ({onClick}) => {
  const {user, selectedChat, setSelectedChat, chats, setChats} = useContext(UserContext);

  const [left, setLeft] = useState("-left-1/3");
  const [searchResult, setSearchResult] = useState([]);
  const [searchTxt, setSearchTxt] = useState("");
  const [inputErr, setInputErr] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState({
    title: "",
    text: "",
  });

  // Use useRef to store the timeout ID for debouncing
  const debounceTimeout = useRef(null);
  // Use useRef to store the abort controller
  const abortControllerRef = useRef(null);

  // const [latestSearchTerm, setLatestSearchTerm] = useState("");

  const handleSearch = async searchTxt => {
    if (!searchTxt) {
      setSearchResult([]);
      setIsSearchLoading(false);
      setInputErr("Please enter a value");
      return;
    }

    setInputErr("");
    setIsSearchLoading(true);

    // setLatestSearchTerm(searchTxt);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create a new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const config = {
        Headers: {
          Authorization: `Bearer ${user}`,
        },
        // cancelToken: cancelToken.token, // Attach the cancel token to the request
        signal: controller.signal, //the abort signal to the request
      };
      const response = await axios.get(`/api/v1/user/search?search=${searchTxt}`, config);

      // if (latestSearchTermRef.current === searchTxt) {
      //   setSearchResult(response.data.users);
      // }

      // Only update if this controller hasn't been aborted
      if (!controller.signal.aborted) {
        setSearchResult(response.data.users);
      }
      setIsSearchLoading(false);
    } catch (err) {
      if (err.name === "CanceledError") {
        // console.log("Request canceled due to new input");
      }
      //  else if (axios.isCancel(err)) {
      //   console.log("Request canceled:", err.message);
      // }
      else {
        console.log("ERROR in Search:", err);
        setIsPopup(true);
        setIsSearchLoading(false);
        setPopupMsg({
          text: err.response.data.message || "Something went wrong, Please try again!",
          title: "Oops! Search Issue Detected",
        });
      }
    }
  };

  const debouncedSearch = searchTerm => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout for request delay
    debounceTimeout.current = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
  };

  const accessChat = async userId => {
    setIsSearchLoading(true);
    try {
      const config = {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${user}`,
        },
      };
      const response = await axios.post("/api/v1/chat/", {userId}, config);

      if (!chats.find(c => c._id === response.data._id)) {
        setChats([response.data, ...chats]);
      }
      onClick(); //to close the searchbar
      setSelectedChat(response.data);
      setIsSearchLoading(false);
    } catch (err) {
      console.log("ERROR OCCURRED while getting chats/contacts : ", err);
      setIsSearchLoading(false);
      setIsPopup(true);
      setPopupMsg({
        text: "Something went wrong while loading the contacts, Please reload the page and try again!",
        title: "Error",
      });
    }
  };

  useEffect(() => {
    setLeft("left-0");
    // Cleanup function to clear any pending timeouts and abort any pending requests
    // return () => {
    //   if (debounceTimeout.current) {
    //     clearTimeout(debounceTimeout.current);
    //   }
    //   if (abortControllerRef.current) {
    //     abortControllerRef.current.abort();
    //   }
    // };
  }, []);

  return ReactDOM.createPortal(
    <>
      {isPopup && (
        <Popup
          onClick={() => {
            setIsPopup(!isPopup);
          }}
          text={popupMsg.text}
          title={popupMsg.title}
        />
      )}
      <div
        className={`fixed flex flex-col bg-[#C1D8C3] h-screen w-1/3 top-0 rounded-r-md overflow-hidden transition-all duration-300 ${left}`}
      >
        <div
          onClick={() => {
            onClick();
            setLeft("-left-60");
          }}
          className="absolute bg-[#EC7FA9] text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-[#BE5985] transition-all duration-300"
        >
          <CloseIcon />
        </div>

        <h1 className="xs:mt-8 md:mt-10 text-[#443627] text-center font-medium xs:text-sm md:text-lg">
          Discover Contacts
        </h1>
        <div className="flex flex-col items-end xs:mt-2 md:mt-5 xs:mx-1 md:mx-2">
          <input
            onChange={e => {
              setSearchTxt(e.target.value);
              // handleSearch(e.target.value);
              debouncedSearch(e.target.value);
            }}
            value={searchTxt}
            placeholder="Search"
            className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
          />

          <div className="xs:h-3 md:h-4 xs:text-[0.5rem] md:text-xs text-red-500">
            {inputErr && inputErr + "!"}
          </div>

          <button
            onClick={() => {
              handleSearch(searchTxt);
            }}
            className="flex items-center gap-1 xs:text-xs md:text-sm p-1 md:px-2 rounded-md text-white text-base bg-green-500 hover:bg-green-600 transition-all duration-300"
          >
            <img src={searchUserIcon} className="xs:w-3 md:w-6" />
            Search
          </button>
        </div>

        {isSearchLoading ? (
          <img src={loadingIcon} alt="" className="mt-10 w-8 mx-auto" />
        ) : (
          <div className="flex-grow mt-4 overflow-y-scroll overflow-x-hidden message-scrollbar text-[#443627">
            {!searchTxt && (
              <div className="xs:text-xs sm:text-sm md:text-base mx-2 text-center text-[#443627">
                Start searching for contacts to begin a conversation
              </div>
            )}

            {searchResult.length > 0 ? (
              searchResult &&
              searchResult.map(u => {
                if (
                  chats?.find(c => c.users[0]._id == u._id || c.users[1]._id == u._id)
                ) {
                  return;
                }
                return (
                  <Contact
                    key={u._id}
                    online={false}
                    userId={u._id}
                    username={u.name}
                    email={u.email}
                    onClick={() => {
                      accessChat(u._id);
                    }}
                    selected={false}
                  />
                );
              })
            ) : (
              <div className="xs:text-xs sm:text-sm md:text-base mx-2 text-center text-red-900">
                No match found. Maybe try a different name?
              </div>
            )}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default SearchSideBar;
