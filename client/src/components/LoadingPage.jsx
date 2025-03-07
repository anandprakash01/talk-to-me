import loadingIcon from "../assets/icons/loading.svg";

const LoadingPage = () => {
  return (
    <h1 className="fixed z-50 top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-bg_primary_dark opacity-70">
      <img src={loadingIcon} alt="" className={`w-12`} />
    </h1>
  );
};

export default LoadingPage;
