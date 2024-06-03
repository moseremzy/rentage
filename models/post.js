const mongoose = require("mongoose");

const postschema = mongoose.Schema({


    title: {
        required: true,
        type: String,
    },

    category: {
        required: true,
        type: String,
    },
    
    type: {
       required: true,
       type: String,
    },
   
    subtype: {
    type: String,
   },

    location: {
       required: true,
       type: String,
   },

    town: {
       required: true,
       type: String,
   },

    state: {
    required: true,
    type: String,
   },

   contact: {
    required: true,
    type: String,
  },

   price: {
    required: true,
    type: Number,
  },
   
   payment: {
    type: String,
  },
   
    bedroom: {
    type: Number,
  },

    classroom: {
      type: Number,
    },

    fuelpump: {
      type: Number,
    },
   
    bathroom: {
    required: true,
    type: Number,
  },

   toilet: {
    required: true,
    type: Number,
  },

   parking: {
    type: Number,
    unique: false,
  },

   total_area: {
    type: Number,
  },

  description: {
    type: String,
  },

  status: {
    type: String,
    enum: ['Unpublished', 'Pending', 'Published'],
    default: 'Unpublished'
},

  coordinates: Object,
  
  id: {
    type: String,
  },
  
  pictures: [String],

  views: {
    type: Number,
    default: 0
  },

  dateAdded: { //the date the listing was created
    type: String,
  },

  dateSubmitted: { //the date the listing was submitted for review
    type: String,
  }

});

module.exports = mongoose.model("post", postschema);