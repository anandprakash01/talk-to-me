import React from "react";

const PreviewInputFile = ({onClick, src}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-950 w-full h-screen z-40 bg-opacity-65 flex items-center justify-center transition-all duration-300">
      <div className="absolute xs:w-60 sm:w-64 md:w-96 bg-bg_primary_lite rounded-lg z-50">
        <div className="relative">
          <div
            onClick={onClick}
            className="absolute bg-red-600 text-white right-1 top-1 px-2 py-1 rounded-md cursor-pointer hover:bg-red-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.7"
              stroke="currentColor"
              className="xs:size-3 md:size-4 lg:size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <div className="mt-5 text-center mx-auto xs:text-base md:text-lg font-semibold text-emerald-200">
          Preview
        </div>
        <div className="my-4 mx-auto w-3/4 text-white text-center xs:text-sm md:text-lg">
          <img className="w-full h-64 object-cover rounded-lg" src={src} alt="Preview" />
        </div>
      </div>
    </div>
  );
};

export default PreviewInputFile;
