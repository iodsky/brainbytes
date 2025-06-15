import mongoose from "mongoose";

export interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Create schema to define the shapes of the document
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.password;
        delete ret._id;
        return ret;
      },
    },
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
