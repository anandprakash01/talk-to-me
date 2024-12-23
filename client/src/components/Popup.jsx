import React from "react";

const Popup = ({onClick, title, text}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 w-full h-screen z-40 bg-opacity-65 flex items-center justify-center transition-all duration-300">
      <div className="absolute w-96 bg-bg_primary_lite rounded-lg z-50">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <div className="text-center mx-auto mt-5 w-2/3 p-5 text-lg font-bold text-emerald-200">
          {title}
        </div>
        <div className="mb-10 mx-auto w-3/4 text-white text-center">{text}</div>
      </div>
    </div>
  );
};

export default Popup;
