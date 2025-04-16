import React from "react";
import ReactDOM from "react-dom";
import closeIcon from "../assets/icons/close.svg";
import CloseIcon from "../assets/icons/CloseIcon";
import Avatar from "./Avatar";
import avatarUser from "../assets/icons/avatarUser.svg";

const ProfileDetail = ({onClick, name, email, userId, image}) => {
  return ReactDOM.createPortal(
    <div
      onClick={() => {}}
      className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300"
    >
      <div className="absolute bg-bg_primary_lite rounded-lg z-50 xs:w-60 sm:w-72 md:w-96 lg:w-120">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-800 transition-all duration-300"
          >
            {/* <img src={closeIcon} className="h-5" /> */}
            <CloseIcon />
          </div>
        </div>
        <div className="my-5">
          <div className="my-2">
            {/* <Avatar size="28" username={name} userId={userId} /> */}
            <img src={avatarUser} alt="" className="xs:w-20 md:w-40 mx-auto" />
          </div>
          <div className="xs:text-base md:text-lg font-semibold text-center text-emerald-200">
            {name}
          </div>
          <div className="text-white text-center xs:text-sm md:text-base">{email}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileDetail;
