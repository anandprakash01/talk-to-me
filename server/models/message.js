const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    content: {
      type: String || Object,
      required: true,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
    },
    // text: {
    //   type: String,
    //   trim: true,
    // },
    // file: {
    //   type: String,
    // },
  },
  {timestamps: true}
);

const Messages = mongoose.model("messages", messageSchema);

module.exports = Messages;
