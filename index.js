require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 8000;
const Uri = process.env.URI
const routes = require("./routes/routes")
const app = express();
const path = require("path")
var timeout = require('connect-timeout')
const axios = require('axios')

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);
//app.use(express.static(path.join(__dirname, "/dist")));
app.use(express.static(path.join(__dirname, "/images")));
app.use(express.static(path.join(__dirname, "/property_images")));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/css")));


//na dis code dey serve the whole vue app. d reason its dis way is cos of view-listing page. i needed to update the meta data of index.html before using it to serve view-lisstings page, i did it incase of listing shares to social media accounts.
// if (process.env.NODE_ENV === 'production') {
    
//     const indexPath  = path.resolve(__dirname, 'dist', 'index.html');
    
//     app.use(express.static(__dirname+"/dist/"))
    
//     app.get("*", (req, res) => {
        
//     if (req.path.includes("view-listing")) {
    
//     fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }
    
//     let listing_id = req.originalUrl.split("/")[2]
    
//     axios.get(`https://easyrentage.com/view-single-listing/${listing_id}`)
  
//     .then(response => {
    
//     let listing = response.data.listing

//     let title = `${listing.bedroom > 0 ? listing.bedroom + ' bedroom ' : ''}` + `${listing.subtype || listing.type} ` + listing.category +': '+ `${listing.location}` + ' ' + `${listing.town},` + ' ' + `${listing.state} state.` + ` - ${(new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(listing.price))} ` + listing.payment
    
//     let description = (listing.description || listing.title).length > 160 ? (listing.description || listing.title).slice(0,160) + '...' : (listing.description || listing.title)
 
//     let url = `https://easyrentage.com/view-listing/${listing.id}`

//     let image = `https://easyrentage.s3.af-south-1.amazonaws.com/${listing.pictures[0]}`
    
    
//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', title)
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', description)
    
//     .replaceAll('https://easyrentage.com', url)

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     .replaceAll('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//   .catch(error => {

//     res.sendFile(__dirname+"/dist/index.html") 
  
//   });
  
//  }) 
 
//  } else if (req.path.includes("about")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "About Easy Rentage (ER)")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Easy Rentage is a real estate platform that aims to solve the long lasting problem of property (house, apartment, lands, commercial buildings) aquisition in Nigeria. We carried out a study and discovered that the issue of getting properties to rent or buy is alot of stress for the average Nigerian. Thats why we provided these platform where anyone can easily aquire property of their choice. Not only these, this platform also provides an avenue for those who want to rent out/lease or sell thier properties. Our mission is to put a smile on your faces by providing these platform for your sole use, which we are optimistic will be beneficial to users.")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/about")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("contact")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Contact Us - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Contact us at Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/contact")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("avoidscams")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Avoid Scams - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Protect yourself against fraudsters at Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/avoidscams")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("buy-easycoin")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Buy Easycoin - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Purchase easycoin to continue listing properties")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/dashboard/buy-easycoin")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("edit-listing")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("edit-request")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("email-activation")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("email-confirmation")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("error")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("invite-friends")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Invite Friend And Get Reward- Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Get 5 Easycoin when someone signs up using your referral link. All you have to do is share your referral link with your friends. When they sign up and verify their account using your link, you will be rewarded with 5 Easycoin.")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/dashboard/invite-friends")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("manage-listings")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("manage-requests")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  }  else if (req.path.includes("forgot-password")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("new-password")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("page-not-found")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("policies")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Privacy Policy - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "This privacy policy is designed to inform users of Easy Rentage website and any related application, about how Easy Rentage gathers and uses Personal Information submitted to Easy Rentage through the Website. Note that the word 'Landlord' refers to anybody selling a property or renting out/leasing a property. While 'Tenant' refers to anybody renting or buying a property. Easy Rentage will take reasonable steps to protect user privacy consistent with the guidelines set forth in this Privacy Policy. In this Privacy Policy, 'user' or 'you' means any person viewing the Website or submitting any Personal Information to Easy Rentage in connection with using the Website. Be rest assured that your informations are safe with us. And by using the Website, you are indicating your consent to this Privacy Policy. IF YOU DO NOT AGREE WITH THIS PRIVACY POLICY, YOU SHOULD NOT USE THE WEBSITE")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/policies")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("post-listing")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Add Property - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Advertise Your Property for Free on Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/dashboard/post-listing")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("post-pictures")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("post-request")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Post Property Request - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Can't Find Property You Are Looking For? Tell us what you are looking for, lets help you find it.")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/post-request")
    
//     //.replace('/favicon.png', image)
    
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("profile")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("properties")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Affordable Properties for Rent & Sale in Nigeria")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Houses, Apartments, Commercial Properties & Lands for Rent & Sale in Nigeria - Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "http://easyrentage.com/properties/Category?page=1&search_data=&type=Property%20Type&min_price=Min%20price&max_price=Max%20price&bedrooms=Bedrooms%28No%20limit%29")
    
//     //.replace('/favicon.png', image)
    
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("referees")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("referral-signup")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("request-review")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("requests")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Property Requests")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "property request for rent and sale across Nigeria.")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/dashboard/requests/Category?page=1&search_data=&type=Property%20Type&budget=Budget&bedrooms=Bedrooms%28No%20limit%29&requester_type=Requester%20Type")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("review")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("saved-properties")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("sign-in")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")
    
//     //.replace('/favicon.png', image)
     
//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("subscribed-listing-alert")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("subscribed-request-alert")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("Unsubscribed-listing-alert")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("Unsubscribed-request-alert")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else if (req.path.includes("view-request")) {

//   fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        
//     if (err) {
        
//         console.error('Error during file reading', err);
        
//         return res.status(404).end()
//     }

//     htmlData = htmlData.replaceAll('Easyrentage - Houses, Apartments, Lands and Commercial buildings for Rent & Sale', "Login | Create an Account - Easy Rentage")
    
//     .replaceAll('A convenient real estate shopping center, with houses, apartments, lands and commercial buildings for rent & sale, it’s easy to find your dream property on Easyrentage.', "Login to Easy Rentage")
    
//     .replaceAll('https://easyrentage.com', "https://easyrentage.com/sign-in")

//     .replaceAll('index, follow', "noindex, nofollow")
    
//     //.replace('/favicon.png', image)

//       return res.send(htmlData);

//     })
 
//  } else { res.sendFile(__dirname+"/dist/index.html") }
  
// })

// }


 
/*delete this code and the dist folder to go back to development env
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname+"/dist/"))
    app.get("*", (req, res) => {
        res.sendFile(__dirname+"/dist/index.html")
    })
}*/

//connect database
mongoose.connect(Uri, {
    useNewurlParser: true,
    useUnifiedTopology: true,
}).then( () => {
    console.log("Connected to database succesfully")
}).catch( (err) => {
    console.log(err.message);
})


app.listen(port, () => {
  console.log("server started...")
})
