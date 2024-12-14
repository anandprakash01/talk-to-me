import React, {useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";

import axios from "axios";
import io from "socket.io-client";

import Logo from "../components/Logo";
import {UserContext} from "../context/UserContext";
import Contact from "../components/Contact";

import "../styles/chat.css";
import Avatar from "../components/Avatar";
import DisplayMessages from "../components/DisplayMessages";
import ProfileDetail from "../components/ProfileDetailModal";
import GroupCreateModal from "../components/GroupCreateModal";
import GroupUpdateModal from "../components/GroupUpdateModal";
import SearchSideBar from "../components/SearchSideBar";
import {getSender} from "../config/chatLogics";

import userIcon from "../assets/icons/userIcon.svg";
import LinkIcon from "../assets/icons/LinkIcon.jsx";
import SendIcon from "../assets/icons/SendIcon.jsx";
import LogoutIcon from "../assets/icons/LogoutIcon.jsx";
import PhoneCallIcon from "../assets/icons/PhoneCallIcon.jsx";
import NotificationIcon from "../assets/icons/NotificationIcon.jsx";
import SearchIcon from "../assets/icons/SearchIcon.jsx";
import AddToGroupIcon from "../assets/icons/AddToGroupIcon.jsx";
import UserIconCircle from "../assets/icons/UserIconCircle.jsx";

import Doodles from "../assets/doodles.jsx";
import Popup from "../components/Popup.jsx";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const Chat = () => {
  // const {username, setUsername, id, setId} = useContext(UserContext);

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
    notification,
    setNotification,
  } = useContext(UserContext);

  const [loggedUser, setLoggedUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGroupChatModal, setIsGroupChatModal] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isPopup, setIsPopup] = useState(false);

  // ==============

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
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

  // ====================Socket.io Setup
  useEffect(() => {
    socket = io(ENDPOINT);
    console.log("Connection Stablish with Socket");
    // user is undefined at the first render====fix this issue
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, [user]); // user is undefined in first render thats why user dependency
  // using user in the dependency typing is not working

  useEffect(() => {
    setLoggedUser(user);
    fetchChats();
  }, [fetchAgain]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const {data} = await axios.get(`/api/v1/message/${selectedChat._id}`, config);
      // console.log(data);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", newMessageReceived => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // give notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = e => {
    setNewMessage(e.target.value);

    // ====================Typing Indicator
    // Not working :user is undefined at the first render
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    var lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    // improve typing indication logic
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessage = async e => {
    e.preventDefault();
    socket.emit("stop typing", selectedChat._id);
    if (newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const {data} = await axios.post(
          "/api/v1/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // ---============---old---=========---
  // useEffect(() => {
  //   if (!id && !username) {
  //     navigate("/login");
  //   } else {
  //     connectToWS();
  //   }
  // }, [id, username]);

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
  useEffect(() => {
    // connectToWS();
  }, []);

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
  // const sendMessage = (e, file = null) => {
  //   // const file = ev.target?.files?.[0];
  //   // e.preventDefault();
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   // console.log(file.data);
  //   if (!selectedUserId) {
  //     console.warn("Please select a recipient before sending a message");
  //     return;
  //   }
  //   ws.send(
  //     JSON.stringify({
  //       recipient: selectedUserId,
  //       text: newMessageText,
  //       file,
  //     })
  //   );

  //   if (file) {
  //     axios.get("/api/v1/messages/" + selectedUserId).then(res => {
  //       // console.log(res);
  //       setMessages(res.data);
  //     });
  //   } else {
  //     setNewMessageText("");
  //     setMessages(pre => [
  //       ...pre,
  //       {
  //         text: newMessageText,
  //         sender: id,
  //         recipient: selectedUserId,
  //         _id: Date.now(),
  //       },
  //     ]);
  //   }
  // };

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
      .catch(err => console.log("ERROR OCCURRED, while getting offline people: ", err));
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

      {/* ====================contact sidebar*/}

      <div className="flex flex-col bg-bg_primary_lite w-1/3 border-r border-r-[#0d4247]">
        <div className="flex gap-2 justify-between items-center h-[4.1rem] p-2 px-5 border-b border-[#0d4247]">
          <Logo />

          {/* ==========Notification Icon */}
          <div className="relative">
            <div
              onClick={() => {
                setShowNotification(!showNotification);
              }}
              className="select-none text-icon_color h-8 w-8 hover:text-white cursor-pointer"
            >
              {notification.length > 0 && (
                <div className="relative">
                  <div className="pl-1 h-4 w-4 bg-red-600 absolute left-4 -top-1 rounded-full text-xs">
                    {notification.length}
                  </div>
                </div>
              )}
              <NotificationIcon />
            </div>
            {/* ==========Show Notification */}
            {showNotification && (
              <div className="absolute top-7 -right-5 w-72 min-w-44 bg-white rounded-lg overflow-hidden z-50 text-black shadow-gray-950 shadow-md">
                {!notification.length && (
                  <div className="pl-20 py-8 border-b ">
                    <p>No new message</p>
                  </div>
                )}
                {notification.map(notif => {
                  return (
                    <div key={notif._id} className="px-4 py-2 border-b">
                      <p
                        onClick={() => {
                          setSelectedChat(notif.chat);
                          setNotification(notification.filter(n => n !== notif));
                        }}
                      >
                        {notif.chat.isGroupChat
                          ? `New message in ${notif.chat.chatName}`
                          : `New message from ${getSender(user, notif.chat.users).name}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
                selected={selectedChat?._id === chat._id}
              />
            ))}

            {/* </div> */}
          </div>
        </div>

        {/* ===========Add To Group and New Chat */}
        <div className="relative">
          <div className="absolute right-4 bottom-12">
            <div
              onClick={() => {
                setIsSearchSidebar(true);
              }}
              className="h-9 w-9 mb-4 text-icon_color cursor-pointer hover:text-white transition-all duration-300"
            >
              <SearchIcon />
            </div>
            <div
              onClick={() => {
                setIsGroupChatModal(true);
              }}
              className="h-9 w-9 cursor-pointer text-icon_color hover:text-white transition-all duration-300"
            >
              <AddToGroupIcon />
            </div>
          </div>
        </div>
        {/* ====================Logged in user */}
        <div className="flex items-center justify-between px-2 py-3 bg-primary_color border-t border-[#0d4247]">
          <span
            onClick={() => {
              setShowProfile(true);
            }}
            className="text-sm text-[#F9DBBB] flex items-center gap-2 p-2 select-none cursor-pointer"
          >
            <img src={userIcon} alt="" className="w-5" />
            {/* <UserIconCircle /> */}
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
            className="h-8 w-8 text-icon_color bg-red-500 font-semibold rounded-lg hover:bg-red-600 p-1 pl-2 hover:text-white transition-all duration-300"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* ====================Messages Section */}

      <div className="flex flex-col bg-bg_primary_dark w-2/3 ">
        {/* ==========Name and Profile */}
        {/* <Doodles /> */}
        {selectedChat && (
          <div className="flex items-center justify-between gap-1 bg-bg_primary_lite py-2 px-5">
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
            <button
              onClick={() => {
                setIsPopup(!isPopup);
              }}
              className="h-5 w-5 text-icon_color rounded-full hover:text-white transition-all duration-300"
            >
              {/* <div className="relative">
                <div className="h-4 w-4 bg-red-600 absolute left-2 -top-3 rounded-full text-xs">
                  {0}
                </div>
              </div> */}
              <PhoneCallIcon />
            </button>
            {isPopup && (
              <Popup
                onClick={() => {
                  setIsPopup(!isPopup);
                }}
                text={
                  "We're working hard to launch our new features. Stay tuned for something amazing!"
                }
                title={"Coming Soon"}
              />
            )}
          </div>
        )}

        <div className="flex-grow">
          {!selectedChat && (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">
                &larr; Select a contact to start messaging
              </div>
            </div>
          )}

          {/* {loading ? spinner : messages} */}

          {selectedChat && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-1 message-scrollbar px-2">
                {messages.map((msg, i) => {
                  return (
                    <DisplayMessages
                      key={msg._id}
                      i={i}
                      message={msg}
                      messages={messages}
                      userId={user._id}
                    />
                  );
                })}

                <div ref={divUnderMessages} className=""></div>
              </div>
            </div>
          )}
        </div>
        {isTyping && (
          <div className="text-red-500 bg-green-900 animate-pulse">Typing...</div>
        )}

        {/* ========Send message form========= */}
        {selectedChat && (
          <form onSubmit={sendMessage} className="flex gap-2 p-3 bg-primary_color ">
            <input
              type="text"
              value={newMessage}
              onChange={typingHandler}
              placeholder="Type your message here"
              className="flex-grow border p-2 rounded-lg bg-bg_input  outline-none focus-within:border focus-within:border-green-500"
            />
            <label
              type="button"
              className="bg-blue-500 p-2 rounded-lg w-10 cursor-pointer text-icon_color hover:text-white hover:bg-blue-600 hover: transition-all duration-300"
            >
              <input type="file" onChange={handleSendFile} className="hidden" />
              <LinkIcon />
            </label>
            <button
              type="submit"
              className="text-icon_color bg-green-500 w-10 p-2 rounded-lg cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300"
            >
              <SendIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
