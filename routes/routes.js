const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const API = require("../api/api")
const session = require("express-session");
const check_session = require("../helper/helper.js");
const Mongodbsession = require("connect-mongodb-session")(session)
const Uri = "mongodb+srv://easyrentage:JAOopp9hG9k3e2BC@cluster0.zwqc7ko.mongodb.net/easyrentage?retryWrites=true&w=majority"
const multer = require("multer");
var timeout = require('connect-timeout')


//Activate Session
const store = new Mongodbsession({
    uri: Uri,
    collection: "usersession"
  })

router.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store
  }))


//Activate Multer
let storage = multer.memoryStorage({})
  
  /*destination: (req, file, cb) => {
     cb(null, './property_images')
  }, 

  filename: (req, file, cb) => {
     cb(null, file.fieldname + "_" + Date.now() + "." + file.originalname.split(".")[file.originalname.split(".").length - 1]);
  }

})

let fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
*/

let limits =  {
  fileSize: 10000000 //10mb
}
 
let upload = multer({
  storage: storage,
  //fileFilter: fileFilter,
  limits: limits,
}) 


//POST REQUESTS
router.post("/api/register", API.register)
 
router.post("/api/resend-email", API.ResendConfirmationMail)

router.post("/api/login", API.login)

router.post("/api/submit_listing", API.submit_listing);

router.post("/api/submit_pictures", upload.any('', 35), API.submit_pictures);

router.post("/api/add_to_favorites", API.add_to_favorites);

router.post("/handle-review-page", API.handle_reviewpage); //add am to web own

router.post("/api/fetch_geo_info", API.fetch_geo_info);

router.post("/api/submit_payment", API.submit_payment);

router.post("/paystack_webhook", API.paystack_webhook);

router.post("/api/send_reset_pass_email", API.send_reset_pass_email);

router.post("/api/reset_password", API.reset_password);

router.post("/api/contact_us", API.contact_us);

router.post("/api/submit_request", API.submit_request);

//GET REQUESTS 

router.get("/api/confirm-email/:id", API.emailVerification);

router.get("/api/loggedIn", API.loggedIn);

router.get("/api/fetch-properties/:category", API.properties);

// router.get("/api/fetch_properties", API.fetch_properties);

router.get("/api/fetch_users", API.fetch_users);

router.get("/api/fetch_requests", API.fetch_requests);

router.get("/api/logout_user", API.logout);


//PATCH REQUESTS 
router.patch("/api/change_status", API.change_status);

router.patch("/api/update_viewedlisting_counter", API.update_viewedlisting_counter);

router.patch("/api/update_property_info", API.update_property_info);

router.patch("/api/filter", API.filter);

router.patch("/api/update_login_counter", API.update_login_counter)

router.patch("/api/update_user_info", upload.single('company_logo'), API.update_user_info)

router.patch("/api/update_password", API.update_password)

router.patch("/api/subscribe_unsubscribe_user_for_listings", API.subscribe_unsubscribe_user_for_listings)

router.patch("/api/subscribe_unsubscribe_user_for_requests", API.subscribe_unsubscribe_user_for_requests)

 
//DELETE REQUEST
router.delete("/api/delete_pictures", API.delete_pictures);

router.delete("/api/delete_listing", API.delete_listing); //individual listing

router.delete("/api/delete_listings_categorically", API.delete_listings_categorically); //delete by category

router.delete("/api/remove_all_properties", API.remove_all_properties); //remove all properties from favorites

router.delete("/api/delete_account", API.delete_account); //delete user account

router.delete("/api/delete_request", API.delete_request); //individual request

router.delete("/api/delete_requests_categorically", API.delete_requests_categorically); //delete by category

module.exports = router;
