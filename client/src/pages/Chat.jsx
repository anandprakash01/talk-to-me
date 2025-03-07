import {useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import axios from "axios";
import io from "socket.io-client";

import "../styles/chat.css";

//components
import {UserContext} from "../context/UserContext";
import Contact from "../components/Contact";
import Avatar from "../components/Avatar";
import ContactsSidebar from "./ContactsSidebar.jsx";
import DisplayMessages from "../components/DisplayMessages";
import ProfileDetail from "../components/ProfileDetailModal";
import GroupUpdateModal from "../components/GroupUpdateModal";
import {getSender} from "../config/chatLogics";
import Popup from "../components/Popup.jsx";

//icons
import avatarUser from "../assets/icons/avatarUser.svg";
import LinkIcon from "../assets/icons/LinkIcon.jsx";
import SendIcon from "../assets/icons/SendIcon.jsx";

import PhoneCallIcon from "../assets/icons/PhoneCallIcon.jsx";
import SearchIcon from "../assets/icons/SearchIcon.jsx";
import AddToGroupIcon from "../assets/icons/AddToGroupIcon.jsx";
import UserIconCircle from "../assets/icons/UserIconCircle.jsx";
import LoadingPage from "../components/LoadingPage.jsx";
import loadingIcon from "../assets/icons/loading.svg";

// const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://talk-to-me-anand.onrender.com";
var socket, selectedChatCompare;

const Chat = () => {
  // const {username, setUsername, id, setId} = useContext(UserContext);

  // ----------here
  const {
    user,
    selectedChat,
    setChats,
    fetchAgain,
    setFetchAgain,
    notification,
    setNotification,
    isLoadingUserInfo,
  } = useContext(UserContext);

  const [loggedUser, setLoggedUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState({
    title: "",
    text: "",
  });

  // ==============

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showSenderProfile, setShowSenderProfile] = useState(false);
  const divUnderMessages = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingUserInfo && !user?.name) {
      navigate("/login");
    }
  });

  const fetchChats = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    try {
      const res = await axios.get("/api/v1/chat/", config);
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
    if (user.name) {
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }
  }, [user]);
  // user is undefined in first render thats why user dependency
  // using user in the dependency typing is not working

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
      setIsMessageLoading(true);
      const {data} = await axios.get(`/api/v1/message/${selectedChat._id}`, config);
      // console.log(data);
      setMessages(data);
      setIsMessageLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

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
    setIsMessageLoading(true);
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
        setIsMessageLoading(false);
        // console.log(data);
      } catch (err) {
        console.log(err);
        setIsMessageLoading(false);
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
      setIsMessageLoading(true);
      axios.get("/api/v1/messages/" + selectedUserId).then(res => {
        // console.log(res);
        setMessages(res.data);
      });
      setIsMessageLoading(false);
    }
  }, [selectedUserId]);

  // remove duplicate messages with same message ._id
  const messagesWithoutDupes = Array.from(
    new Map(messages.map(msg => [msg._id, msg])).values()
  );
  // console.log(messagesWithoutDupes);

  if (isLoadingUserInfo) {
    return <LoadingPage />;
  }

  return (
    <div className="flex h-screen">
      {isFullLoading && <LoadingPage />}
      {isPopup && (
        <Popup
          onClick={() => {
            setIsPopup(!isPopup);
          }}
          text={popupMsg.text}
          title={popupMsg.title}
        />
      )}

      {/* ====================contact sidebar*/}
      <ContactsSidebar setMessages={setMessages} />

      {/* ====================Messages Section */}

      <div className="flex flex-col bg-bg_primary_dark w-2/3">
        {!selectedChat && (
          <div className="h-full flex items-center justify-center bg-bg_primary_lite">
            <div className="text-gray-400 xs:text-sm md:text-base text-center">
              &larr; Select a contact to start messaging
            </div>
          </div>
        )}
        {selectedChat && (
          <>
            <div className="flex items-center justify-between bg-bg_primary_lite px-2 xs:min-h-9 md:min-h-12">
              {/* ==========Name and Profile */}
              <img
                onClick={() => {
                  setShowSenderProfile(true);
                }}
                src={avatarUser}
                alt=""
                className="cursor-pointer xs:w-6 md:w-10"
              />
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

              <div className="flex capitalize font-normal text-white xs:text-xs md:text-lg">
                {selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSender(user, selectedChat.users).name}
              </div>
              <button
                onClick={() => {
                  setPopupMsg({
                    text: "We're working hard to launch our new features. Stay tuned for something amazing!",
                    title: "Coming Soon",
                  });
                  setIsPopup(true);
                }}
                className="h-5 w-5 text-icon_color rounded-full hover:text-white transition-all duration-300"
              >
                <div className="xs:size-4 md:size-5">
                  <PhoneCallIcon />
                </div>
              </button>
            </div>

            <div className="h-full">
              {messages.length <= 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-400 xs:text-sm md:text-base text-center">
                    No messages
                  </div>
                </div>
              )}

              {messages.length > 0 && (
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

            {isMessageLoading && (
              <img
                src={loadingIcon}
                alt=""
                className="absolute xs:bottom-[10%] lg:bottom-[7%] right-[30%] w-7 mx-auto"
              />
            )}

            {/* {isTyping && (
              <div className="text-red-500 bg-green-900 animate-pulse">Typing...</div>
            )} */}

            {/* ========Send message form========= */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-1 p-1 md:px-2 bg-primary_color xs:min-h-9 md:min-h-12"
            >
              <input
                type="text"
                value={newMessage}
                onChange={typingHandler}
                placeholder="Type your message here"
                className="flex-grow xs:text-xs md:text-base xs:h-6 md:h-9 border xs:px-1 md:px-2 xs:rounded-md md:rounded-lg bg-bg_input outline-none focus-within:border focus-within:border-green-500"
              />
              <label
                type="button"
                className="bg-blue-500 p-[2px] pl-[0.15rem] md:p-1 xs:rounded-sm md:rounded-lg xs:w-6 md:w-9 cursor-pointer text-icon_color hover:text-white hover:bg-blue-600 hover: transition-all duration-300"
              >
                <input type="file" onChange={handleSendFile} className="hidden" />
                <LinkIcon />
              </label>
              <button
                type="submit"
                className="text-icon_color bg-green-500 xs:p-[0.1rem] md:p-1 xs:rounded-sm md:rounded-lg xs:w-6 md:w-9 cursor-pointer hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                <SendIcon />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
