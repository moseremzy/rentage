const express = require("express");
const client = require("../models/user.js");
const post = require("../models/post.js");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const MIDDLEWARES = require("../middlewares/middlewares.js");
const { findOne, find } = require("../models/user.js");
const { MulterError } = require("multer");
const fs = require("fs");
const { count } = require("console");
const user = require("../models/user.js");
const { param } = require("../routes/routes.js");
const axios = require("axios")
const { v4: uuidv4 } = require('uuid');

let APIKEY = 'Bearer sk_test_5262962c188e033e98b5d11580653b677b37e387'

 

module.exports = class API {
    
    //POST REQUESTS

    // Register User And Send Confirmation Mail
      static async register (req, res) {

        const data = req.body;
      
        data.password = await bcrypt.hash(data.password, 12); //encrypt user password

        let referral_code = data.referral_code || "" //referral code of the person that invited this user

        data.confirmationCode = `${referral_code}_${uuidv4()}`; //create confirmation code for user, his referral code his attached to it

        data.new_referral_code = uniqid()  //generate referral code for the new user        
        
        try {
          
          const user = await client.findOne({email: data.email});
      
        if (user) {
         
          res.json({message: "Email Already Exists"})
      
        } else {
          
          await client.create(data);

          MIDDLEWARES.SendConfirmationMail(req, res, data.email, data.confirmationCode, data.firstname)

          //find the referral using his referral code and and push this user inside his referres array

          const referral = await client.findOne({new_referral_code: referral_code});

          if (referral) {

            referral.referres.push(data.email)

            await referral.save()
            
          } 

        }

       } catch (err) {
          
          res.json({message: "Error Creating Account, Try again.."})
        
        }
    }


    // Resend Confirmation Email
    static async ResendConfirmationMail (req, res) {
 
      const confirmationCode = req.body.confirmationCode;
      
      try {

        const user = await client.findOne({confirmationCode: confirmationCode});
        
        if (user) {
         
          MIDDLEWARES.SendConfirmationMail(req, res, user.email, user.confirmationCode, user.firstname)

        }  

      } catch (err) {
        
        res.json({message: "There was an error..."})

      } 

    }


    //Login User
  static async login (req, res) {
  
    const date = new Date();
  
    const data = req.body;
  
    try {
      
      const user = await client.findOne({email: data.email});
  
    if (!user) {
     
     res.json({message: "Invalid Email"})
  
    } 
  
    const isMatch = await bcrypt.compare(data.password, user.password);
  
    if (isMatch && user.status === "Pending") {
      
      res.json({message: "Details correct, But Account Unverified"})
  
    } 
  
    else if (isMatch && user.status === "Active") {
  
      date.setMonth(date.getMonth() + 5) //Session expires in 5 months
  
      req.session.cookie.expires = date;
  
      req.session.email = user.email

      await user.save()
  
      res.json({message: "Logged in Succesfully", user: user})
  
    }
  
    else {
  
     res.json({message: "Incorrect Password"})
  
   }
  
  } catch (err) {
      
      res.json({message: "The was an error..."})
    
    }
  
  }

  //submit listing
  static async submit_listing (req, res) {

    const data = req.body;

    data.id = uniqid();

    data.dateAdded = MIDDLEWARES.date(); //create date for listing
    
    //data.price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.price); //format price with naira icon
  
    try {

      if (req.session.email) { 
    
      await post.create(data)

      const user = await client.findOne({email: req.session.email});

      user.listings.unshift(data.id);

      await user.save();
  
      res.json({message: data.id})
  
    }
  
    else {
  
     res.json({message: "Session expired"})
  
   }
  
  } catch (err) {
      
      res.json({message: err.message})
    
  } 

  }


  //submit pictures
  static async submit_pictures (req, res) {

  const listing_id = req.body.listing_id //Gets the post/listing id
  
  const uploads = req.files || [];

  try {

  const listing = await post.findOne({id: listing_id})

  if (listing) {
    
  let pictures = listing.pictures;

  uploads.forEach((item, index) => {
    pictures.push(item.filename)
  });

  await listing.save();

  res.json({message: pictures})
  
  }

  } catch (err) {
      
      res.json({message: MulterError})

  } 

  }

//add and remove property from favorites
 static async add_to_favorites (req, res) {

  const listing_id = req.body.listing_id

  if (req.session.email) { //if user is logged in

    const user = await client.findOne({email: req.session.email})
    
    if (user.favorites.includes(listing_id)) { //if the property they favorites already

     user.favorites = user.favorites.filter( function (id) { //remove am
         
      return id != listing_id

    })

    await user.save()

    res.json({message: "You have this property saved already"}) 

    } else { //if he no dey, add am
    
    user.favorites.push(listing_id) 

    await user.save() 

    res.json({message: "property saved"})

    }

  } else { //if user is not logged in

    res.json({message: "login to save property"}) 

  }


 }

   static async filter_property (req, res) {

    const page = req.query.page

      const state = req.query.state

      const type = req.query.type

      const search_data = req.params.id 

      console.log(search_data)

      const bedrooms = req.query.bedrooms === "Bedrooms(No limit)" ? "Bedrooms(No limit)": Number(req.query.bedrooms)  //this line converts price to number

      let prices = []

      const price = req.query.price === "Price Range(No limit)" ? "Price Range(No limit)": req.query.price 

      function DerivePriceValue(price) { //Derive price value, from the original string when come

        price.split(" - ").forEach( (price) => {

        prices.push(Number(price.slice(1, price.length).split(",").join("")))

       })
        
      }

      let listings;

  try {

      const email = req.session.email 

      const user = await client.findOne({email: email}) || "" //fetch the user, just incase he get session. because i need to fetch the user favorites also

      if (state === "Choose State" && type === "Home Type" && price === "Price Range(No limit)" && bedrooms === "Bedrooms(No limit)") { //if state, type, price and bedroom dey equal to this
        
       listings = await post.find({ $and: [{status: "Published"}, {category: "For Rent"}] })  //fetch every property when dey published and also dey for rent

      } else if (state === "Choose State" || type === "Home Type" || price === "Price Range(No limit)" || bedrooms === "Bedrooms(No limit)") { //if state or type dey equal to this

        let all = await post.find({status: "Published", category: "For Rent"})

        let arr = [state, type, price, bedrooms]

        let result = arr.filter( (item) => {

          return item === "Choose State" || item === "Home Type" || item === "Price Range(No limit)" || item === "Bedrooms(No limit)"

        })

        switch (result.length) {

          case 3:

            if (result.includes("Choose State") === false) {

              listings = all.filter((listing) => {
      
                return listing.state === state
      
              })
            
          } else if (result.includes("Home Type") === false) {
  
            listings = all.filter((listing) => {
    
              return listing.type === type
    
            })
          
        } else if (result.includes("Price Range(No limit)") === false) {
  
          listings = all.filter((listing) => {
  
              DerivePriceValue(price)
  
              return (listing.price >= prices[0] && listing.price <= prices[1]) 
  
          })
        
      } else if (result.includes("Bedrooms(No limit)") === false) {
  
        listings = all.filter((listing) => {
  
            return  listing.bedroom === bedrooms 
  
        })
      
      } 
            
      break;
        
      case 2:

      if (result.includes("Choose State") === false && result.includes("Home Type") === false) {

        listings = all.filter((listing) => {
  
          return listing.state === state && listing.type === type
  
        })
        
       } else if (result.includes("Choose State") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.state === state &&  (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
      
      } else if (result.includes("Choose State") === false &&  result.includes("Bedrooms(No limit)") === false) {

       listings = all.filter((listing) => {

         return listing.state === state && listing.bedroom === bedrooms 

      })
    
        } else if (result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })

      } else if (result.includes("Home Type") === false && result.includes("Bedrooms(No limit)") === false) {

      listings = all.filter((listing) => {

        return listing.type === type && listing.bedroom === bedrooms

      })

      } else if (result.includes("Price Range(No limit)") === false && result.includes("Bedrooms(No limit)") === false) {

      listings = all.filter((listing) => {

        DerivePriceValue(price)

        return (listing.price >= prices[0] && listing.price <= prices[1]) && listing.bedroom === bedrooms

      })

      }
      
      break;

      case 1: 

      if (result.includes("Choose State") === false && result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.state === state && listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
        
      } else if (result.includes("Choose State") === false && result.includes("Home Type") === false && result.includes("Bedrooms(No limit)") === false) {

        listings = all.filter((listing) => {

          return listing.state === state && listing.type === type && listing.bedroom === bedrooms 

        })

      } else if (result.includes("Bedrooms(No limit)") === false && result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.bedroom === bedrooms && listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
        
      } else if (result.includes("Choose State") === false && result.includes("Price Range(No limit)") === false && result.includes("Bedrooms(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.state === state && (listing.price >= prices[0] && listing.price <= prices[1]) && listing.bedroom === bedrooms 

        })

      }

      break;

      }

      } else { //if user actually select state, type, price and bedrooms

        DerivePriceValue(price)
        
        listings = await post.find({ $and: [{state: state, status: "Published", category: "For Rent"}, {type: type, status: "Published", category: "For Rent"}, {price: {$gte: prices[0], $lte: prices[1]}, status: "Published", category: "For Rent"}, {bedroom: bedrooms, status: "Published", category: "For Rent"} ] }) //fetch properties based on the state and type. along with the basic requirements (Published and For rent)

      }       

      //DEVIDE LISTINGS INTO PAGES
      const limit = 2;

      let total_pages = Math.ceil(listings.length / limit)  //count the number of pages

      if (total_pages === 0) { //if total pages na 0 add 1 join, make he no spoil your loop

      total_pages = total_pages + 1;

      }  

      if (MIDDLEWARES.validate_page_number(page, total_pages)) { //if page number is valid

      const startIndex = (page - 1) * limit;

      const endIndex = page * limit

      const paginatedListings =  listings.slice(startIndex, endIndex);

      res.json({paginatedListings: paginatedListings, all_listings: listings, favorites: user.favorites || [],  total_pages: total_pages});

      } else {

      res.json({message: "Bad request"});

      } 

   } catch (err) {
  
     res.json({message: "There was an error..."})

   }

   }

   static async submit_payment (req, res) {

      const {email, amount, quantity, maximum_listings} = req.body

      const https = require('https')

      const params = JSON.stringify({
      "email": email,
      "amount": amount,
      "callback_url": `http://localhost:8080/dashboard/payment-confirmation?email=${email}&amount=${amount}&quantity=${quantity}&maximum_listings=${maximum_listings}`,
      })

      const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
         Authorization: APIKEY,
        'Content-Type': 'application/json',
        'email': 'agbaojemoses'
      }
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

       res.send("There was an error") //if there was an error
      
    })

      reqpaystack.write(params)
      reqpaystack.end()
        
  }

  //verify payment 
   static async verify_payment (req, res) {

    let message

    const {reference, email, quantity, maximum_listings, amount} = req.body;

    let date = new Date()
    
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    let formatted_date = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    /* first of all, check if this user has used this reference before */

    const user = await client.findOne({email: email})

    let references = user.payments_history.filter( (history) => {

      return history.reference === reference //loop throgh the user history if current reference match any existing reference

    })

    if (references.length == 0) { //if he no match any, go ahead and verify the current reference

      await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,    {

        headers: {
           Authorization: APIKEY,
           "content-type": "application/json",
           "cache-control": "no-cache",
         },
    
        }).then((response)=>{ 
     
         if (response.data.status == true) { //if payment was succesful
          
          user.easycoins += quantity //add the easycoin when user buy to he balance

          user.payments_history.push({ //add the transaction to payment history
             reference: reference,
             date: formatted_date,
             method: response.data.data.channel,
             quantity: quantity,
             amount: amount,
             max_listings: maximum_listings,
             status: response.data.data.status
          })           
          
          message = "payment successful" //if payment is succesful
         
         } else { //if payment failed, maybe due to insufficient funds

          user.payments_history.push({ //add the transaction to payment history
            reference: reference,
            date: formatted_date,
            method: response.data.data.channel || '',
            quantity: quantity,
            amount: amount,
            max_listings: maximum_listings,
            status: "payment failed"
         })    

         message = "payment failed" ////if payment failed, maybe due to insufficient funds

         }

        }).catch((error)=>{
     
         message = "payment failed" //if na wrong reference user go verify
       
        });

        await user.save()

    } else { //if that reference they already

        message = "reference exists already" //if reference dy verified already and dy database

    }

       res.json({message: message, info: req.body, user: user})

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

            user.createdAt = null

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


  //Get Request to public pages
  static async loggedIn (req, res) {
  
    try {
      
     if (req.session.email) {

       const user = await client.findOne({email: req.session.email}) || {logincounter: 0}

       res.json({message: true, user: user})

     } else {

       res.json({message: false, user: {logincounter: 0}})

     }
  
  } catch (err) {
      
      res.json({message: "The was an error..."})
    
    }
}


  //Get pictures page
static async get_pictures_page (req, res) {

    const id = req.params.id //listing id
  
    try {
      
      const user = await client.findOne({email: req.session.email});

      const post_id = user.listings.find( (value, index, array) => {
             return value === id;
      })

      const listing = await post.findOne({id: post_id, status: "Unpublished"});
       
      if (listing) {
        
      res.json({message: listing});

      } else {

        res.json({message: "Bad request"});

      }
  
  } catch (err) {
      
      res.json({message: "There was an error..."})
    
    }

  }


  //Get user
static async fetch_user (req, res) {

  try {

    if (req.session.email) {
    
    const user = await client.findOne({email: req.session.email});
     
    if (user) {
      
    res.json({message: user});

    } else {

    res.json({message: "Bad request"});

    } 

  } else {

    res.json({message: "Bad request"});

  }

} catch (err) {
    
    res.json({message: "There was an error..."})
  
  }

}

 
//get manage listings page
   static async get_managelisting_page (req, res) {

    let paginated_listings = [];

    let all_listings = [];

    let counter = 0;

    let counter2 = 0;

    let category = req.query.category.split(" ")[0]

    try {
    
    const user = await client.findOne({email: req.session.email});

    if (user) {

    const listingsId = user.listings //its an array

    while (counter2 < listingsId.length) { //fetch all the listings for statistics and anychart purpose
      
      let listing = await post.findOne({id: listingsId[counter2]})
      
      if (listing) {

        all_listings.push(listing)

        counter2++;

      } else {

        counter2++;

      }

    }

    if (category !== "All") { //if the category no be All, fetch using the category

      while (counter < listingsId.length) {
      
        let listing = await post.findOne({id: listingsId[counter], status: category})
        
        if (listing) {
  
          paginated_listings.push(listing)
  
          counter++;
  
        } else {
  
          counter++;
  
        }
  
      }
  
    } else { //or else just fetch everything
 
      while (counter < listingsId.length) {
      
        let listing = await post.findOne({id: listingsId[counter]})
        
        if (listing) {
  
          paginated_listings.push(listing)
  
          counter++;
  
        } else {
  
          counter++;
  
        }
  
      }
  
    }
    
 //DEVIDE LISTINGS INTO PAGES
  const limit = 5;

  const page = req.query.page

  let total_pages = Math.ceil(paginated_listings.length / limit)  //count the number of pages

  if (total_pages === 0) { //if total pages na 0 add 1 join, make he no spoil your loop

    total_pages = total_pages + 1;

  }  

 if (MIDDLEWARES.validate_page_number(page, total_pages)) { //if page number is valid

  const startIndex = (page - 1) * limit;

  const endIndex = page * limit

  const paginatedListings =  paginated_listings.slice(startIndex, endIndex);

  res.json({paginatedListings: paginatedListings, all_listings: all_listings, total_pages: total_pages});

 } else {

  res.json({message: "Bad request"});

 }

 } else {

  res.json({message: "Bad request"});

    }
    
} catch (err) {
    
    res.json({message: "There was an error..."})
  
  }

}


//get saved properties page
static async get_savedproperties_page (req, res) {

  let counter = 0

  let paginated_listings = []

  try {
  
  const user = await client.findOne({email: req.session.email});

  if (user) {

    const propertiesId = user.favorites //its an array

    while (counter < propertiesId.length) { //fetch all the listings for statistics and anychart purpose
      
      let property = await post.findOne({id: propertiesId[counter]})
      
      if (property) {

       paginated_listings.push(property)

        counter++;

      } else {

        counter++;

      }
     
    }

    //DEVIDE LISTINGS INTO PAGES
    const limit = 2;

    const page = req.query.page

    let total_pages = Math.ceil(paginated_listings.length / limit)  //count the number of pages

    if (total_pages === 0) { //if total pages na 0 add 1 join, make he no spoil your loop

    total_pages = total_pages + 1;

    }  

    if (MIDDLEWARES.validate_page_number(page, total_pages)) { //if page number is valid

    const startIndex = (page - 1) * limit;

    const endIndex = page * limit

    const paginatedListings = paginated_listings.slice(startIndex, endIndex);

    res.json({paginatedListings: paginatedListings, total_pages: total_pages});

    } else {

    res.json({message: "Bad request"});

    }

    } else {

    res.json({message: "Bad request"});

    }

    } catch (err) {

    res.json({message: "There was an error..."})

    }

    }


//Fetch properties for rent
 static async properties (req, res) {

     let listings = []

     const search_data = req.query.search_data.toLowerCase().trim().replaceAll(",", "").replaceAll(".", "")

     const page = req.query.page
 
     const category = req.params.category

     const type = req.query.type

     const bedrooms = req.query.bedrooms === "Bedrooms(No limit)" ? "Bedrooms(No limit)": Number(req.query.bedrooms)  //this line converts price to number

      let prices = []

      const price = req.query.price === "Price Range(No limit)" ? "Price Range(No limit)": req.query.price 

      function DerivePriceValue(price) { //Derive price value, from the original string when come

        price.split(" - ").forEach( (price) => {

        prices.push(Number(price.slice(1, price.length).split(",").join("")))

       })
        
      }

      let search_data_length = search_data.length

      try {

          let all = await post.find({status: "Published"}) //fetch all the properties when pass they published
    
          search_data === "" ? listings = all : all.forEach((listing) => {  //if nothing they search data, fetch everything
    
          let convert_state = listing.state.toLowerCase().slice(0, (search_data_length)) //convert state to the same exact length of search data, so you can compare.
    
          let convert_town = listing.town.toLowerCase().slice(0, (search_data_length)) //convert town to the same exact length of search data, so you can compare.
    
          let convert_location = listing.location.toLowerCase().slice(0, (search_data_length)) //convert location to the same exact length of search data, so you can compare.
     
          if (convert_state === search_data || convert_town === search_data || convert_location === search_data) { //if check state, town, location of there is a match for search data
    
            listings.includes(listing) ? null : listings.push(listing) //if property already exists on the array skip it
          
          }
    
        })
    
        if (listings.length === 0) { //if that first search return nothing, try this. this one carries each search word, and checks if its a state, town or exists in the address(location)
    
          let devide_search_data = search_data.split(" ");
          
          devide_search_data.forEach( (str) => {
    
          all.forEach( (listing) => {
    
            if (str === listing.state.toLowerCase() || str === listing.town.toLowerCase() || listing.location.toLowerCase().includes(str)) { //checks if its a state, town or exists in the address(location)
    
              listings.includes(listing) ? null : listings.push(listing) //if property already exists on the array skip it
            
            }
    
          })
    
          })
    
        }
      
      const email = req.session.email 

      const user = await client.findOne({email: email}) || "" //fetch the user, just incase he get session. because i need to fetch the user favorites also

      if (category === "Category" && type === "Home Type" && price === "Price Range(No limit)" && bedrooms === "Bedrooms(No limit)") { //if state, type, price and bedroom dey equal to this, na be say user no select any filter, just give them all original listings based on their search data
        
       listings = listings    

      } else if (category === "Category" || type === "Home Type" || price === "Price Range(No limit)" || bedrooms === "Bedrooms(No limit)") { //if state or type dey equal to this

        let all = listings

        let arr = [category, type, price, bedrooms]

        let result = arr.filter( (item) => {

          return item === "Category" || item === "Home Type" || item === "Price Range(No limit)" || item === "Bedrooms(No limit)"

        })

        switch (result.length) {

          case 3:

            if (result.includes("Category") === false) {

              listings = all.filter((listing) => {
      
                return listing.category === category
      
              })
            
          } else if (result.includes("Home Type") === false) {
  
            listings = all.filter((listing) => {
    
              return listing.type === type
    
            })
          
        } else if (result.includes("Price Range(No limit)") === false) {
  
          listings = all.filter((listing) => {
  
              DerivePriceValue(price)
  
              return (listing.price >= prices[0] && listing.price <= prices[1]) 
  
          })
        
      } else if (result.includes("Bedrooms(No limit)") === false) {
  
        listings = all.filter((listing) => {
  
            return  listing.bedroom === bedrooms 
  
        })
      
      } 
            
      break;
        
      case 2:

      if (result.includes("Category") === false && result.includes("Home Type") === false) {

        listings = all.filter((listing) => {
  
          return listing.category === category && listing.type === type
  
        })
        
       } else if (result.includes("Category") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.category === category &&  (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
      
      } else if (result.includes("Category") === false &&  result.includes("Bedrooms(No limit)") === false) {

       listings = all.filter((listing) => {

         return listing.category === category && listing.bedroom === bedrooms 

      })
    
        } else if (result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })

      } else if (result.includes("Home Type") === false && result.includes("Bedrooms(No limit)") === false) {

      listings = all.filter((listing) => {

        return listing.type === type && listing.bedroom === bedrooms

      })

      } else if (result.includes("Price Range(No limit)") === false && result.includes("Bedrooms(No limit)") === false) {

      listings = all.filter((listing) => {

        DerivePriceValue(price)

        return (listing.price >= prices[0] && listing.price <= prices[1]) && listing.bedroom === bedrooms

      })

      }
      
      break;

      case 1: 

      if (result.includes("Category") === false && result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.category === category && listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
        
      } else if (result.includes("Category") === false && result.includes("Home Type") === false && result.includes("Bedrooms(No limit)") === false) {

        listings = all.filter((listing) => {

          return listing.category === category && listing.type === type && listing.bedroom === bedrooms 

        })

      } else if (result.includes("Bedrooms(No limit)") === false && result.includes("Home Type") === false && result.includes("Price Range(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.bedroom === bedrooms && listing.type === type && (listing.price >= prices[0] && listing.price <= prices[1]) 

        })
        
      } else if (result.includes("Category") === false && result.includes("Price Range(No limit)") === false && result.includes("Bedrooms(No limit)") === false) {

        listings = all.filter((listing) => {

          DerivePriceValue(price)

          return listing.category === category && (listing.price >= prices[0] && listing.price <= prices[1]) && listing.bedroom === bedrooms 

        })

      }

      break;

      }

      } else { //if user actually select state, type, price and bedrooms

        DerivePriceValue(price)
        
        listings = await post.find({ $and: [{category: category, status: "Published"}, {type: type, status: "Published", category: category}, {price: {$gte: prices[0], $lte: prices[1]}, status: "Published", category: category}, {bedroom: bedrooms, status: "Published", category: category} ] }) //fetch properties based on the state and type. along with the basic requirements (Published and For rent)

      }       

      //DEVIDE LISTINGS INTO PAGES
      const limit = 2;

      let total_pages = Math.ceil(listings.length / limit)  //count the number of pages

      if (total_pages === 0) { //if total pages na 0 add 1 join, make he no spoil your loop

      total_pages = total_pages + 1;

      }  

      if (MIDDLEWARES.validate_page_number(page, total_pages)) { //if page number is valid

      const startIndex = (page - 1) * limit;

      const endIndex = page * limit

      const paginatedListings =  listings.slice(startIndex, endIndex);

      res.json({paginatedListings: paginatedListings, all_listings: listings, favorites: user.favorites || [],  total_pages: total_pages});

      } else {

      res.json({message: "Bad request"});

      } 

   } catch (err) {
  
     res.json({message: "There was an error..."})

   }

}


//fetch home recommendations for users
static async fetch_home_recommendations (req, res) {

  const {longitude, latitude} = req.body

  let listings = []

  try {

      const result = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.GEOLOCATION_API_KEY}`)

      let data_array = result.data.features

      let all = await post.find({status: "Published"}) //fetch all the properties when pass they published

      const email = req.session.email 

      const user = await client.findOne({email: email}) || "" //fetch the user, just incase he get session. because i need to fetch the user favorites also

      data_array.forEach( (data) => {

      const search_data = data.place_name.toLowerCase().trim().replaceAll(",", "").replaceAll(".", "")

      let search_data_length = search_data.length

      search_data === "" ? listings = all : all.forEach((listing) => {  //if nothing they search data, fetch everything

      let convert_state = listing.state.toLowerCase().slice(0, (search_data_length)) //convert state to the same exact length of search data, so you can compare.

      let convert_town = listing.town.toLowerCase().slice(0, (search_data_length)) //convert town to the same exact length of search data, so you can compare.

      let convert_location = listing.location.toLowerCase().slice(0, (search_data_length)) //convert location to the same exact length of search data, so you can compare.

      if (convert_state === search_data || convert_town === search_data || convert_location === search_data) { //if check state, town, location of there is a match for search data
    
            listings.includes(listing) ? null : listings.push(listing) //if property already exists on the array skip it
          
          }
    
        })
    
      if (listings.length === 0) { //if that first search return nothing, try this. this one carries each search word, and checks if its a state, town or exists in the address(location)
  
        let devide_search_data = search_data.split(" ");
        
        devide_search_data.forEach( (str) => {
  
        all.forEach( (listing) => {
  
          if (str === listing.state.toLowerCase() || str === listing.town.toLowerCase() || listing.location.toLowerCase().includes(str)) { //checks if its a state, town or exists in the address(location)
  
            listings.includes(listing) ? null : listings.push(listing) //if property already exists on the array skip it
          
          }
    
        })
    
          })
      }

    })

  res.json({listings: listings, favorites: user.favorites || []})
    
  } catch (error) {

  res.json({listings: [], favorites: []}) // even though error occur just send an empty array to client. so that he nor go spoil the frontend 
    
  }

 }


//Used to update user category for listings
static async filter (req, res) {

  const category = req.body.parameter; //this will return All, Pending, Published or Unpublished

  try {

  if (req.session.email) {

  const user = await client.findOne({email: req.session.email}); //get the user account

  user.settings.filterListings = category //new category value

  await user.save()

 }  else { //if no session

   res.json({message: "Bad request"});

 }
 
} catch (err) {
 
 res.json({message: "There was an error..."})

}

}


//view listing
static async view_listing (req, res) {

    let listing_id = req.params.id; //Id of the listing 
  
    let counter = 0;
  
    try {
    
        const listing = await post.findOne({id: listing_id}) //find the listing with the id
        
        if (listing.status === "Published") { //check if the listing dey published

          let users = await client.find({}) //Fetch all users
     
          while (counter < users.length) { //loop through them
               
          let userListingsArray =  users[counter].listings //User Listings id array
       
          let listing_array_id = userListingsArray.find( (id) => { //Check if the listing id dey inside the user listings 
       
          return id === listing_id
       
          })
       
          if (listing_array_id) { //if he dey, return that user and stop the loop
    
           res.json({listing:listing, user: users[counter]})
    
           break;
            
          } else { //otherwise keep going until you reach the end
       
           counter++;
       
          }
              
        }
     
     } else {

       res.json({message: "Bad request"}) //if the listing status no be published

     }
  
    } catch (error) {
    
       res.json({message:  "something went wrong"})
      
    }
    
  }


  //edit listing
static async edit_listing (req, res) {
  
  const id = req.params.id //listing id
  
  try {
    
    const user = await client.findOne({email: req.session.email}); //get the user

    const post_id = user.listings.find( (value, index, array) => { //check the users listing ids if the current id they among 
           return value === id;
    })

    const listing = await post.findOne({id: post_id, status: "Unpublished"}); //if the user get the listing id, use the id take fetch the listing
     
    if (listing) { //if the listing dey, return am
      
    res.json({message: listing}); 

    } else {

      res.json({message: "Bad request"});

    }

} catch (err) {
    
    res.json({message: "There was an error..."})
  
  }

}


//fetch all of user's referrals
static async fetch_referrals (req, res) {

   let referrals = []

   let i = 0

   try {

    const user = await client.findOne({email: req.session.email})

    let all_referrals = user.referres

    while (i < all_referrals.length) {

    let referre = await client.findOne({email: all_referrals[i]})

    if (referre) {

    referrals.push({
      email: referre.email,
      full_name: `${referre.firstname} ${referre.lastname}`,
      status: referre.status
    })

   i++
      
   }

   i++

  }

  res.json({referrals: referrals})
    
  } catch (error) {

  res.json({referrals: referrals})
    
  }

}


//ADMIN REQUESTS

//get pending listing
static async get_pendingListings (req, res) {

try {

  const listings = await post.find({status: "Pending"})

  res.json({message: listings})
  
} catch (error) {

  console.log(error.message)
  
}

}


//get single pending listing
static async get_singleListing (req, res) {

  let listing_id = req.params.id; //Id of the listing 

  let counter = 0;

  try {
  
      const listing = await post.findOne({id: listing_id})
   
      let users = await client.find({}) //Fetch all your users
   
      while (counter < users.length) { //loop through them
           
      let userListingsArray =  users[counter].listings //User Listings id array
   
      let listing_array_id = userListingsArray.find( (id) => { //Check if the listing id dey inside the user listings 
   
      return id === listing_id
   
      })
   
      if (listing_array_id) { //if he dey, return that user and stop the loop

       res.json({listing:listing, user: users[counter]})

       break;
        
      } else { //otherwise keep going until you reach the end
   
       counter++;
   
      }

   }

  } catch (error) {
  
     res.json({message:  "something went wrong"})
    
  }

}

//approve or decline listings
static async approve_decline (req, res) {

const data = req.body;

try {

  switch (data.status) { //check status of the property, if it was approved or declined

    case "approved":
      
    let listing = await post.findOne({id: data.listing_id}) //find the listing

    let user = await client.findOne({email: data.user_email}) //find the landlord

    listing.status = "Published" //change listing status to published

    user.easycoins == 0 ? null : user.easycoins -= 1 //if the landlord easycoins na 0 already, no minus from am. else, minus 1 coin

    await listing.save();

    await user.save()

    MIDDLEWARES.approval(req, res, data.listing_id,  data.user_email, data.firstname) //notify user listing was approved with email

    res.json({message: "Listing was approved"})

    break;

    case "declined":

    listing = await post.findOne({id: data.listing_id})

    listing.status = "Unpublished" //change listing status to published
  
    await listing.save();
  
    MIDDLEWARES.declined(req, res, data.listing_id,  data.user_email, data.firstname) //notify user listing was declined with email

    res.json({message: "Listing was declined"})

    break;
  
    default:

    break;

  }
  
} catch (error) {
  
  res.json({message: "something went wrong, try again"})

}

}

//PATCH REQUESTS 

//change listing status
static async change_status (req, res) {

  const listing_id = req.body.listing_id //listing id

  const status = req.body.status //status listing should be changed to this

  try {
    
  const user = await client.findOne({email: req.session.email});

  if (user) {

  let listing = await post.findOne({id: listing_id});
    
  listing.status = status

  await listing.save();

  res.json({message: "Success"})

  } else {

    res.json({message: "Bad request"});
  
  }

 } catch (err) {
    
    res.json({message: "Something went wrong, try again"})
  
  }

}


//update_login_counter
static async update_login_counter (req, res) {

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

}


//update property information 
static async update_property_info (req, res) {

 const data = req.body;

 try {


  if (req.session.email) {
    
    data.price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.price); //format price with naira icon

    const listing = await post.findOneAndUpdate({id: data.id}, data); //find the listing with the id and update

    if (listing) { //if you see the listing, return the id to frontend

    res.json({message: "updated", listing_id: listing.id})
      
    } else {

    res.json({message: "invalid request"}) //if you know see am flag error

    }

  } else { //if user has no session

    res.json({message: "invalid request"})

  }
   
 } catch (error) {
   
  if (error) { //if error occurs

    res.json({message: "something went wrong"})

  }

 }

}



//DELETE REQUESTS

  //delete pictures
  static async delete_pictures (req, res) {
  
  const imgsrc = req.body.imgsrc //picture's src

  const listing_id = req.body.listing_id //listing id

  try {
      
    const user = await client.findOne({email: req.session.email});

    if (user) {
      
    let listing = await post.findOne({id: listing_id});

    //Delete Picture from Database
    let newArray = listing.pictures.filter( (src, index, array) => {  
         return src != imgsrc
    });

    listing.pictures = newArray

    await listing.save();

   //Delete Picture from Folder
    fs.unlinkSync('./property_images/' + imgsrc);

    res.json({message: "Deleted successfully"})

    } else {

    res.json({message: "Bad request"});

   }

   } catch (err) {
    
   res.json({message: "Something went wrong, try again"})
  
   }

 }


  //delete listing individually
  static async delete_listing (req, res) {
  
    const listing_id = req.body.listing_id //listing id
  
    let counter = 0;

    try {

      if (req.session.email) {

        const user = await client.findOne({email: req.session.email})

        const listing = await post.findOneAndDelete({id: listing_id})  //delete listing

        if (listing) { //if delete was successful

        const pictures = listing.pictures //get array containing all the listing pictures
          
        //delete listing pictures from folder
        while (counter < pictures.length) {

          fs.unlinkSync('./property_images/' + pictures[counter]); //Delete profile picture also from folder
          
          counter++;

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
       
    } else { //if no session for user

       res.json({message: "something went wrong, try again later"})

    }
     
      } catch (error) {
      
      res.json({message: "something went wrong, try again later"}) 

    }
  
  }

  //delete listings categorically
  static async delete_listings_categorically (req, res) {

    let counter = 0, counter2 = 0;

    let category = req.body.category.split(" ")[1]

    let listing

    let pictures;

    try {
    
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
    
              fs.unlinkSync('./property_images/' + pictures[counter2]); //Delete listing pictures also from folder
              
              counter2++;
    
            }   

            counter++;

        } else { //if listing not deleted, just go to next post

            counter++;

        }
  
      }

    //delete the listing id from user's listings array
     user.listings = []

     await user.save()
       
     res.json({message: "success"})

    } else { //if category no be "All"

      while (counter < listingsId.length) {
      
         listing = await post.findOneAndDelete({id: listingsId[counter], status: category}) //delete listings

        if (listing) { //if listing deletes succesfully
          
            pictures = listing.pictures //get array containing all the listing pictures
              
            //delete listing pictures from folder
            counter2 = 0;

            while (counter2 < pictures.length) {
    
              fs.unlinkSync('./property_images/' + pictures[counter2]); //Delete listing pictures also from folder
              
              counter2++;
    
            }   

          //delete the listing id from user's listings array
          user.listings =  user.listings.filter( (id)=> {
 
          return id !=  listing.id

          })

         await user.save()

         counter++;

        } else { //if listing not deleted, just go to next post

            counter++;

        }
   
      }
    
    }

  res.json({message: "success"})

 } else {

  res.json({message: "Bad request"});

  }
    
 } catch (err) {
    
    res.json({message: "There was an error..."})
  
  }

}


//Remove all properties from favorites
static async remove_all_properties  (req, res) {

  try {

    if (req.session.email) {

      const user = await client.findOne({email: req.session.email})

      if (user) {

      user.favorites = [] 

      await user.save()

      res.json({message: "Succesful"})
        
      } else {

      res.json({message: "Bad request"})

      }
      
    } else {

     res.json({message: "Bad request"})

    }
    
  } catch (error) {

    res.json({message: "Something went wrong, try again."})
    
  }

}
  
}