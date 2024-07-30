import React, {useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";

import Logo from "../components/Logo";
import {UserContext} from "../context/UserContext";
import axios from "axios";
import Contact from "../components/Contact";

import "../styles/chat.css";
import Avatar from "../components/Avatar";
import DisplayMessages from "../components/DisplayMessages";

import userIcon from "../assets/icons/userIcon.svg";
import notificationIcon from "../assets/icons/notificationIcon.svg";
import phoneCallIcon from "../assets/icons/phoneCall.svg";
import ProfileDetail from "../components/ProfileDetailModal";
import SearchSideBar from "../components/SearchSideBar";
import GroupCreateModal from "../components/GroupCreateModal";

import {getSender} from "../config/chatLogics";
import GroupUpdateModal from "../components/GroupUpdateModal";

const Chat = () => {
  const {username, setUsername, id, setId} = useContext(UserContext);

  // ----------here
  const {
    user,
    setUser,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    fetchAgain,
    setFetchAgain,
  } = useContext(UserContext);

  const [loggedUser, setLoggedUser] = useState({});
  const [isGroupChatModal, setIsGroupChatModal] = useState(false);

  // ==============

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSearchSidebar, setIsSearchSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSenderProfile, setShowSenderProfile] = useState(false);
  const divUnderMessages = useRef();

  const navigate = useNavigate();

  const fetchChats = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    try {
      const res = await axios.get("/api/v1/chat/", config);
      // console.log(res);
      setChats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setLoggedUser(user);
    fetchChats();
  }, [fetchAgain]);

  // -------------old---------------

  useEffect(() => {
    // if (!id && !username) {
    //   navigate("/login");
    // } else {
    //   connectToWS();
    // }
  }, [id, username]);

  const connectToWS = () => {
    const ws = new WebSocket("http://localhost:5000");
    setWs(ws);

    ws.addEventListener("message", handleMessage);

    ws.addEventListener("close", () => {
      // when server gets disconnected
      setTimeout(() => {
        console.log("Disconnected, Trying to reconnect");
        connectToWS(); //reconnect
      }, 5000);
    });
  };

  //setting the online people
  const showOnlinePeople = peopleArray => {
    // console.log(peopleArray);
    const people = {};

    peopleArray.forEach(({userId, username}) => {
      people[userId] = username;
    });

    setOnlinePeople(people);
  };

  // receive the message
  const handleMessage = e => {
    // console.log(e);
    const messageData = JSON.parse(e.data);
    // console.log(messageData);
    // console.log(selectedUserId); //undefined
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      const {recipient, text, sender} = messageData;
      // if (sender === selectedUserId) {
      // Only update messages for the current user
      setMessages(pre => [...pre, {...messageData}]);
      // }
    } else {
      console.log(messageData);
    }
  };

  const handleLogout = () => {
    axios
      .get("/api/v1/user/logout")
      .then(res => {
        // setWs(null);
        // setId("");
        // setUsername("");
        setUser({});
        console.log("logged out");
        navigate("/login");
      })
      .catch(err => {
        console.log(err);
      });
  };

  // send message
  const sendMessage = (e, file = null) => {
    // const file = ev.target?.files?.[0];
    // e.preventDefault();
    if (e) {
      e.preventDefault();
    }
    // console.log(file.data);
    if (!selectedUserId) {
      console.warn("Please select a recipient before sending a message");
      return;
    }
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );

    if (file) {
      axios.get("/api/v1/messages/" + selectedUserId).then(res => {
        // console.log(res);
        setMessages(res.data);
      });
    } else {
      setNewMessageText("");
      setMessages(pre => [
        ...pre,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  };

  const handleSendFile = e => {
    const reader = new FileReader();
    // console.log(e.target.files);
    //file will load as base64
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        data: reader.result,
        name: e.target.files[0].name,
      });
    };
  };

  // to scroll at the recent msg
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // to get offline people
  useEffect(() => {
    axios
      .get("/api/v1/user/people/")
      .then(res => {
        const offlinePeopleArr = res.data
          .filter(p => p._id != id)
          .filter(p => !Object.keys(onlinePeople).includes(p._id));

        const offlinePeople = {};
        offlinePeopleArr.forEach(p => {
          offlinePeople[p._id] = p.username;
        });

        setOfflinePeople(offlinePeople);
      })
      .catch(err => console.log("ERROR OCURRED, while getting offline people: ", err));
  }, [onlinePeople]);

  // to get the old messages from server
  useEffect(() => {
    if (selectedUserId) {
      axios.get("/api/v1/messages/" + selectedUserId).then(res => {
        // console.log(res);
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  // remove duplicate messages with same message ._id
  const messagesWithoutDupes = Array.from(
    new Map(messages.map(msg => [msg._id, msg])).values()
  );
  // console.log(messagesWithoutDupes);

  return (
    <div className="flex h-screen">
      {isSearchSidebar && (
        <SearchSideBar
          onClick={() => {
            setIsSearchSidebar(false);
          }}
        />
      )}
      {/* ---------contact sidebar---------------- */}
      <div className="bg-bg_primary_lite w-1/3 flex flex-col border-r border-r-[#939185]">
        <Logo />
        <div className="flex gap-2 mx-6 ">
          <button
            onClick={() => {
              setIsSearchSidebar(true);
            }}
            className="border"
          >
            search user
          </button>
          <button
            onClick={() => {}}
            className="border h-7 w-7 text-white bg-white rounded-full"
          >
            <div className="relative">
              <div className="h-4 w-4 bg-red-600 absolute left-4 -top-1 rounded-full text-xs">
                {5}
              </div>
            </div>
            <img src={notificationIcon} className="text-white" />
          </button>
        </div>
        <div>notification</div>
        <button
          onClick={() => {
            setIsGroupChatModal(true);
          }}
          className="border"
        >
          Create group chat
        </button>

        {isGroupChatModal && (
          <GroupCreateModal
            onClick={() => {
              setIsGroupChatModal(false);
            }}
          />
        )}

        <div className="flex-grow relative h-full overflow-y-scroll overflow-x-hidden contact-scrollbar">
          {/* -------------contacts/chats------------ */}
          <div className="absolute top-0 bottom-0 left-0 right-0">
            {/* <div className=""> */}
            {/* {Object.keys(onlinePeople).map(userId => {
              if (onlinePeople[userId] == username) return;
              return (
                <Contact
                  key={userId}
                  online={true}
                  userId={userId}
                  username={onlinePeople[userId]}
                  onClick={() => {
                    setSelectedUserId(userId);
                  }}
                  selected={userId == selectedUserId}
                />
              );
            })} */}

            {/* {Object.keys(offlinePeople).map(userId => {
              if (offlinePeople[userId] == username) return;
              return (
                <Contact
                  key={userId}
                  online={false}
                  userId={userId}
                  username={offlinePeople[userId]}
                  onClick={() => {
                    setSelectedUserId(userId);
                  }}
                  selected={userId == selectedUserId}
                />
              );
            })} */}

            {chats.map(chat => (
              <Contact
                key={chat._id}
                online={false}
                userId={chat._id}
                username={
                  !chat.isGroupChat ? getSender(user, chat.users).name : chat.chatName
                }
                onClick={() => {
                  setSelectedChat(chat);
                }}
                selected={false}
              />
            ))}

            {/* </div> */}
          </div>
        </div>

        {/* -------------Logged in user----------- */}
        <div className="flex items-center justify-center gap-5 px-1 py-4 bg-primary_color">
          <span
            onClick={() => {
              setShowProfile(true);
            }}
            className="text-sm text-[#F9DBBB] flex items-center gap-1 p-2 select-none cursor-pointer"
          >
            <img src={userIcon} alt="" className="w-5" />
            {user.name}
          </span>
          {showProfile && (
            <ProfileDetail
              onClick={() => {
                setShowProfile(false);
              }}
              name={user.name}
              email={user.email}
              userId={user._id}
              image={userIcon}
            />
          )}
          <button
            onClick={handleLogout}
            className="text-sm bg-[#24262b] text-[#dcb5e9] font-semibold py-1 px-2 rounded-lg hover:bg-[#2E4F4F] hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ----------messages--------------- */}
      <div className="flex flex-col bg-[#686D76] w-2/3 ">
        {selectedChat && (
          <div className="flex items-center justify-between gap-1 bg-[#373A40] p-2">
            {showSenderProfile &&
              (selectedChat.isGroupChat ? (
                <GroupUpdateModal
                  onClick={() => {
                    setShowSenderProfile(false);
                  }}
                />
              ) : (
                <ProfileDetail
                  onClick={() => {
                    setShowSenderProfile(false);
                  }}
                  name={getSender(user, selectedChat.users).name}
                  email={getSender(user, selectedChat.users).email}
                  userId={selectedChat._id}
                />
              ))}
            <div
              onClick={() => {
                setShowSenderProfile(true);
              }}
              className="rounded-full cursor-pointer"
            >
              <Avatar
                onClick={() => {}}
                size="10"
                userId={selectedChat._id}
                username={
                  selectedChat.isGroupChat
                    ? selectedChat.chatName
                    : getSender(user, selectedChat.users).name
                }
              />
            </div>
            <div className="flex capitalize font-semibold text-white text-lg">
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : getSender(user, selectedChat.users).name}
            </div>
            <button onClick={() => {}} className="h-5 w-5 text-white  rounded-full">
              <div className="relative">
                <div className="h-4 w-4 bg-red-600 absolute left-2 -top-3 rounded-full text-xs">
                  {5}
                </div>
              </div>
              <img src={phoneCallIcon} className="text-white" />
            </button>
          </div>
        )}
        <div className="flex-grow">
          {!selectedChat && (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">&larr; Select a contact from sidebar</div>
            </div>
          )}

          {selectedChat && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-1 message-scrollbar px-2">
                {messagesWithoutDupes.map(msg => {
                  return (
                    <DisplayMessages
                      key={msg._id}
                      id={id}
                      sender={msg.sender}
                      text={msg.text}
                      file={msg.file}
                    />
                  );
                })}
                <div ref={divUnderMessages} className=""></div>
              </div>
            </div>
          )}
        </div>

        {selectedChat && (
          <form onSubmit={sendMessage} className="flex gap-2 p-3 bg-primary_color ">
            <input
              type="text"
              value={newMessageText}
              onChange={e => {
                setNewMessageText(e.target.value);
              }}
              placeholder="Type your message here"
              className="text-white bg-[#555961] flex-grow border p-2 rounded-lg border-none outline-none focus-within:border focus-within:border-[#e77600]"
            />
            <label
              type="button"
              className="bg-[#24262b] p-2 rounded-lg w-10 text-[#dcb5e9] cursor-pointer hover:bg-[#2E4F4F] hover:text-white transition-all duration-300"
            >
              <input type="file" onChange={handleSendFile} className="hidden" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-[#24262b] w-10 p-2 rounded-lg text-[#dcb5e9] cursor-pointer hover:bg-[#2E4F4F] hover:text-white transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="send">
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path
                  d="M3.4 20.4l17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"
                  fill="currentColor"
                  className="color000000 svgShape"
                ></path>
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
