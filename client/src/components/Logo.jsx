import React from "react";

const Logo = () => {
  return (
    <div className="text-logo_color bg-primary_color font-bold flex gap-2 justify-center items-center">
      <svg
        height="35"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 54 54"
        id="bubble-chat"
      >
        <g>
          <path
            fill="#DC5F00"
            d="M32.81,35.46a23.31,23.31,0,0,1-2.87-.19L16.3,39.71s4.23-6.56,4.8-7.43a18.18,18.18,0,0,1-7.6-8.78H6.91a4,4,0,0,0-3.89,4V40.23a4,4,0,0,0,3.89,4H17.42L26.72,51l-2.79-6.75h5.52a4,4,0,0,0,3.92-4V35.45Z"
          ></path>
          <path
            fill="#F5F7F8"
            d="M33,3c-9.92,0-18,6.66-18,14.89,0,5.74,3.92,10.72,9.65,13.21l-2.57,4,7.73-2.52a21.58,21.58,0,0,0,3.14.24C42.94,32.77,51,26.1,51,17.87S42.94,3,33,3ZM25.3,25.28a1.22,1.22,0,1,1,1.23-1.22A1.23,1.23,0,0,1,25.3,25.28Zm4.4,0a1.22,1.22,0,1,1,1.22-1.22A1.23,1.23,0,0,1,29.7,25.28Zm4.39,0a1.22,1.22,0,1,1,1.23-1.22A1.22,1.22,0,0,1,34.09,25.28Zm7.25-4.81H23.89V19.34H41.34Zm0-4.15H23.89V15.19H41.34Zm0-3.78H23.89V11.41H41.34Z"
          ></path>
        </g>
      </svg>

      <div className="select-none text-xl">Talk To Me</div>
    </div>
  );
};

export default Logo;
