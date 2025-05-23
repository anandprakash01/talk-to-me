import axios from "axios";
import PropTypes from "prop-types";
import {isLastMessage, isSameSender} from "../config/chatLogics";
import Avatar from "./Avatar";
import avatarUser from "../assets/icons/avatarUser.svg";

const DisplayMessages = ({messages, message, userId, i}) => {
  const {sender, content, file} = message;
  return (
    <>
      <div
        lang="en"
        className={
          "break-words hyphens-auto " +
          (sender._id === userId
            ? "text-right xs:ml-7 md:ml-20"
            : "text-left xs:ml-1 md:ml-4  xs:mr-7 md:mr-20")
        }
      >
        {/* {isSameSender(message, i, userId) ||
        (isLastMessage(message, i, userId) && )} */}

        {/* {sender._id !== userId && (
        <Avatar username={sender.name} userId={sender._id} size="5" />
      )} */}
        <div
          lang="en"
          className={
            "inline-block p-2 mt-1 rounded-md xs:text-[0.6rem] md:text-sm max-w-full " +
            (sender._id === userId
              ? "bg-[#3695a1] text-[#FBF9F1]"
              : "bg-[#37a8c2] text-[#0f1114]")
          }
        >
          {content}
          {file && (
            <div className="">
              <a
                className="border-b flex items-center gap-1"
                href={axios.defaults.baseURL + "/uploads/" + file}
                target="_blank"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                    clipRule="evenodd"
                  />
                </svg>
                {file}
              </a>
            </div>
          )}
        </div>
      </div>
      {(isSameSender(messages, message, i, userId) ||
        isLastMessage(messages, i, userId)) &&
        sender._id !== userId && (
          // <Avatar username={sender.name} userId={sender._id} size="4" />
          <div className="relative">
            <img
              src={avatarUser}
              alt=""
              className="absolute bottom-0 -left-2 xs:w-3 md:w-5"
            />
          </div>
        )}
    </>
  );
};

DisplayMessages.propTypes = {
  message: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
};

export default DisplayMessages;
