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
       default: 10
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

   my_requests: [String],

   favorites: [String],

   settings: {
 
   filterListings: {
        type: String,
        //enum: ["All", "Unpublished listings", "Pending listings", "Published listings"],
        default: "All"
    },

    filterRequests: {
        type: String,
        //enum: ["All", "Unpublished requests", "Pending requests", "Published requests"],
        default: "All"
    }

   },

   new_property_alert: {
        type: String,
        enum: ["Subscribed", "Unsubscribed"],
        default: "Subscribed"
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

  password_reset_token: {
      type: String,
  },

  company_name: {
      type: String,
  },

  company_address: {
    type: String,
  },

  whatsapp: {
      type: String
  },

  website_link: {
      type: String
  },

  about_company: {
      type: String
  },

  company_logo: {
      type: String
  },

  expiresAt: {
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