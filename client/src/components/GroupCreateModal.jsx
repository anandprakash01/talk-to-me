import React, {useContext, useState} from "react";

import {UserContext} from "../context/UserContext";
import {Form} from "react-router-dom";
import axios from "axios";
import Contact from "./Contact";
import Avatar from "./Avatar";
import Popup from "./Popup";
import CloseIcon from "../assets/icons/CloseIcon";
import avatarUser from "../assets/icons/avatarUser.svg";

const GroupCreateModal = ({onClick, title, text}) => {
  const {user, chats, setChats} = useContext(UserContext);

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Barer ${user.token}`,
        },
      };
      const {data} = await axios.post(
        `/api/v1/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map(u => u._id)),
        },
        config
      );
      // console.log(data);
      setChats([data, ...chats]);
      onClick();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = async inputTxt => {
    if (!inputTxt) {
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
      const response = await axios.get(`/api/v1/user/search?search=${inputTxt}`, config);
      // console.log(response.data);

      setSearchResult(response.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300">
      <div className="absolute bg-bg_primary_lite rounded-lg z-50 xs:w-60 sm:w-72 md:w-96 lg:w-120">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700"
          >
            <CloseIcon />
          </div>
        </div>
        <h1 className="text-center mx-auto p-2 text-emerald-200 xs:text-base md:text-lg font-semibold">
          Create Group Chat
        </h1>
        <div className="my-5 w-full text-white text-center">
          <form className="flex flex-col mx-2 gap-1">
            <input
              onChange={e => {
                setGroupChatName(e.target.value);
              }}
              value={groupChatName}
              placeholder="Group Name"
              className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
            />
            <input
              onChange={e => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              value={search}
              placeholder="Add Users eg: Anand, Raj"
              className="text-black xs:text-sm md:text-base xs:h-7 md:h-9 w-full rounded-lg p-2 bg-bg_input border outline-none focus-within:border-yellow-500"
            />
          </form>

          {/* ====================selected Users */}
          <div className="flex gap-1 mx-1 p-1 flex-wrap">
            {selectedUsers.map(u => (
              // <Avatar key={u._id} userId={u._id} username={u.name} />
              <div
                key={u._id}
                className="xs:rounded-sm md:rounded-md px-1 flex items-center gap-1 bg-bg_primary_dark"
              >
                <p className="xs:text-xs md:text-sm">{u.name}</p>
                <span
                  onClick={() => {
                    setSelectedUsers(selectedUsers.filter(sel => sel._id !== u._id));
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
              </div>
            ))}
          </div>

          {/* =================searched User=========== */}

          <div className="max-h-28 overflow-y-scroll overflow-x-hidden message-scrollbar">
            {searchResult?.map(u => {
              if (selectedUsers.find(sel => sel._id === u._id)) {
                return;
              }
              return (
                <div
                  onClick={() => {
                    setSelectedUsers([...selectedUsers, u]);
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
          <button
            onClick={handleSubmit}
            className="xs:text-sm md:text-base mt-2 px-2 py-1 rounded-md bg-green-500 hover:bg-green-600"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;
