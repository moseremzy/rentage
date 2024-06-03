const mongoose = require("mongoose");

const postschema = mongoose.Schema({

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
   
    bedroom: {
    type: Number,
  },

    classroom: {
      type: Number,
    },

    fuelpump: {
      type: Number,
    },

  description: {
    type: String,
  },

  status: {
    type: String,
    enum: ['Unpublished', 'Pending', 'Published'],
    default: 'Pending'
  },
  
  id: {
    type: String,
  },

  views: {
    type: Number,
    default: 0
  },

  name: {
    required: true,
    type: String
  },

  email: {
    required: true,
    type: String,
  },

  contact: {
    required: true,
    type: String,
  },

  person_type: {
    required: true,
    type: String
  },

  dateAdded: { //the date the request was made
    type: String,
  },

  dateSubmitted: { //the date the request was submitted for review
    type: String,
  }

});

module.exports = mongoose.model("requests", postschema);