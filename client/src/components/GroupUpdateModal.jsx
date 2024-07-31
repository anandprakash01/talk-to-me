import React, {useContext, useState} from "react";
import ReactDOM from "react-dom";
import closeIcon from "../assets/icons/close.svg";
import CloseIcon from "../assets/icons/CloseIcon";
import Avatar from "./Avatar";
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
  const [selectedUsers, setSelectedUsers] = useState([]);

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
      console.log("Only admin can add someone");
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
      className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 w-full h-screen z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300"
    >
      <div className="absolute w-96 bg-bg_primary_lite rounded-lg z-50">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700"
          >
            {/* <img src={closeIcon} className="h-5" /> */}
            <CloseIcon />
          </div>
        </div>
        <div className="mx-auto mt-2 mb-5 w-[90%]">
          <div className="text-lg font-bold text-center text-emerald-200">
            {selectedChat.chatName}
          </div>
          <div className="h-20 w-20 mx-auto my-3">
            <Avatar
              size="20"
              username={selectedChat.chatName}
              userId={selectedChat._id}
            />
          </div>
          {/* ==========Group members========== */}
          <div className="flex gap-1 p-1 flex-wrap">
            {selectedChat.users.map(u => (
              <div
                key={u._id}
                className="border rounded-md px-1 flex items-center justify-center gap-1"
              >
                <p className="text-sm">
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
                    className="bg-red-600 text-white rounded-sm cursor-pointer hover:bg-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-3.5"
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
            <div className="flex gap-1">
              <input
                value={groupChatName}
                onChange={e => {
                  setGroupChatName(e.target.value);
                }}
                placeholder="Rename Group"
                className="w-full p-1 rounded-md bg-bg_input border outline-none focus-within:border-yellow-500"
              />
              <button onClick={handleRename} className="border rounded-md px-1">
                Rename
              </button>
            </div>
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Add Users to Group"
              className="w-full p-1 my-1 rounded-md bg-bg_input border outline-none focus-within:border-yellow-500"
            />
          </Form>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                handleRemoveUser(user);
              }}
              className="bg-red-600 text-white rounded-sm px-2 cursor-pointer hover:bg-red-700"
            >
              Leave Group
            </button>
          </div>
          <div className="max-h-44 overflow-y-scroll overflow-x-hidden message-scrollbar">
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
                  className="transition-all duration-300 hover:bg-[#232D3F] border-b border-gray-800 flex items-center gap-2 cursor-pointer "
                >
                  {/* {selected && (
                    <div className="w-1 bg-[#E19898] h-12 rounded-r-md absolute"></div>
                  )} */}

                  <div className="flex gap-2 py-2 pl-5 items-center capitalize">
                    <Avatar online={false} username={u.name} userId={u._id} />
                    <div className="flex flex-col">
                      <span className="text-white">{u.name}</span>
                      {u.email && (
                        <div>
                          <span className="text-xs font-bold text-gray-800">Email: </span>
                          <span className="text-xs text-gray-800">{u.email}</span>
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
