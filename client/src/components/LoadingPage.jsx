import React from "react";
import loadingIcon from "../assets/loading.svg";

const LoadingPage = () => {
  return (
    <h1 className="h-screen w-full flex items-center justify-center bg-slate-600">
      <img src={loadingIcon} alt="" className="w-20" />
    </h1>
  );
};

export default LoadingPage;
