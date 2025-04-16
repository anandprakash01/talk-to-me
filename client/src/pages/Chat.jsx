import {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
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
import LoadingPage from "../components/LoadingPage.jsx";

//icons
import loadingIcon from "../assets/icons/loading.svg";
import avatarUser from "../assets/icons/avatarUser.svg";
import LinkIcon from "../assets/icons/LinkIcon.jsx";
import SendIcon from "../assets/icons/SendIcon.jsx";

import PhoneCallIcon from "../assets/icons/PhoneCallIcon.jsx";
// import SearchIcon from "../assets/icons/SearchIcon.jsx";
import AddToGroupIcon from "../assets/icons/AddToGroupIcon.jsx";
import UserIconCircle from "../assets/icons/UserIconCircle.jsx";
import PreviewInputFile from "../components/PreviewInputFile.jsx";

// const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://talk-to-me-anand.onrender.com";
// var socket, selectedChatCompare;
let selectedChatCompare;

const Chat = () => {
  // const {username, setUsername, id, setId} = useContext(UserContext);

  // ----------here
  const {
    user,
    selectedChat,
    chats,
    setChats,
    fetchAgain,
    setFetchAgain,
    notification,
    setNotification,
    isLoadingUserInfo,
  } = useContext(UserContext);

  const socketRef = useRef();

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
  const messageContainer = useRef(null);
  const divUnderMessages = useRef();

  // Use useRef to store the timeout ID for debouncing
  const debounceTimeout = useRef(null);
  const typeEmitterTimeout = useRef(null); // for clearing the timeout of typing emitter

  // ==============

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showSenderProfile, setShowSenderProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingUserInfo && !user?.name) {
      navigate("/login");
    }
  }, [isLoadingUserInfo, user, navigate]);

  // ====================Socket.io Setup
  useEffect(() => {
    // Initialize socket only once
    if (!socketRef.current) {
      socketRef.current = io(ENDPOINT);
    }
    // user is undefined at the first render====fix this issue
    if (user?.name) {
      socketRef.current.emit("setup", user);
      socketRef.current.on("connected", () => setSocketConnected(true));
      socketRef.current.on("typing", () => setIsTyping(true));
      socketRef.current.on("stop typing", () => setIsTyping(false));
    }

    // Cleanup function to remove listeners and disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connected");
        socketRef.current.off("typing");
        socketRef.current.off("stop typing");
        // Don't disconnect here as it might be needed in other components
      }
    };
  }, [user]);

  useEffect(() => {
    if (socketRef.current) {
      // Remove previous listener to prevent duplicates
      socketRef.current.off("message received");

      // Add new listener
      socketRef.current.on("message received", newMessageReceived => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // give notification
          if (!notification.includes(newMessageReceived)) {
            setNotification([newMessageReceived, ...notification]);
            // if (!chats.includes(newMessageReceived.chat)) {
            setFetchAgain(!fetchAgain);
            // }
          }
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("message received");
      }
    };
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
  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  // get/update messages
  const fetchMessages = async () => {
    if (!selectedChat) return;

    // remove from notification
    setNotification(notification.filter(noti => noti.chat._id !== selectedChat._id));
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setIsMessageLoading(true);
      const {data} = await axios.get(`/api/v1/message/${selectedChat._id}`, config);
      setMessages(data);
      setIsMessageLoading(false);
      socketRef.current.emit("join chat", selectedChat._id);
    } catch (err) {
      console.log("Error while getting messages: ", err);
    }
  };

  useEffect(() => {
    setMessages([]);
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const debouncedTypingHandler = e => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    // clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socketRef.current.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessage = async (e, file = null) => {
    e.preventDefault();
    setIsMessageLoading(true);
    socketRef.current.emit("stop typing", selectedChat._id);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (!newMessage && !file) {
      setIsMessageLoading(false);
      return;
    }
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
          content: newMessage || file,
          chatId: selectedChat._id,
        },
        config
      );
      socketRef.current.emit("new message", data);
      setMessages([...messages, data]);
      setIsMessageLoading(false);
    } catch (err) {
      console.log(err);
      setIsMessageLoading(false);
    }
  };

  const handleSendFile = e => {
    if (!e.target.files[0]) return;
    setIsMessageLoading(true);
    const reader = new FileReader();
    console.log(e.target.files);

    //file will load as base64
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      console.log("reader.result");
      setIsMessageLoading(false);
      sendMessage(e, {
        file: reader.result,
        fileName: e.target.files[0].name,
      });
    };
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

  // to scroll at the recent msg
  useLayoutEffect(() => {
    const container = messageContainer.current;
    const div = divUnderMessages.current;
    // if (div) {
    //   div.scrollIntoView({
    //     behavior: "auto",
    //     block: "end",
    //   });
    // }
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]); // Runs synchronously before painting the UI

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

  // remove duplicate messages with same message ._id
  // const messagesWithoutDupes = Array.from(
  //   new Map(messages.map(msg => [msg._id, msg])).values()
  // );
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

      {/* {<PreviewInputFile />} */}

      {/* ====================contact sidebar*/}
      <ContactsSidebar setMessages={setMessages} socket={socketRef.current} />

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

              <div>
                <div className="flex flex-col gap-0 capitalize font-normal text-white xs:text-xs md:text-lg">
                  {selectedChat.isGroupChat
                    ? selectedChat.chatName
                    : getSender(user, selectedChat.users).name}
                </div>
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

            {/* ================Messages Box=============== */}
            <div className="h-full">
              {!isMessageLoading && messages.length <= 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-400 xs:text-sm md:text-base text-center">
                    No messages
                  </div>
                </div>
              )}

              {messages.length > 0 && (
                <div className="relative h-full max-w-full">
                  <div
                    ref={messageContainer}
                    className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-1 message-scrollbar px-2"
                  >
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
                    {/* <div ref={divUnderMessages} className=""></div> */}
                    {/* -----------Typing indicator----------- */}
                    {isTyping && (
                      <div className="xs:mx-1 md:mx-2">
                        <svg
                          height="40"
                          width="40"
                          className="loader"
                          style={{backgroundColor: "transparent"}}
                        >
                          <circle className="dot" cx="10" cy="20" r="3" />
                          <circle className="dot" cx="20" cy="20" r="3" />
                          <circle className="dot" cx="30" cy="20" r="3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --------MessageLoading icon---------- */}
              {isMessageLoading && (
                <img
                  src={loadingIcon}
                  alt=""
                  className="absolute w-8 sm:bottom-10 md:bottom-14 left-[65%]"
                />
              )}
            </div>

            {/* ========Send message form========= */}
            <form
              onSubmit={sendMessage}
              className="flex relative items-center gap-1 p-1 md:px-2 bg-primary_color xs:min-h-9 md:min-h-12"
            >
              <input
                type="text"
                value={newMessage}
                onChange={debouncedTypingHandler}
                placeholder="Type your message here"
                className="flex-grow xs:text-xs md:text-base xs:h-6 md:h-9 border xs:px-1 md:px-2 xs:rounded-md md:rounded-lg bg-bg_input outline-none focus-within:border focus-within:border-green-500"
              />

              {/* ===========File Input=========== */}
              {/* <label
                type="button"
                className="bg-blue-500 p-[2px] pl-[0.15rem] md:p-1 xs:rounded-sm md:rounded-lg xs:w-6 md:w-9 cursor-pointer text-icon_color hover:text-white hover:bg-blue-600 hover: transition-all duration-300"
              >
                <input type="file" onChange={handleSendFile} className="hidden" />
                <LinkIcon />
              </label> */}
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
