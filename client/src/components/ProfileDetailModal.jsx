import React from "react";
import ReactDOM from "react-dom";
import closeIcon from "../assets/icons/close.svg";
import CloseIcon from "../assets/icons/CloseIcon";
import Avatar from "./Avatar";

const ProfileDetail = ({onClick, name, email, userId, image}) => {
  return ReactDOM.createPortal(
    <div
      onClick={() => {}}
      className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 w-full h-screen z-40 bg-opacity-60 flex items-center justify-center transition-all duration-300"
    >
      <div className="absolute w-96 bg-bg_primary_lite rounded-lg z-50">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-700"
          >
            {/* <img src={closeIcon} className="h-5" /> */}
            <CloseIcon />
          </div>
        </div>
        <div className="mx-auto mt-8 mb-5 w-3/4">
          <div className="h-28 w-28 mx-auto my-5">
            <Avatar size="28" username={name} userId={userId} />
          </div>

          <div className="text-lg font-bold text-center text-emerald-200">{name}</div>
          <div className="text-white text-center">{email}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileDetail;
