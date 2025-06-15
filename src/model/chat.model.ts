import mongoose from "mongoose";
import Message from "./message.model";

export enum Subject {
  // Core High School Subjects
  MATH = "math",
  SCIENCE = "science",
  ENGLISH = "english",
  FILIPINO = "filipino",
  ARALING_PANLIPUNAN = "araling_panlipunan",
  TLE = "tle",
  MAPEH = "mapeh",

  // University-Level / Specializations
  ACCOUNTING = "accounting",
  ECONOMICS = "economics",
  BUSINESS = "business",
  MARKETING = "marketing",
  COMPUTER_SCIENCE = "computer_science",
  INFORMATION_TECHNOLOGY = "information_technology",
  ENGINEERING = "engineering",
  MEDICAL_SCIENCE = "medical_science",
  NURSING = "nursing",
  EDUCATION = "education",
  PSYCHOLOGY = "psychology",
  SOCIOLOGY = "sociology",
  PHILOSOPHY = "philosophy",
  LAW = "law",
  JOURNALISM = "journalism",
  COMMUNICATION = "communication",
  TOURISM = "tourism",
  HOSPITALITY_MANAGEMENT = "hospitality_management",
  AGRICULTURE = "agriculture",
  CRIMINOLOGY = "criminology",

  // Misc / Review
  CIVIC_EDUCATION = "civic_education",
  GENERAL_KNOWLEDGE = "general_knowledge",
  COLLEGE_ENTRANCE_TEST = "college_entrance_test",
}

export interface IChat {
  id: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  subject: string;
}

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      enum: Object.values(Subject),
      required: true,
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

chatSchema.pre("findOneAndDelete", async function (next) {
  const chat = await this.model.findOne(this.getFilter());
  if (chat) {
    await Message.deleteMany({ chat: chat._id });
  }
  next();
});

const Chat = mongoose.model<IChat>("chat", chatSchema);

export default Chat;
