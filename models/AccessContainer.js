import mongoose from "mongoose";

const accessContainerSchema = new mongoose.Schema({

  userId: {
    type: String,
    required: true,
  },

  platform: {
    type: String,
    default: "facebook",
  },

  pageId: {
    type: String,
    required: true,
  },

  pageName: {
    type: String,
    required: true,
  },

  pageToken: {
    type: String,
    required: true,
  },

  instagramId: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

},
{
  collection: "Access_Container",
});

const AccessContainer = mongoose.model(
  "AccessContainer",
  accessContainerSchema
);

export default AccessContainer;