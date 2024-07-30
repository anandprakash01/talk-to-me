import React, {useContext, useState} from "react";

import {UserContext} from "../context/UserContext";
import {Form} from "react-router-dom";
import axios from "axios";
import Contact from "./Contact";
import Avatar from "./Avatar";
import Popup from "./Popup";

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
    <div className="fixed bg-black w-full h-screen z-40 bg-opacity-65 flex items-center justify-center transition-all duration-300">
      <div className="absolute w-96 bg-bg_primary_lite rounded-lg z-50">
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
        <h1 className="text-center mx-auto p-2 text-lg font-bold text-emerald-200">
          Create Group Chat
        </h1>
        <div className="mt-5 mb-5 mx-auto w-full text-white text-center">
          <form className="flex flex-col mx-2 gap-1">
            <input
              onChange={e => {
                setGroupChatName(e.target.value);
              }}
              value={groupChatName}
              placeholder="Group Name"
              className="border text-black w-full"
            />
            <input
              onChange={e => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              value={search}
              placeholder="Add Users eg: Anand, Raj"
              className="border text-black w-full"
            />
          </form>

          {/* ============selected Users========= */}
          <div className="flex gap-1 p-1 flex-wrap">
            {selectedUsers.map(u => (
              // <Avatar key={u._id} userId={u._id} username={u.name} />
              <div key={u._id} className="border rounded-md px-1 flex items-center gap-1">
                <p className="text-sm">{u.name}</p>
                <span
                  onClick={() => {
                    setSelectedUsers(selectedUsers.filter(sel => sel._id !== u._id));
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
              </div>
            ))}
          </div>

          {/* =================searched User=========== */}

          <div className="max-h-56 overflow-y-scroll overflow-x-hidden message-scrollbar">
            {/* {searchResult.map(p => (
                <Contact
                  key={p._id}
                  online={false}
                  userId={p._id}
                  username={p.name}
                  email={p.email}
                  onClick={() => {
                    // accessChat(p._id);
                    // onClick();
                  }}
                  selected={false}
                />
              ))} */}

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
          <button onClick={handleSubmit} className="border text-md mt-2">
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;
