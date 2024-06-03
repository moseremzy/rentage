const mongoose = require("mongoose");

const adminschema = mongoose.Schema({

    username: {
        required: true,
        type: String
    },

    password: {
       required: true,
       type: String
    },

    pin: {
       default: "2456",
       type: String
    },

    send_listing_notifications: {
    type: String,
    enum: ["Yes", "No"],
    default: "No"
    },

    send_request_notifications: {
        type: String,
        enum: ["users_with_listings", "users_with_same_location"],
        default: "users_with_same_location"
    },

    users_to_notify_on_listings: [Object],

    users_to_notify_on_requests: [Object],

    todo_list: [String],

});

module.exports = mongoose.model("admin", adminschema);