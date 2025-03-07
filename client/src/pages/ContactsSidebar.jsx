import React, {useContext, useState} from "react";
import axios from "axios";

//components
import {UserContext} from "../context/UserContext.jsx";
import GroupCreateModal from "../components/GroupCreateModal.jsx";
import Contact from "../components/Contact.jsx";
import {getSender} from "../config/chatLogics.jsx";
import ProfileDetail from "../components/ProfileDetailModal.jsx";
import SearchSideBar from "../components/SearchSideBar.jsx";

//Icons
import Logo from "../components/Logo";
import NotificationIcon from "../assets/icons/NotificationIcon.jsx";
import SearchIcon from "../assets/icons/SearchIcon.jsx";
import AddToGroupIcon from "../assets/icons/AddToGroupIcon.jsx";
import LogoutIcon from "../assets/icons/LogoutIcon.jsx";
import userIcon from "../assets/icons/userIcon.svg";
import UserIconCircle from "../assets/icons/UserIconCircle.jsx";
import {useNavigate} from "react-router";

const ContactsSidebar = ({setMessages}) => {
  const {
    user,
    setUser,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    chats,
  } = useContext(UserContext);

  const [popupMsg, setPopupMsg] = useState({
    title: "",
    text: "",
  });
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isGroupChatModal, setIsGroupChatModal] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [isSearchSidebar, setIsSearchSidebar] = useState(false);

  const handleLogout = () => {
    axios
      .get("/api/v1/user/logout")
      .then(res => {
        // setWs(null);
        // setId("");
        // setUsername("");
        setUser({});
        setSelectedChat(); //object
        setMessages([]);
        // localStorage.removeItem("userInfo");
        setIsPopup(true);
        setPopupMsg({
          text: "Successfully Logged out, redirecting you to Login page",
          title: "Logout",
        });
        setTimeout(() => {
          setIsPopup(false);
          navigate("/login");
        }, 3000);
      })
      .catch(err => {
        console.log("Error while logging out:=> ", err);
        setIsPopup(true);
        setPopupMsg({
          text: "Something went wrong, Please refresh and try again!",
          title: "Error",
        });
        setTimeout(() => {
          setIsPopup(false);
        }, 4000);
      });
  };

  return (
    <>
      {isSearchSidebar && (
        <SearchSideBar
          onClick={() => {
            setIsSearchSidebar(false);
          }}
        />
      )}
      <div className="flex flex-col h-screen w-1/3 bg-bg_primary_lite border-r border-r-[#0d4247]">
        <div className="flex justify-between items-center border-b border-[#0d4247] xs:mx-1 md:mx-2 xs:min-h-9 md:min-h-12">
          <div className="text-logo_color bg-primary_color font-bold flex gap-1 justify-center items-center xs:h-4 sm:h-4 md:h-6 lg:h-8 xl:h-10">
            <Logo />
            <div className="select-none text-nowrap xs:text-[0.6rem] sm:text-xs md:text-lg lg:text-xl">
              Talk To Me
            </div>
          </div>

          {/* ==========Notification Icon */}
          <div className="relative">
            <div
              onClick={() => {
                setShowNotification(!showNotification);
              }}
              className="select-none text-icon_color hover:text-white cursor-pointer"
            >
              <NotificationIcon />
              {notification.length >= 0 && (
                <div className="absolute pl-1 xs:size-3 md:size-4 bg-red-600 rounded-full xs:text-[.5rem] md:text-xs -top-1 -right-1">
                  {notification.length}
                </div>
              )}
            </div>
            {/* ==========Show Notification */}
            {showNotification && (
              <div className="absolute bg-[#C1D8C3] -left-16 p-2 xs:w-52 sm:w-64 md:w-80 lg:w-120 rounded-lg overflow-hidden z-50 text-black shadow-gray-950 shadow-md">
                <div
                  onClick={() => {
                    setShowNotification(!showNotification);
                  }}
                  className="absolute right-2 top-2 bg-[#EC7FA9] text-white rounded-sm cursor-pointer hover:bg-[#BE5985] transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.7"
                    stroke="currentColor"
                    className="xs:size-4 md:size-6 lg:size-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                {!notification.length && (
                  <div className="mb-2 mt-5 text-center xs:text-sm md:text-base">
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
          <div className="absolute top-0 bottom-0 left-0 right-0 text-white">
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
          <div className="absolute right-2 bottom-5">
            <div
              onClick={() => {
                setIsSearchSidebar(true);
              }}
              className="mb-2 text-icon_color cursor-pointer hover:text-white transition-all duration-300 xs:w-5 md:w-7 lg:w-8"
            >
              <SearchIcon />
            </div>
            <div
              onClick={() => {
                setIsGroupChatModal(true);
              }}
              className="cursor-pointer text-icon_color hover:text-white transition-all duration-300 xs:w-5 md:w-7 lg:w-8"
            >
              <AddToGroupIcon />
            </div>
          </div>
        </div>
        {/* ====================Logged in user */}
        <div className="flex items-center justify-between bg-primary_color border-t border-[#0d4247] xs:mx-1 md:mx-2 xs:min-h-9 md:min-h-12">
          <div
            onClick={() => {
              setShowProfile(true);
            }}
            className="flex items-center text-[#F9DBBB] xs:gap-1 md:gap-2 select-none cursor-pointer"
          >
            {/* <img src={userIcon} alt="" className="w-5" /> */}
            <span className="xs:w-5 md:w-8 hover:text-white transition-all duration-300">
              <UserIconCircle />
            </span>
            <span className="xs:text-[0.6rem] sm:text-xs md:text-base font-normal hover:text-white transition-all duration-300 ">
              {user.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="xs:w-5 md:w-7 lg:w-8 text-icon_color bg-red-500 xs:rounded-md md:rounded-lg hover:bg-red-600 xs:py-[0.1rem] xs:pl-[0.15rem] md:p-1 md:pl-[0.3rem] hover:text-white transition-all duration-300"
          >
            <LogoutIcon />
          </button>

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
        </div>
      </div>
    </>
  );
};
export default ContactsSidebar;
