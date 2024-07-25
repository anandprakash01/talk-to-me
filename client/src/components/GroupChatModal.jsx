import React, {useContext, useState} from "react";

import {UserContext} from "../context/UserContext";
import {Form} from "react-router-dom";

const GroupChatModal = ({onClick, title, text}) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const {user, chats, setChats} = useContext(UserContext);

  const handleSearch = () => {};

  return (
    <div className="fixed bg-black w-full h-screen z-40 bg-opacity-65 flex items-center justify-center transition-all duration-300">
      <div className="absolute w-96 bg-[#135D66] rounded-lg z-50">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-center mx-auto w-2/3 p-2 text-lg font-bold text-emerald-200">
          Create Group Chat
        </h1>
        <div className="mt-5 mb-10 mx-auto w-3/4 text-white text-center">
          <form>
            <input
              onChange={e => {
                setGroupChatName(e.target.value);
              }}
              value={groupChatName}
              placeholder="Group Name"
              className="border text-black"
            />
            <input
              onChange={e => {
                handleSearch(e.target.value);
              }}
              placeholder="Add Users eg: Anand, Raj"
              className="border text-black"
            />
          </form>
          <div>Render searched user</div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
