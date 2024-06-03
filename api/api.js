const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const express = require("express");
const client = require("../models/user.js");
const post = require("../models/post.js");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const MIDDLEWARES = require("../middlewares/middlewares.js");
const { findOne, find } = require("../models/user.js");
const { MulterError } = require("multer");
const fs = require("fs");
const { count, Console } = require("console");
const user = require("../models/user.js");
const admin = require("../models/admin.js")
const requests = require("../models/requests.js")
const { param, use } = require("../routes/routes.js");
const axios = require("axios")
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { request } = require("http");
const PAYSTACK_KEY = process.env.PAYSTACK_API_KEY
const BUCKET_NAME = process.env.BUCKET_NAME
const BUCKET_REGION = process.env.BUCKET_REGION
const BUCKET_SECRETE_KEY = process.env.BUCKET_SECRETE_KEY
const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY

 
const s3 = new S3Client({
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_SECRETE_KEY
  },
    region: BUCKET_REGION
})


module.exports = class API {
  
    //POST REQUESTS
     
    // Register User And Send Confirmation Mail
      static async register (req, res) {

        const data = req.body;

        const administrator = await admin.findOne({pin: "2456"})

        let message;
      
        data.password = await bcrypt.hash(data.password, 12); //encrypt user password

        let referral_code = data.referral_code || "" //referral code of the person that invited this user

        data.confirmationCode = `${referral_code}_${uuidv4()}`; //create confirmation code for user, his referral code his attached to it

        data.new_referral_code = uniqid()  //generate referral code for the new user        
        
        try {
          
          const user = await client.findOne({email: data.email});
      
        if (user) {
         
          message = "Email Already Exists"
      
        } else {
          
          await client.create(data);

          MIDDLEWARES.SendConfirmationMail(req, res, data.email, data.confirmationCode, data.firstname)

          administrator.users_to_notify_on_listings.filter( (user) => { return user.email === data.email}).length > 0 ? null : administrator.users_to_notify_on_listings.push({email: data.email, fullname: data.firstname + ' ' + data.lastname}) //subscriber the user to new listing alerts
          
          administrator.users_to_notify_on_requests.filter( (user) => { return user.email === data.email}).length > 0 ? null : administrator.users_to_notify_on_requests.push({email: data.email, fullname: data.firstname + ' ' + data.lastname}) //subscriber the user to new property request alerts

          await administrator.save()

          //find the referral using his referral code and and push this user inside his referres array

          const referral = await client.findOne({new_referral_code: referral_code});

          if (referral) {

            referral.referres.push(data.email)

            await referral.save()
            
          } 

          message = "Account created succesfully, Mail sent"
        
        }

       } catch (err) {
          
          message = "error occured"
        
        }

        res.json({message: message})

    }


    // Resend Confirmation Email
    static async ResendConfirmationMail (req, res) {
 
      const confirmationCode = req.body.confirmationCode;

      const confirmationEmail = req.body.confirmationEmail //i dey use d email too just incase user wan verify through register or login page. since confirmation code no dey available for those pages
      
      try {

        const user = await client.findOne({ $or: [{confirmationCode: confirmationCode}, {email: confirmationEmail}] });
        
        if (user) {
         
          MIDDLEWARES.SendConfirmationMail(req, res, user.email, user.confirmationCode, user.firstname)

        }  else {

          res.json({message: "Invalid email"})

        }

      } catch (err) {
        
        res.json({message: "error occured"})

      } 

    }


    //Login User
  static async login (req, res) {

    // await client.updateMany({}, {$set: {company_name: "", company_address: "", whatsapp: "", website_link: "", about_company: ""}}, {upsert: false})
  
    const date = new Date();
  
    const data = req.body;

    var user;

    let message;
  
    try {
      
       user = await client.findOne({email: data.email});
  
    if (!user) {
     
      message = "Invalid Email"

    } else {
  
    const isMatch = await bcrypt.compare(data.password, user.password);
  
    if (isMatch && user.status === "Pending") {
      
      message = "Account exist, but unverified"
  
    } 
  
    else if (isMatch && user.status === "Active") {
  
      date.setMonth(date.getMonth() + 5) //Session expires in 5 months
  
      req.session.cookie.expires = date;
  
      req.session.email = user.email

      await user.save()
  
      message = "Logged in Succesfully"
  
    }
  
    else {
  
      message = "Incorrect Password"
  
   }

  }
  
  } catch (err) {
      
    message = "error occured"
    
  }

  res.json({message: message, user: user})
  
  }

  
//handle review page 
static async handle_reviewpage (req, res) {

  const {listing_id} = req.body

  let message;

  try {

    const listing = await post.findOne({id: listing_id, status: "Pending"})

    if (listing) {

    message = "success"

    } else {

    message = "Bad request"

    }
    
  } catch (error) {
    
    message = "error occured"

  }

  res.json({message: message})

}


  //submit listing
  static async submit_listing (req, res) {

    if (req.session.email) {  //if session dey
  
    try {

      const data = req.body;

      data.id = uniqid();

      data.dateAdded = MIDDLEWARES.date(); //create date for listing
    
      await post.create(data)

      const user = await client.findOne({email: req.session.email});

      user.listings.unshift(data.id);

      await user.save();
  
      res.json({listing_id: data.id, message: "success"})
  
    } catch (err) {
      
      res.json({message: "error occured"})

    } 

   } else { //if no session
  
    res.json({message: "no session"})
 
   }

  }


  //submit pictures
  static async submit_pictures (req, res) {

    if (req.session.email) { //if session dey

      try {
    
      let counter = 0;
     
      const listing_id = req.body.listing_id //Gets the post/listing id
    
      const uploads = req.files || [];
      
      const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
    
      const listing = await post.findOne({id: listing_id})
    
      if (listing) {
        
      let pictures = listing.pictures;
    
      while (counter < uploads.length) {
          
         let filename = `${listing.title}-`+ randomImageName()
    
         const params = {
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: uploads[counter].buffer,
          ContentType: uploads[counter].mimetype
        }
    
        const command = new PutObjectCommand(params)
    
        const res = await s3.send(command)
    
        pictures.push(filename)
    
        counter++;
      
       }
    
      await listing.save();
    
      res.json({message: pictures, status: "success"})
      
      }
    
      } catch (err) {
          
      res.json({message: "error occured"})
    
      } 
    
      } else { //if session no dey
    
      res.json({message: "no session"})
    
      }
}
    

  //add and remove property from favorites
 static async add_to_favorites (req, res) {

    if (req.session.email) { //if session dey

    const listing_id = req.body.listing_id

    const user = await client.findOne({email: req.session.email})
    
    if (user.favorites.includes(listing_id)) { //if the property they favorites already

      user.favorites = user.favorites.filter( function (id) { //remove am
         
      return id != listing_id

    })

     await user.save()

    res.json({message: "You have this property saved already"}) 

    } else { //if he no dey, add am
    
    user.favorites.unshift(listing_id) 

    await user.save() 

    res.json({message: "property saved"})

    }

   } else { //if user is not logged in

    res.json({message: "no session"}) 

   }

 }

   
//fetch home recommendations for users
static async fetch_geo_info (req, res) {

  try {

      const {longitude, latitude} = req.body

      const result = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.MAPBOX_GEOLOCATION_API_KEY}`)

      let data_array = result.data.features

      res.json({data: data_array})
        
      } catch (error) {

      res.json({data: []}) // even though error occur just send an empty array to client. so that he nor go spoil the frontend 
        
      }

      }


   //initialize payment
   static async submit_payment (req, res) {

      if (req.session.email) { //if session dey
        
      const {email, amount, quantity, maximum_listings} = req.body

      const https = require('https')

      const params = JSON.stringify({
      "email": email,
      "amount": amount,
      metadata: {
          quantity: quantity,
          max_listing: maximum_listings
      },
      "callback_url": "https://easyrentage.com/dashboard/buy-easycoin", 
      })

      const options = {
      hostname: 'api.paystack.co', //puy o after that c
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
         Authorization: `Bearer ${PAYSTACK_KEY}`,
        'Content-Type': 'application/json',
      },
      }

      const reqpaystack = https.request(options, respaystack => {
     
      let data = ''

      respaystack.on('data', (chunk) => {

        data += chunk

      });

      respaystack.on('end', () => {

        res.send(data); //if the request was succesfulll

      })


      }).on('error', error => {

       res.send("error occured") //if there was an error
      
    })

      reqpaystack.write(params)
      reqpaystack.end()
        
  } else { //if session no dey

    res.json({message: "no session"})

  }

   }


//verify payment using webhook
  static async paystack_webhook (req, res) {
      
    let date = new Date()
    
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    let formatted_date = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    const hash = crypto.createHmac('sha512', PAYSTACK_KEY).update(JSON.stringify(req.body)).digest('hex');
  
//    verify if request is coming from paystack
 
     if (hash == req.headers['x-paystack-signature']) {
    
      const event = req.body
      
      const reference = event.data.reference
         
      const user = await client.findOne({email: event.data.customer.email})
      
      let history = {
            reference: event.data.reference || "-",
            date: formatted_date,
            method: event.data.channel || "-",
            quantity: event.data.metadata.quantity || "-",
            amount: (event.data.amount / 100) || "-",
            max_listings: event.data.metadata.max_listing || "-",
            status: event.data.status || "payment failed"
      }
    
      if (event && event.event === 'charge.success') {
          
        let transaction = user.payments_history.find( (history) => {
              
              return history.reference == reference && history.status != "success"
              
          })
          
        if (transaction) { //if transaction dey history already
            
            user.payments_history.forEach( (history, index) => {
           
            if (history.reference == reference && history.status != "success") {
                
                user.easycoins += Number(event.data.metadata.quantity) //add the easycoin when user buy to he balance
                
                history.status = event.data.status
                
            }
           
       })
            
     } else { //if he no dey
     
      user.easycoins += Number(event.data.metadata.quantity) //add the easycoin when user buy to he balance
      
      user.payments_history.unshift(history)
         
     }
     
   } else { //if charge no be succces
       
      
    let transaction = user.payments_history.find( (history) => {
              
              return history.reference == reference
              
          }) 
          
    if (transaction) { //if transaction dey history already
            
            user.payments_history.forEach( (history, index) => {
           
            if (history.reference == reference) {
                
                history.status = event.data.status || "payment failed"
                
            }
           
       })
            
     } else { //if he no dey
      
      user.payments_history.unshift(history)
         
     }
      
       
   }
   
   await user.save()
 
  }
  
  res.sendStatus(200);

 }   


 //send reset password email to user
 static async send_reset_pass_email (req, res) {

   try {

    let message;

    const user = await client.findOne({email: req.body.email})

    if (user) { //if email exists

    const token = uuidv4()

    user.password_reset_token = token //await bcrypt.hash(token, 12);

    await user.save()

    MIDDLEWARES.send_reset_pass_email(req, res, user.email, token, user.firstname)

    res.json({message: "Mail sent"})
    
    } else { //if email no dey, just still tell dem say i don send am, make dem for rest

    res.json({message: "We cannot find your email"})

    }

   } catch (error) {

    res.json({message: "error occured"})
     
   }

 }


  //reset password
  static async reset_password (req, res) {

    try {

    const password = req.body.password

    const token = req.body.token

    const user = await client.findOne({password_reset_token: token}) //check the user with the token

    if (user) { //if token exist for a user

    user.password = await bcrypt.hash(password, 12); //change user password

    user.password_reset_token = null //delete the token

    await user.save()

    res.json({message: "Password modified"})
      
    } else { //if token no exist

    res.json({message: "Invalid token"})

    }
 
    } catch (error) {
 
     res.json({message: "error occured"})
      
    }
 
  }

  //send contact us email
  static async contact_us (req, res) {

    const {email, firstname, lastname, phone, message} = req.body;

    MIDDLEWARES.contact_us_email(req, res, email, firstname, lastname, phone, message)    

  }

  
  //submit request
  static async submit_request (req, res) {
  
    try {

       const data = req.body;

       const user = await client.findOne({email: req.session.email || data.email}); //check if user get session or e dey database. 

       const request = await requests.findOne({id: data.id, $or: [{status: "Unpublished"}, {status: "Published"}] }) //find the request first if he dey exist

       if (request) { //if the request dey already

        request.status = "Pending"
        request.category = data.category
        request.type = data.type
        request.subtype = data.subtype
        request.town = data.town
        request.state = data.state
        request.price = data.price
        request.contact = data.contact
        request.bedroom = data.bedroom
        request.classroom = data.classroom
        request.fuelpump = data.fuelpump
        request.description = data.description
        request.name = data.name
        request.email = data.email
        request.contact = data.contact
        request.person_type = data.person_type
        request.dateAdded = MIDDLEWARES.date(); 
        await request.save()
        MIDDLEWARES.new_request_alert(req, res, request)//alert admin

       } else { //if na first time

        data.id = uniqid();

        data.dateAdded = MIDDLEWARES.date(); //create date for listing

        await requests.create(data)

        MIDDLEWARES.new_request_alert(req, res, data)//alert admin

        if (user) { //if user dey registered

          user.my_requests.unshift(data.id)
   
          await user.save()
            
          }

       }

    
      res.json({message: "success"})
  
     } catch (err) {

      console.log(err.message)

      res.json({message: err.message})

    } 

  }


   //GET REQUESTS

    // Verify User Email
    static async emailVerification (req, res) {

       const confirmationCode = req.params.id

       let referral_code = confirmationCode.split("_")[0]

       try {
         
          const user = await client.findOne({confirmationCode: confirmationCode});

          if (user && user.status === "Pending") {
          
            user.status = "Active"

            user.expiresAt = null

            await user.save()

            //find he referral and reward am

          const referral = await client.findOne({new_referral_code: referral_code});

          if (referral) {

            referral.easycoins += 5

            await referral.save()
            
          }

          res.json({message: "Email Verification Succesful"})

          } 
          
          else if (user && user.status === "Active") {

           res.json({message: "Email is Already Verified"})

          }
          
          else {

            res.json({message: "Email Verification Failed"})

          }

       } catch (error) {
         
          res.json({message: "There was an error..."})

       }

}


  //Check for session
  static async loggedIn (req, res) {
  
    try {

    //await post.updateMany({category: "For Sell"}, {$set: {category: "For Sale"}}, {upsert: false})
  
     if (req.session.email) {

       const user = await client.findOne({email: req.session.email}) //|| {logincounter: 0}

       const administrator = await admin.findOne({pin: "2456"})
       
       if (user) { 
        
        res.json({message: true, user: user, listing_notification_subscribers: administrator.users_to_notify_on_listings, request_notification_subscribers: administrator.users_to_notify_on_requests})

       } else { //if the user no dey

        req.session.destroy()

        res.json({message: false,  user: {logincounter: 0}})

       }

     } else {

       res.json({message: false, user: {logincounter: 0}})

     }
  
  } catch (err) {
      
      res.json({message: false})
    
    }
}


//fetch all properties
// static async fetch_properties (req, res) {

//   try {

//    const properties = await post.find({})

//    res.json({listings: properties})
    
//   } catch (error) {
    
//    res.json({message: "bad request"})

//   }
   
// }

//Fetch properties
static async properties (req, res) {

  console.log("reah here")

  let listings = [];

  let counter1 = 0;

  let pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const search_data = req.query.search_data.toLowerCase().trim().replaceAll(",", "")

  const page = req.query.page

  const category = req.params.category

  const type = req.query.type

  const bedrooms = req.query.bedrooms === "Bedrooms(No limit)" ? "Bedrooms(No limit)": Number(req.query.bedrooms)  //this line converts bedrooms to number

   const min_price = req.query.min_price === "Min price" ? "Min price": Number(req.query.min_price) 

   const max_price = req.query.max_price === "Max price" ? "Max price": Number(req.query.max_price)
 
   let search_data_length = search_data.length

   try {

       let all = await post.find({status: "Published"}) //fetch all the properties when they published

       let customer = pattern.test(search_data) ? await client.findOne({email: search_data}) : null //check if search data na email address. if he contain na b say user wan see all the properties of another user. so we fetch the user from here keep so we go fit fetch all he listings later. 
 
       search_data === "" ? listings = all.reverse()  //if nothing they search data, just send all the listings wen dey published.
       
       : pattern.test(search_data) ? (async () => { //check if search data na email address. if he contain na b say user wan see all the properties of another user.

       if (customer) { //if the user they.

           customer.listings.forEach( (listing_id) => { //carry he listings id use am fetch the listings from all

           all.forEach( (listing) => {

             listing_id === listing.id ? listings.unshift(listing) : null

           })

         })
         
       }
       
       })()
             
       : all.forEach((listing) => { //if na normal string, searcch for am.
 
       let convert_state = listing.state.toLowerCase().slice(0, (search_data_length)) //convert state to the same exact length of search data, so you can compare.
 
       let convert_town = listing.town.toLowerCase().slice(0, (search_data_length)) //convert town to the same exact length of search data, so you can compare.
 
       let convert_location = listing.location.toLowerCase().slice(0, (search_data_length)) //convert location to the same exact length of search data, so you can compare.
  
       if (convert_state === search_data || convert_town === search_data || convert_location === search_data) { //if check state, town, location of there is a match for search data
 
         listings.includes(listing) ? null : listings.unshift(listing) //if property already exists on the array skip it
       
       }
 
     }) 
 
     if (listings.length === 0) { //if that first search return nothing, try this. this one carries each search word, and checks if its a state, town or exists in the address(location)

       let devide_search_data = search_data.split(" ");
       
       devide_search_data.forEach( (str) => {
 
       all.forEach( (listing) => {
 
         if (str === listing.state.toLowerCase() || str === listing.town.toLowerCase() || listing.location.toLowerCase().includes(str)) { //checks if its a state, town or exists in the address(location)
 
           listings.includes(listing) ? null : listings.unshift(listing) //if property already exists on the array skip it
         
         }
 
       })
 
       })
 
     }

 /* LISTINGS FILTER */
       let temporal_array = []

       let arr = [category, type, min_price, max_price, bedrooms]

       let current_listing, category_result, type_result, min_price_result, max_price_result, bedroom_result;

        while (counter1 < listings.length) {

           current_listing = listings[counter1]

           category_result = arr[0] === "Category" ? true : current_listing.category === arr[0]
           
           type_result = arr[1] === "Property Type" ? true : current_listing.type === arr[1] || current_listing.subtype === arr[1]

           min_price_result = arr[2] === "Min price" ? true : current_listing.price >= arr[2]

           max_price_result = arr[3] === "Max price" ? true : current_listing.price <= arr[3]

           bedroom_result = arr[4] === "Bedrooms(No limit)" ? true : current_listing.bedroom === arr[4]

           if (category_result && type_result && min_price_result && max_price_result && bedroom_result) {

            temporal_array.unshift(current_listing)
              
           } 

           counter1++

        } 

   listings = temporal_array.reverse()

   /* LISTINGS FILTER */
    
   const email = req.session.email 

   const user = await client.findOne({email: email}) || "" //fetch the user, just incase he get session. because i need to fetch the user favorites also

   //DEVIDE LISTINGS INTO PAGES
   const limit = 40;

   let total_pages = Math.ceil(listings.length / limit)  //count the number of pages

   if (total_pages === 0) { //if total pages na 0 add 1 join, make he no spoil your loop

   total_pages = total_pages + 1;

   }  

   if (MIDDLEWARES.validate_page_number(page, total_pages)) { //if page number is valid

   const startIndex = (page - 1) * limit;

   const endIndex = page * limit

   const paginatedListings =  listings.slice(startIndex, endIndex);

   res.json({paginatedListings: paginatedListings, all_listings: listings, favorites: user.favorites || [],  total_pages: total_pages, search_data: search_data});

   } else {

   res.json({message: "Bad request"});

   } 

} catch (err) {

  res.json({message: "error occured"})

  }

}



//fetch all requests
static async fetch_requests (req, res) {

  try {

   const user_requests = await requests.find({})

   res.json({all_requests: user_requests})
    
  } catch (error) {
    
   res.json({message: "bad request"})

  }
   
}



//fetch all users
static async fetch_users (req, res) {

  try {

   const users = await client.find({})

   res.json({users: users})
    
  } catch (error) {
    
   res.json({message: "bad request"})

  }
   
}

 

//logout user
static async logout (req, res) {
  
  try {

    req.session.destroy()

    res.json({message: "logged out"})
    
  } catch (error) {

    res.json({message: "An error occcured"})
    
  }
  
}

//PATCH REQUESTS 

//change listing status (post picture page na he dey)
static async change_status (req, res) {
  
  if (req.session.email) { //if session dey
    
  try {

  const listing_id = req.body.listing_id //listing id

  const status = req.body.status //status listing should be changed to this
    
  const user = await client.findOne({email: req.session.email});

  if (user) {

  let listing = await post.findOne({id: listing_id});
    
  listing.status = status

  listing.dateSubmitted = MIDDLEWARES.date()

  await listing.save();

  MIDDLEWARES.new_listing_alert(req, res, listing) //notify admin

  res.json({message: "Success"})

  } else {

  res.json({message: "Bad request"});
  
  }

 } catch (err) {
    
    res.json({message: err.message})
  
  }

} else { //if session no dey

  res.json({message: "no session"})

}

}


//update_login_counter
static async update_login_counter (req, res) {

  if (req.session.email) { //if session dey
  
  try {
    
  const user = await client.findOne({email: req.session.email});

  if (user) {

  user.logincounter++
   
  await user.save();

  res.json({message: "Success"})

  } else {

    res.json({message: "Bad request"});
  
  }

 } catch (err) {
    
    res.json({message: "Something went wrong, try again"})
  
  }

} else { //if session no dy

   res.json({message: "no session"})

}

}


//update_viewedlisting_counter
static async update_viewedlisting_counter(req, res) {

  let listing_id = req.body.id

  let listing = await post.findOne({id: listing_id})

  if (listing) {

    listing.views++;

    await listing.save()

    res.json({message: "success"})
    
  } else {

    res.json({message: "bad request"})
    
  }

}

//update property information 
static async update_property_info (req, res) {
 
 if (req.session.email) { //if session dey

 try {

    const data = req.body;

    const listing = await post.findOneAndUpdate({id: data.id}, data); //find the listing with the id and update

    if (listing) { //if you see the listing, return the id to frontend

    res.json({message: "updated", listing_id: listing.id})
      
    } else {

    res.json({message: "invalid request"}) //if you know see am flag error

   } 

 } catch (error) {

    res.json({message: "error occured"})

 }

 } else { //if no session

  res.json({message: "no session"})

}

}


//Used to update user category for listings
static async filter (req, res) {

  if (req.session.email) { //if session dey

  try {

  const category = req.body.parameter; //this will return All, Pending, Published or Unpublished

  const page = req.body.page;

  const user = await client.findOne({email: req.session.email}); //get the user account

  page === "properties" ? user.settings.filterListings = category  : user.settings.filterRequests = category
  
  await user.save()   

} catch (err) {
 
 res.json({message: "There was an error..."})

}

} else {

 res.json({message: "no session"})

}
}

//update user information 
  static async update_user_info (req, res) {
 
    if (req.session.email) { //if session dey

    try {

      let filename, user;

      const data = JSON.parse(JSON.stringify(req.body)) //what is coming isnt a real object, i had to convert it to one

      user = await client.findOne({email: data.email}) //get the user first

      const oldfilename = user.company_logo || " "//get the old company_logo filename
      
      data.company_logo = oldfilename

      const upload = req.file //company logo file

      if (upload) { //upload file if only there is a file

        MIDDLEWARES.delete_bucket_pictures(oldfilename) //delete the old company_logo from s3 bucket

        const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

        filename = randomImageName() + '_company_logo' //create new company_logo filename

        data.company_logo = filename //add filename to the info to be updated

        const params = {
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: upload.buffer,
          ContentType: upload.mimetype
        }
    
        const command = new PutObjectCommand(params)
    
        const response = await s3.send(command)
        
      }

      await client.findOneAndUpdate({email: data.email}, data); //find the user with his email and update

      res.json({message: "Updated", company_logo: filename})

    } catch (error) {

      console.log(error.message)

      res.json({message: "error occured"})
      
    }

  } else { //if session no dey

    res.json({message: "no session"})

  }

}

  //update user password 
  static async update_password (req, res) {

    if (req.session.email) { //if session dey

    try {

      const data = req.body

      const user = await client.findOne({email: req.session.email}) //find the user first

      const isMatch = await bcrypt.compare(data.old_password, user.password); //compare the current pass, with the old one if he match 
  
      if (isMatch) { //if he match
        
      user.password = await bcrypt.hash(data.new_password, 12); //encrypt the new password and use am replace old one
 
      await user.save()

      res.json({message: "Updated"})
      
      }  else {

      res.json({message: "Old password incorrect"})

      }

    } catch (error) {

      res.json({message: "error occured"})
      
    }

  } else { //if session no dey

    res.json({message: "no session"})

  }

}

 //unscribe user from new property alert
 static async subscribe_unsubscribe_user_for_listings (req, res) {

   const {fullname, email, category} = req.body;

   let message;

   const administrator = await admin.findOne({pin: "2456"}) //fetch adimin;

   let new_subscriber = {email: email.toLowerCase(), fullname: fullname}

   switch (category) {
    
    case "Unsubscribe":

    administrator.users_to_notify_on_listings = administrator.users_to_notify_on_listings.filter((subscribers) => {
              
        return subscribers.email !== email.toLowerCase()

    })

    message = "Unsubscribed successfully"

    break;

    case "Subscribe":

    let contains = administrator.users_to_notify_on_listings.filter( (subscribers) => {

        return subscribers.email === email.toLowerCase()
    
    }) 

    if (contains.length <= 0) {

      administrator.users_to_notify_on_listings.push(new_subscriber)
      
    }

    message = "Subscribed successfully"

    break;
  
  }

   await administrator.save()
   
   res.json({message: message})

 }


 //unscribe user from new property request alert
 static async subscribe_unsubscribe_user_for_requests (req, res) {

  const {fullname, email, category} = req.body;

  let message;

  const administrator = await admin.findOne({pin: "2456"}) //fetch adimin;

  let new_subscriber = {email: email.toLowerCase(), fullname: fullname}

  switch (category) {
   
   case "Unsubscribe":

   administrator.users_to_notify_on_requests = administrator.users_to_notify_on_requests.filter((subscribers) => {
             
       return subscribers.email !== email.toLowerCase()

   })

   message = "Unsubscribed successfully"

   break;

   case "Subscribe":

   let contains = administrator.users_to_notify_on_requests.filter( (subscribers) => {

       return subscribers.email === email.toLowerCase()
   
   }) 

   if (contains.length <= 0) {

     administrator.users_to_notify_on_requests.push(new_subscriber)
     
   }

   message = "Subscribed successfully"

   break;
 
 }

  await administrator.save()
  
  res.json({message: message})

}

 

//DELETE REQUESTS

  //delete pictures
  static async delete_pictures (req, res) {

    if (req.session.email) { //if sessionn dey

      try {
    
        const imgsrc = req.body.imgsrc //picture's src
    
        const listing_id = req.body.listing_id //listing id
          
        const user = await client.findOne({email: req.session.email});
    
        if (user) {
          
        let listing = await post.findOne({id: listing_id});
        
        //Delete Pictures from S3 bucket
        MIDDLEWARES.delete_bucket_pictures(imgsrc)
        
    
        //Delete Picture from Database
        let newArray = listing.pictures.filter( (src, index, array) => {  
             return src != imgsrc
        });
    
        listing.pictures = newArray
    
        await listing.save();
      
        res.json({message: "Deleted successfully"})
    
        } else {
    
        res.json({message: "Bad request"});
    
        }
    
       } catch (err) {
        
       res.json({message: "Something went wrong, try again"})
      
       }
    
     } else { //if no session
    
       res.json({message: "no session"})
    
     }

}


  //delete listing individually
  static async delete_listing (req, res) {

    if (req.session.email) { //if session dey

      try {
       
         const listing_id = req.body.listing_id //listing id
    
         let counter = 0;
  
          const user = await client.findOne({email: req.session.email})
  
          const listing = await post.findOneAndDelete({id: listing_id})  //delete listing
  
          if (listing) { //if delete was successful
  
          const pictures = listing.pictures //get array containing all the listing pictures
            
         /*Delete listing pictures from S3 bucket*/
         while (counter < pictures.length) {
         
         //Delete Pictures from S3 bucket
         MIDDLEWARES.delete_bucket_pictures(pictures[counter])
         
         counter++
  
        } 
  
        //delete the listing id from user's listings array
        user.listings =  user.listings.filter( (id)=> {
  
            return id !=  listing_id
  
         })
  
         await user.save()
  
         res.json({message: "delete succesful"})
  
        } else { //if listing failed to delete
    
          res.json({message: "delete failed"})
  
        }
         
      }  catch (error) {
        
        res.json({message: "something went wrong, try again later"}) 
  
      } 
    
    } else { //if session dey
  
      res.json({message: "no session"})
  
    }

}


  //delete listings categorically
  static async delete_listings_categorically (req, res) {

    if (req.session.email) { //if session dey

    try {

    var message;

    let counter = 0, counter2 = 0;

    let category = req.body.category.split(" ")[1]

    let listing;

    let pictures;
  
    const user = await client.findOne({email: req.session.email});

    if (user) {

    const listingsId = user.listings //its an array

    if (category === "All") { //if the category no be All, fetch using the category
    
      while (counter < listingsId.length) {    
      
         listing = await post.findOneAndDelete({id: listingsId[counter]}) //delete listings

        if (listing) { //if listing deletes succesfully
          
          pictures = listing.pictures //get array containing all the listing pictures
            
          //delete listing pictures from folder
          counter2 = 0;

        while (counter2 < pictures.length) {
        
        //Delete Pictures from S3 bucket
        MIDDLEWARES.delete_bucket_pictures(pictures[counter2])
       
        counter2++;
    
       }   

        counter++;

       } else { //if listing not deleted, just go to next post

          counter++;

        }
  
      }

    //delete the listing id from user's listings array
     user.listings = []

     message = "success"

    } else { //if category no be "All"

      while (counter < listingsId.length) {
      
         listing = await post.findOneAndDelete({id: listingsId[counter], status: category}) //delete listings

        if (listing) { //if listing deletes succesfully
          
            pictures = listing.pictures //get array containing all the listing pictures
              
            //delete listing pictures from folder
            counter2 = 0;

            while (counter2 < pictures.length) {
    
            //Delete Pictures from S3 bucket
            MIDDLEWARES.delete_bucket_pictures(pictures[counter2])
            
            counter2++
    
            }   

          //delete the listing id from user's listings array
          user.listings =  user.listings.filter( (id)=> {
 
          return id !=  listing.id

          })

         counter++;

        } else { //if listing not deleted, just go to next post

            counter++;

        }
   
      }
    
    }

   message = "success"

 } else {

   message = "Bad request"

  }
 
  await user.save()
  
 } catch (err) {
    
     message = "There was an error..."
  
  }

} else { //if session no dey

    message = "no session"

}
    res.json({message: message})
}


//Remove all properties from favorites
static async remove_all_properties  (req, res) {

  if (req.session.email) { //if session dey

  try {

      const user = await client.findOne({email: req.session.email})

      if (user) {

      user.favorites = [] 

      await user.save()

      res.json({message: "Succesful"})
        
      } else {

      res.json({message: "Bad request"})

      }
    
  } catch (error) {

    res.json({message: "Something went wrong, try again."})
    
  }

} else { //if no session

  res.json({message: "no session"})

}

}




//delete user account
static async delete_account (req, res) { 
 
  if (req.session.email) { //if session dey
    
  try {
           
      let counter = 0, counter2 = 0;

      let pictures;

      const user = await client.findOneAndDelete({email: req.session.email}) //delete the user document

      while (counter < user.listings.length) {

      const listing = await post.findOneAndDelete({id: user.listings[counter]}) || {} //delete all the user listings

      pictures = listing.pictures || [] //get array containing all the listing pictures
            
      counter2 = 0;

      while (counter2 < pictures.length) {
          
          //Delete Pictures from S3 bucket
          MIDDLEWARES.delete_bucket_pictures(pictures[counter2])
          
          counter2++

      }

        counter++
        
    }

      await req.session.destroy() //destroy user session

      res.json({message: "Account deleted"})
            
  } catch (error) {

    res.json({message: "Something went wrong, try again"})
    
  }

} else {

  res.json({message: "no session"})

}

}

//delete request individually
static async delete_request (req, res) {

  if (req.session.email) { //if session dey

    try {
     
       const request_id = req.body.request_id //listing id
  
       let counter = 0;

        const user = await client.findOne({email: req.session.email})

        const listing = await requests.findOneAndDelete({id: request_id})  //delete listing

        if (listing) { //if delete was successful

      //delete the listing id from user's listings array
      user.my_requests =  user.my_requests.filter( (id)=> {

          return id !=  request_id

       })

       await user.save()

       res.json({message: "delete succesful"})

      } else { //if request failed to delete
  
        res.json({message: "delete failed"})

      }
       
    }  catch (error) {
      
      res.json({message: "something went wrong, try again later"}) 

    } 
  
  } else { //if session dey

    res.json({message: "no session"})

  }

}


//delete requests categorically
static async delete_requests_categorically (req, res) {

  if (req.session.email) { //if session dey

  try {

  var message;

  let counter = 0, counter2 = 0;

  let category = req.body.category.split(" ")[1]

  let request;

  const user = await client.findOne({email: req.session.email});

  if (user) {

  const request_id = user.my_requests //its an array

  if (category === "All") { //if the category no be All, fetch using the category
  
    while (counter < request_id.length) {    
    
       request = await requests.findOneAndDelete({id: request_id[counter]}) //delete listings

       counter++;

    }

  //delete the listing id from user's listings array
   user.my_requests = []

   message = "success"

  } else { //if category no be "All"

    while (counter < request_id.length) {
    
       request = await requests.findOneAndDelete({id: request_id[counter], status: category}) //delete requests
        
       if (request) {
        
        //delete the listing id from user's listings array
        user.my_requests =  user.my_requests.filter( (id)=> {

          return id !=  request.id
  
          })
  

       }
        
       counter++;      
 
    }
  
  }

 message = "success"

} else {

 message = "Bad request"

}

await user.save()

} catch (err) {
  
   message = "There was an error..."

}

} else { //if session no dey

  message = "no session"

}
  res.json({message: message})
}



}