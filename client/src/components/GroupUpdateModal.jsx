import React, {useContext, useState} from "react";
import ReactDOM from "react-dom";
import closeIcon from "../assets/icons/close.svg";
import CloseIcon from "../assets/icons/CloseIcon";
import Avatar from "./Avatar";
import avatarUser from "../assets/icons/avatarUser.svg";
import {Form} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../context/UserContext";

const GroupUpdateModal = ({onClick}) => {
  const {user, selectedChat, setSelectedChat, fetchAgain, setFetchAgain} =
    useContext(UserContext);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const handleRemoveUser = async userToRemove => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      console.log("only admin can remove");
      return;
    }
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleAddUser = async userToAdd => {
    if (selectedChat.users.find(u => u._id === userToAdd._id)) {
      console.log("User Already in the group");
      return;
    }
    if (selectedChat.groupAdmin._id !== userToAdd._id) {
      // console.log("Only admin can add someone");
    }

    try {
      setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    try {
      setRenameLoading(true);
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
      // console.log(data);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (err) {
      console.log(err);
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async inputTxt => {
    if (!inputTxt) {
      // setErrorMsg("Please write to search");
      setSearchResult([]);
      return;
    }
    // setErrorMsg("");

    try {
      const config = {
        Headers: {
          Authorization: `Bearer ${user}`,
        },
      };
      const response = await axios.get(`/api/v1/user/search?search=${inputTxt}`, config);

      setSearchResult(response.data.users);
    } catch (err) {
      console.log(err);
    }
  };
  return ReactDOM.createPortal(
    <div
      onClick={() => {}}
      className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300"
    >
      <div className="absolute bg-bg_primary_lite rounded-lg z-50 xs:w-60 sm:w-72 md:w-96 lg:w-120">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700"
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
                  setGroupChatName(e.target.value);
                }}
                placeholder="Rename Group"
                className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
              />
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Add more users to group"
                className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
              />
            </div>
          </Form>
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
                  {/* {selected && (
                    <div className="w-1 bg-[#E19898] h-12 rounded-r-md absolute"></div>
                  )} */}

                  <div className="flex gap-2 xs:py-1 md:py-2 xs:pl-3 md:pl-5 items-center capitalize">
                    {/* <Avatar online={false} username={u.name} userId={u._id} /> */}
                    <img src={avatarUser} alt="" className="xs:w-8 md:w-10" />
                    <div className="flex flex-col items-start">
                      <span className="text-white xs:text-sm md:text-base">{u.name}</span>
                      {u.email && (
                        <div className="flex items-center gap-1">
                          <div className="xs:text-[0.7rem] text-xs font-bold text-gray-800">
                            Email:
                          </div>
                          <div className="text-xs text-gray-800 lowercase">{u.email}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GroupUpdateModal;
