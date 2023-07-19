const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const API = require("../api/api")
const session = require("express-session");
const Mongodbsession = require("connect-mongodb-session")(session)
const Uri = 'mongodb+srv://moseremzy:iURyEjpibBSycfNT@cluster0.6hmfmuw.mongodb.net/Banking?retryWrites=true&w=majority'
const multer = require("multer");


//Activate Session
const store = new Mongodbsession({
    uri: Uri,
    collection: "mysession"
  })

router.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store
  }))

//Activate Multer
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, './property_images')
  }, 
  filename: (req, file, cb) => {
     cb(null, Date.now() + "." + file.originalname.split(".")[file.originalname.split(".").length - 1]);
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

let limits =  {
  fileSize: 10000000 //10mb
}
 
let upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
}) 


//POST REQUESTS
router.post("/register", API.register)
 
router.post("/resend-email", API.ResendConfirmationMail)

router.post("/login", API.login)

router.post("/submit_listing", API.submit_listing);

router.post("/submit_pictures", upload.any('', 30), API.submit_pictures);

router.post("/add_to_favorites", API.add_to_favorites);

router.post("/filter_property", API.filter_property)

router.post("/fetch_home_recommendations", API.fetch_home_recommendations);

router.post("/submit_payment", API.submit_payment);

router.post("/verify_payment", API.verify_payment);


//GET REQUESTS 
router.get("/email-confirmation/:id", API.emailVerification);

router.get("/loggedIn", API.loggedIn);

router.get("/dashboard/post-pictures/:id", API.get_pictures_page);

router.get("/dashboard/manage-listings", API.get_managelisting_page);

router.get("/view-listing/:id", API.view_listing);

router.get("/dashboard/edit-listing/:id", API.edit_listing);

router.get("/fetch_user", API.fetch_user);

router.get("/dashboard/saved-properties", API.get_savedproperties_page);

router.get("/properties/:category", API.properties);

router.get("/dashboard/referrals", API.fetch_referrals);


//PATCH REQUESTS 
router.patch("/change_status", API.change_status);

router.patch("/update_property_info", API.update_property_info);

router.patch("/filter", API.filter);

router.patch("/update_login_counter", API.update_login_counter)

//DELETE REQUEST
router.delete("/delete_pictures", API.delete_pictures);

router.delete("/delete_listing", API.delete_listing); //individual listing

router.delete("/delete_listings_categorically", API.delete_listings_categorically); //delete by category

router.delete("/remove_all_properties", API.remove_all_properties); //remove all properties from favorites

//ADMIN ROUTES
router.get("/private/admin", API.get_pendingListings);

router.get("/private/admin/listing/:id", API.get_singleListing);

router.post("/approve_decline", API.approve_decline);




module.exports = router;