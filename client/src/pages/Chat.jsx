import React, {useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";

import Logo from "../components/Logo";
import {UserContext} from "../context/UserContext";
import axios from "axios";
import Contact from "../components/Contact";

import "../styles/chat.css";
import Avatar from "../components/Avatar";
import DisplayMessages from "../components/DisplayMessages";

const Chat = () => {
  const {username, setUsername, id, setId} = useContext(UserContext);

  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const divUnderMessages = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    if (!id && !username) {
      navigate("/login");
    } else {
      connectToWS();
    }
  }, [id, username]);

  const connectToWS = () => {
    const ws = new WebSocket("https://talk-to-me-anand.onrender.com");
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
      .post("/api/v1/user/logout")
      .then(res => {
        setWs(null);
        setId("");
        setUsername("");
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

  // to get offline poeple
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
      .catch(err => console.log("ERROR OCUURED, while getting offline people: ", err));
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
      <div className="bg-bg_secondary w-1/3 flex flex-col border-r border-r-[#939185]">
        <Logo />
        <div className="flex-grow relative h-full overflow-y-scroll overflow-x-hidden contact-scrollbar">
          <div className="absolute top-0 bottom-0 left-0 right-0">
            {/* <div className=""> */}
            {Object.keys(onlinePeople).map(userId => {
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
            })}
            {Object.keys(offlinePeople).map(userId => {
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
            })}
            {/* </div> */}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 px-1 py-4 bg-primary_color">
          <span className="text-sm text-[#F9DBBB] flex items-center gap-1 p-2 select-none cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#FFF455"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
            {username}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-[#24262b] text-[#dcb5e9] font-semibold py-1 px-2 rounded-lg hover:bg-[#2E4F4F] hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col bg-[#686D76] w-2/3 ">
        {selectedUserId && (
          <div className="flex items-center justify-between gap-1 bg-[#373A40] p-2">
            <Avatar userId={selectedUserId} username={username} />
            <div className="flex capitalize font-semibold text-white text-lg">
              {onlinePeople[selectedUserId] || offlinePeople[selectedUserId]}
            </div>
            <div className=""></div>
          </div>
        )}
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">&larr; Select a contact from sidebar</div>
            </div>
          )}

          {selectedUserId && (
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

        {selectedUserId && (
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
