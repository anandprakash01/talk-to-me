import loadingIcon from "../assets/loading.svg";

const LoadingPage = ({width = 12}) => {
  return (
    <h1 className="fixed z-50 top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-bg_primary_dark opacity-70">
      <img src={loadingIcon} alt="" className={`w-${width}`} />
    </h1>
  );
};

export default LoadingPage;
