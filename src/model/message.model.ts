import mongoose from "mongoose";

export interface IMessage {
  _id: mongoose.Schema.Types.ObjectId;
  chat: mongoose.Schema.Types.ObjectId;
  prompt: string;
  json_response?: JSON;
  image?: string;
}

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    json_response: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
