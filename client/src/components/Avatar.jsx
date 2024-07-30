import React from "react";

const Avatar = ({username, userId, online, onClick, size = "10"}) => {
  const colors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-yellow-300",
    "bg-green-400",
    "bg-teal-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-orange-300",
    "bg-lime-500",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-rose-300",
  ];

  const userIdBase10 = parseInt(userId, 16);
  const colorsIdx = userIdBase10 % colors.length;
  const color = colors[colorsIdx];

  return (
    <div
      onClick={onClick}
      className={`w-${size} h-${size} relative rounded-full flex items-center justify-center ${color}`}
    >
      <div className="w-full text-center font-semibold capitalize opacity-50 text-lg">
        {username[0]}
      </div>
      {online && (
        <div
          className="absolute w-3 h-3 bg-green-500
      bottom-0 right-0 rounded-full border border-white"
        ></div>
      )}
      {/* {!online && (
        <div
          className="absolute w-3 h-3 bg-gray-400
      bottom-0 right-0 rounded-full border border-white"
        ></div>
      )} */}
    </div>
  );
};

export default Avatar;
