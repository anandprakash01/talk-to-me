import React, {useContext, useRef, useState} from "react";
import ReactDOM from "react-dom";
import closeIcon from "../assets/icons/close.svg";
import CloseIcon from "../assets/icons/CloseIcon";
import Avatar from "./Avatar";
import avatarUser from "../assets/icons/avatarUser.svg";
import loadingIcon from "../assets/icons/loading.svg";
import {Form} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../context/UserContext";
import LoadingPage from "./LoadingPage";

const GroupUpdateModal = ({onClick}) => {
  const {user, selectedChat, setSelectedChat, fetchAgain, setFetchAgain} =
    useContext(UserContext);
  const [groupChatName, setGroupChatName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [inputErrorMsg, setInputErrorMsg] = useState("");
  const [searchErrorMsg, setSearchErrorMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [searchResult, setSearchResult] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimeout = useRef(null);
  const abortControllerRef = useRef(null);

  const handleRemoveUser = async userToRemove => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      // console.log("only admin can remove");
      setErrorMsg("Only admin can remove member from group!");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const config = {
        Authorization: `Bearer ${user.token}`,
      };
      const {data} = await axios.put(
        "/api/v1/chat/remove-group",
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setErrorMsg(
        error.response.data.message || "Couldn't remove user, Please try again!"
      );
    }
  };

  const handleAddUser = async userToAdd => {
    if (selectedChat.users.find(u => u._id === userToAdd._id)) {
      // console.log("User Already in the group");
      return;
    }

    if (selectedChat.groupAdmin._id !== userToAdd._id) {
      // console.log("Only admin can add someone");
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const {data} = await axios.put(
        "/api/v1/chat/add-group",
        {chatId: selectedChat._id, userId: userToAdd._id},
        config
      );
      setFetchAgain(!fetchAgain);
      setSelectedChat(data);
      setIsLoading(false);
    } catch (err) {
      // console.log(err);
      setErrorMsg(err.response.data.message || "Couldn't add user, Please try again!");
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const {data} = await axios.put(
        "/api/v1/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setIsLoading(false);
      setGroupChatName("");
      setSearchText("");
    } catch (err) {
      console.log(err);
      setErrorMsg(err.response.data.message || "Couldn't change name, Please try again!");
      setIsLoading(false);
    }
  };

  const handleSearch = async searchText => {
    setIsSearchLoading(true);
    setInputErrorMsg("");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (!searchText) {
      // setInputErrorMsg("Please write to search");
      setSearchResult([]);
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const config = {
        Headers: {
          Authorization: `Bearer ${user}`,
        },
        signal: controller.signal,
      };
      const response = await axios.get(
        `/api/v1/user/search?search=${searchText}`,
        config
      );

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
        setSearchErrorMsg(
          err.response.data.message || "Something went wrong, Please try again!"
        );
      }
      setIsSearchLoading(false);
      setSearchResult([]);
    }
  };

  const debouncedSearch = searchText => {
    setIsSearchLoading(true);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(searchText);
      setSearchErrorMsg("");
    }, 300);
  };

  return ReactDOM.createPortal(
    <>
      <div
        onClick={() => {}}
        className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300"
      >
        <div className="absolute bg-bg_primary_lite rounded-lg z-50 xs:w-60 sm:w-72 md:w-96 lg:w-120">
          {/* ---------Loading Page for all changes--------- */}
          {isLoading && (
            <div className="z-50 absolute top-0 left-0 right-0 bottom-0 bg-black opacity-30 select-none rounded-lg flex items-center justify-center">
              <img src={loadingIcon} alt="" className="w-12" />
            </div>
          )}

          <div className="relative">
            <div
              onClick={onClick}
              className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-800 transition-all duration-300"
            >
              {/* <img src={closeIcon} className="h-5" /> */}
              <CloseIcon />
            </div>
          </div>
          <div className="mx-auto my-5 w-full">
            <div className="xs:text-base md:text-lg font-semibold text-center text-emerald-200">
              {selectedChat.chatName}
            </div>
            <div className="h-20 w-20 mx-auto my-1">
              {/* <Avatar
            size="20"
            username={selectedChat.chatName}
            userId={selectedChat._id}
          /> */}
              <img src={avatarUser} alt="" className="xs:w-20 md:w-40 mx-auto" />
            </div>
            {/* ==========Group members========== */}
            <div className="flex gap-1 mx-2 my-2 flex-wrap">
              {selectedChat.users.map(u => (
                <div
                  key={u._id}
                  className="xs:rounded-sm md:rounded-md px-1 flex items-center gap-1 bg-bg_primary_dark"
                >
                  <p className="text-white xs:text-xs md:text-sm">
                    {user._id === u._id ? (
                      <span className="font-medium"> You </span>
                    ) : (
                      u.name
                    )}
                    {selectedChat?.groupAdmin._id === u._id && (
                      <span className="font-medium"> (Admin) </span>
                    )}
                  </p>
                  {user._id === u._id ? (
                    <span></span>
                  ) : (
                    <span
                      onClick={() => {
                        handleRemoveUser(u);
                      }}
                      className="bg-[#EC7FA9] text-white rounded-sm cursor-pointer hover:bg-[#BE5985] transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.7"
                        stroke="currentColor"
                        className="xs:size-3 md:size-4 lg:size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Form>
              <div className="flex gap-2 flex-col mx-2 my-3">
                <input
                  value={groupChatName}
                  onChange={e => {
                    setErrorMsg("");
                    setGroupChatName(e.target.value);
                  }}
                  placeholder="Rename Group"
                  className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
                />
                <input
                  value={searchText}
                  onChange={e => {
                    setErrorMsg("");
                    setSearchText(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  placeholder="Add more users to group"
                  className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
                />
                {(searchErrorMsg || inputErrorMsg) && (
                  <div className="text-sm text-red-500 font-thin text-left -mt-1 flex gap-1 items-center bg-red-200 bg-opacity-50 px-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="h-4 w-4 text-red-500"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.682-1.36 3.447 0l6.428 11.428c.746 1.328-.213 2.973-1.724 2.973H3.553c-1.511 0-2.47-1.645-1.724-2.973L8.257 3.1zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {inputErrorMsg || searchErrorMsg} !
                  </div>
                )}
              </div>
            </Form>

            {/* -----Error Message for update and remove--------- */}
            {errorMsg && (
              <div className="font-semibold text-base text-center text-red-500 my-2 mx-2 flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="h-4 w-4 text-red-500"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.682-1.36 3.447 0l6.428 11.428c.746 1.328-.213 2.973-1.724 2.973H3.553c-1.511 0-2.47-1.645-1.724-2.973L8.257 3.1zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMsg || "Something went wrong, Please try again!"}
              </div>
            )}
            <div className="flex gap-3 justify-end items-center text-white mx-2 my-2">
              <button
                onClick={handleRename}
                className="xs:text-sm md:text-base mt-2 px-2 py-1 rounded-md bg-green-500 hover:bg-green-600 transition-all duration-300"
              >
                Update
              </button>
              <button
                onClick={() => {
                  handleRemoveUser(user);
                }}
                className="xs:text-sm md:text-base mt-2 px-2 py-1 rounded-md bg-red-500 hover:bg-red-700 transition-all duration-300"
              >
                Leave Group
              </button>
            </div>

            {/* =================Searched User======= */}
            {isSearchLoading ? (
              <img src={loadingIcon} alt="" className="my-3 w-8 mx-auto" />
            ) : (
              <div className="max-h-28 overflow-y-scroll overflow-x-hidden message-scrollbar">
                {searchResult?.map(u => {
                  if (selectedChat.users.find(sel => sel._id === u._id)) {
                    return;
                  }
                  return (
                    <div
                      onClick={() => {
                        handleAddUser(u);
                      }}
                      key={u._id}
                      className="border-gray-700 flex items-center gap-2 cursor-pointer hover:bg-bg_primary_dark border-b  transition-all duration-300"
                    >
                      <div className="flex gap-2 xs:py-1 md:py-2 xs:pl-3 md:pl-5 items-center capitalize">
                        {/* <Avatar online={false} username={u.name} userId={u._id} /> */}
                        <img src={avatarUser} alt="" className="xs:w-8 md:w-10" />
                        <div className="flex flex-col items-start">
                          <span className="text-white xs:text-sm md:text-base">
                            {u.name}
                          </span>
                          {u.email && (
                            <div className="flex items-center gap-1">
                              <div className="xs:text-[0.7rem] text-xs font-bold text-gray-800">
                                Email:
                              </div>
                              <div className="text-xs text-gray-800 lowercase">
                                {u.email}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {searchText && !isSearchLoading && searchResult.length === 0 && (
              <div className="text-base text-white font-semibold text-center mx-1 my-4">
                No Users Found !
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default GroupUpdateModal;
