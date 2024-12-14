import React from "react";

const AddToGroupIcon = () => {
  return (
    <svg version="1.0" viewBox="0 0 24 24">
      <g>
        <path
          fill="currentColor"
          d="M10,9c0-1.7,1.3-3,3-3s3,1.3,3,3c0,1.7-1.3,3-3,3S10,10.7,10,9z M13,14c-4.6,0-6,3.3-6,3.3V19h12v-1.7   C19,17.3,17.6,14,13,14z"
        />
      </g>
      <g>
        <g>
          <circle fill="currentColor" cx="19.5" cy="8.5" r="2.5" />
        </g>
        <g>
          <path
            fill="currentColor"
            d="M19.5,13c-1.2,0-2.1,0.3-2.8,0.8c2.3,1.1,3.2,3,3.2,3.2l0,0.1H24v-1.3C24,15.7,22.9,13,19.5,13z"
          />
        </g>
      </g>
      <line
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="2"
        x1="5"
        x2="5"
        y1="8"
        y2="16"
      />
      <line
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="2"
        x1="9"
        x2="1"
        y1="12"
        y2="12"
      />
    </svg>
  );
};

export default AddToGroupIcon;
