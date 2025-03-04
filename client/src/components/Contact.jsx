import React from "react";
import Avatar from "./Avatar";
import avatarUser from "../assets/icons/avatarUser.svg";

const Contact = ({userId, username, email, selected, onClick, online}) => {
  return (
    <div
      onClick={onClick}
      className={
        "transition-all duration-300 hover:bg-bg_primary_dark " +
        " cursor-pointer " +
        (selected ? "bg-bg_primary_dark" : "")
      }
    >
      {selected && (
        <div className="xs:w-[2px] md:w-1 bg-[#E19898] xs:h-8 md:h-12 rounded-r-md absolute"></div>
      )}

      <div className="flex xs:gap-1 md:gap-2 xs:h-8 md:h-12 xs:pl-2 lg:pl-4 items-center capitalize xs:text-[0.5rem] sm:text-xs md:text-base xs:-mx-1 md:mx-0">
        {/* <Avatar online={online} username={username} userId={userId} /> */}
        <img src={avatarUser} alt="" className="xs:w-5 md:w-10" />
        <div className="flex flex-col">
          <span className="text-white xs:text-[0.5rem] md:text-sm xs:-mb-0.5">
            {username}
          </span>
          {email && (
            <div className="flex items-center flex-wrap">
              <span className="xs:text-[0.4rem] md:text-xs font-bold text-gray-800 mr-0.5">
                Email:
              </span>
              <span className="xs:text-[0.4rem] md:text-xs text-gray-800 lowercase -my-1">
                {email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
