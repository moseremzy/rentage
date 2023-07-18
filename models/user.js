const mongoose = require("mongoose");

const userschema = mongoose.Schema({

    firstname: {
        required: true,
        type: String
    },

    lastname: {
        required: true,
        type: String
    },

    phone: {
        required: true,
        type: String,
    },
    
    email: {
       required: true,
       type: String,
       unique: true
   },
   
    password: {
    required: true,
    type: String
},

   confirmationCode: {
       type: String,
   },

   status: {
       type: String,
       enum: ['Pending', 'Active'],
       default: 'Pending'
   },

   easycoins: {
       type: Number,
       default: 20
   },

   new_referral_code: {
       type: String,
   },

   referres:[String],
   
   logincounter: {
       type: Number,
       default: 0,
   },

   listings: [String],

   favorites: [String],

   settings: {

   filterListings: {
        type: String,
        enum: ["All", "Unpublished listings", "Pending listings", "Published listings"],
        default: "All"
    },

},

   payments_history: [{ 
        reference: String,
        date: String,
        method: String,
        quantity: String,
        amount: Number,
        max_listings: String,
        status: String
  }],

    createdAt: {
    type: Date,
    default: Date.now,
    expires: '2d', // Account expires in 2days
    index: true
}, 

    acctCreation: {
    type: Date,
    default: Date.now,
    expires: null
}

});

module.exports = mongoose.model("user", userschema);