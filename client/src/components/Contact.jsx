import React from "react";
import Avatar from "./Avatar";

const Contact = ({userId, username, email, selected, onClick, online}) => {
  return (
    <div
      onClick={onClick}
      className={
        "transition-all duration-300 hover:bg-bg_primary_dark " +
        " flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-bg_primary_dark" : "")
      }
    >
      {selected && <div className="w-1 bg-[#E19898] h-12 rounded-r-md absolute"></div>}

      <div className="flex gap-2 py-2 pl-5 items-center capitalize">
        <Avatar online={online} username={username} userId={userId} />
        <div className="flex flex-col">
          <span className="text-white">{username}</span>
          {email && (
            <div>
              <span className="text-xs font-bold text-gray-800">Email: </span>
              <span className="text-xs text-gray-800">{email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
