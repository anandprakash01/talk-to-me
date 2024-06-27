import React from "react";
import Avatar from "./Avatar";

const Contact = ({userId, username, selected, onClick, online}) => {
  return (
    <div
      onClick={onClick}
      className={
        "transition-all duration-300 hover:bg-[#232D3F] " +
        "border-b border-gray-800 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-[#2E4F4F]" : "")
      }
    >
      {selected && <div className="w-1 bg-[#E19898] h-12 rounded-r-md absolute"></div>}

      <div className="flex gap-2 py-2 pl-5 items-center capitalize">
        <Avatar online={online} username={username} userId={userId} />
        <span className="text-white">{username}</span>
      </div>
    </div>
  );
};

export default Contact;
