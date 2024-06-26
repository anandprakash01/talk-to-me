const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: {
      type: String,
    },
    file: {
      type: String,
    },
  },
  {timestamps: true}
);

const Messages = mongoose.model("messages", messageSchema);

module.exports = Messages;
