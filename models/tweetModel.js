const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    tweetText: {
      type: String,
      required: [true, "Please Enter a tweet"],
      maxlength: [500, "too long tweet"],
    },
    tweetImage: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "tweet must have a user"],
    },
  },
  { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
