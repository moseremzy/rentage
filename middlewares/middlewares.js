const hbs = require('nodemailer-express-handlebars');
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const path = require('path');
const fs = require("fs")
const nodemailer = require("nodemailer");

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

module.exports = class MIDDLEWARES {

    static SendConfirmationMail(req, res, useremail, confirmationCode, firstname) {

      var smtpConfig = {
        host: 'pinnaclexchangebank.com',
        port: 465,
        secure: true, // use SSL
         auth:{
                 user: 'test@pinnaclexchangebank.com',
                 pass: 'Lheasapida1.'
           }
    };

    var transporter = nodemailer.createTransport(smtpConfig);
          
          // point to the template folder
          const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/')
          };
          
          // use a template file with nodemailer
          transporter.use('compile', hbs(handlebarOptions));
          
          var mailOptions = {
            from: ' "EasyRentage" <test@pinnaclexchangebank.com>', // sender address
            to: useremail,
            subject: 'Confirmation Email',
            attachments: [{
                 filename: 'logo.png',
                 path: './images/logo.png',
                 cid: "logo"
           }],
            template: 'ConfirmationEmail', // the name of the template file i.e email.handlebars
            context:{
                confirmationCode: confirmationCode,
                firstname: firstname
            }
          };      
              // trigger the sending of the E-mail
              transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.log(err.message)
                        res.json({message: "error occured", confirmationCode: confirmationCode})
                    } else {
                        res.json({message: "Account created succesfully, Mail sent", confirmationCode: confirmationCode})
                    }
              })        
    }

//Create the date listing was added
   static date() {
     
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let d = new Date();

    let dateAdded = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

    return dateAdded;

 }

 
//Password Reset  Email
static send_reset_pass_email(req, res, useremail, token, firstname) {

  var smtpConfig = {
    host: 'pinnaclexchangebank.com',
    port: 465,
    secure: true, // use SSL
     auth:{
             user: 'test@pinnaclexchangebank.com',
             pass: 'Lheasapida1.'
       }
};


var transporter = nodemailer.createTransport(smtpConfig);
      
      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
      };
      
      // use a template file with nodemailer
      transporter.use('compile', hbs(handlebarOptions));
      
      var mailOptions = {
        from: ' "EasyRentage" <test@pinnaclexchangebank.com>', // sender address
        to: useremail,
        subject: 'Reset Password',
        attachments: [{
             filename: 'logo.png',
             path: './images/logo.png',
             cid: "logo"
       }],
        template: 'PasswordResetEmail', // the name of the template file i.e email.handlebars
        context:{
            token: token,
            firstname: firstname
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      res.json({message: "error occured"})
                  } else {
                      res.json({message: "Mail sent"})
                  }
           })        
}



//Contact us Email
static contact_us_email(req, res, email, firstname, lastname, phone, message) {

  var smtpConfig = {
        host: 'easyrentage.com',
        port: 465,
        secure: true, // use SSL
         auth:{
                 user: 'support@easyrentage.com',
                 pass: 'Lheasapida1.'
           }
    };

var transporter = nodemailer.createTransport(smtpConfig);
      
      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
      };
      
      // use a template file with nodemailer
      transporter.use('compile', hbs(handlebarOptions));
      
      var mailOptions = {
        from: ' "EasyRentage" <support@easyrentage.com>', // sender address
        to: 'easyrentage@gmail.com',
        subject: 'User Complaint',
        template: 'contactusEmail', // the name of the template file i.e email.handlebars
        context:{
            email: email,
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            message: message,
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      res.json({message: "error occured"})
                  } else {
                      res.json({message: "Mail sent"})
                  }
           })        
}



//Notfies admin of new listings
static new_listing_alert (req, res, listing) {
  
  let subject1 = `${listing.bedroom}` > 0 ? `${listing.bedroom} Bedroom `: ` `

  let subject2 =  `${listing.subtype}` || `${listing.type} ` + listing.category

  var smtpConfig = {
    host: 'pinnaclexchangebank.com',
    port: 465,
    secure: true, // use SSL
     auth:{
             user: 'test@pinnaclexchangebank.com',
             pass: 'Lheasapida1.'
       }
  };

  var transporter = nodemailer.createTransport(smtpConfig);
    
    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./views/')
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));

       var mailOptions = {
        from: ' "EasyRentage" <test@pinnaclexchangebank.com>', // sender address
        to: "easyrentage@gmail.com", //'agbaojemoses@gmail.com',
        subject: "Hello Sir, New Property Alert.",
        template: 'new_property', // the name of the template file i.e email.handlebars
        context:{
            title: subject1 + subject2 + " " + listing.category,
            listing_id: listing.id,
            location: `${listing.location}, ${listing.town},  ${listing.state}`.length > 70 ? `${listing.location}, ${listing.town},  ${listing.state}`.slice(0, 70) + "...": `${listing.location}, ${listing.town},  ${listing.state}`,
            price: (new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(listing.price)),
            payment: listing.payment,
            type: listing.type,
            subtype: listing.subtype,
            bedroom: `${listing.type}` === 'Flat/Apartment' || `${listing.type}` === 'House' || `${listing.subtype}` === 'Hotel/Guest House' ? listing.bedroom : undefined,
            classroom: `${listing.subtype}` === 'School' ? listing.classroom : undefined,
            fuelpump: `${listing.subtype}` === 'Filling Station' ? listing.fuelpump : undefined,
            bathroom: `${listing.type}` === 'Flat/Apartment' || `${listing.type}` === 'House' || `${listing.subtype}` === 'Hotel/Guest House' ? listing.bathroom : undefined,
            toilet: `${listing.type}` === 'Flat/Apartment' || `${listing.type}` === 'House' || `${listing.subtype}` === 'Hotel/Guest House' ? listing.toilet : undefined,
            parking: listing.parking,
            total_area: `${listing.type}` !== 'Flat/Apartment' && `${listing.type}` !== 'House' ? listing.total_area : undefined,
            picture: listing.pictures[0]
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      //res.json({message: "Email not sent"})
                      console.log(err.message)
                  } else {
                      //res.json({message: "Email sent"})
                      console.log("email sent")
                  }
           })        
} 


//Email that notifies admin that new request was submitted
static new_request_alert (req, res, request) {

  var smtpConfig = {
    host: 'pinnaclexchangebank.com',
    port: 465,
    secure: true, // use SSL
     auth:{
             user: 'test@pinnaclexchangebank.com',
             pass: 'Lheasapida1.'
       }
};

  var transporter = nodemailer.createTransport(smtpConfig);
    
    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./views/')
    };
    
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));

       var mailOptions = {
        from: ' "Easy Rentage" <test@pinnaclexchangebank.com>', // sender address
        to: "easyrentage@gmail.com", //'agbaojemoses@gmail.com',
        subject: `Hello Sir, Property Request Alert.`,
        attachments: [{
          filename: 'logo.png',
          path: './images/logo.png',
          cid: "logo"
       }],
        template: 'new_property_request', // the name of the template file i.e email.handlebars
        context:{
             id: request.id,
             requesters_name: request.name,
             type: request.subtype || request.type,
             category: request.category,
             bedroom: request.bedroom,
             classroom: request.classroom,
             fuelpump: request.fuelpump,
             town: request.town,
             state: request.state,
             price: (new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(request.price)),
             person_type: request.person_type,
             dateAdded: request.dateAdded
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      //res.json({message: "Email not sent"})
                      console.log(err.message)
                  } else {
                      //res.json({message: "Email sent"})
                      console.log("email sent")
                  }
           })        
    
}



//VALIDATE PAGE NUMBER FOR PAGINATION: ensuring page numbers larger than total pages are rejected, page numbers starting with 0 are rejected also
  static validate_page_number(page, total_pages) {

    let counter = 1;

    const pattern = /^0+(?!$)/

    if (pattern.test(page) === false) {  //if page number no get leading 000 proceed

    while (counter <= total_pages) {

      if (page == counter) {

        return true
        
      } else {

        counter++;

      }

    }
    
  } else {

    return false //if he get, return false

  }

}

  //Delete Picture from S3 bucket
  static async delete_bucket_pictures (Key) {

    const params = { 
 
     Bucket: BUCKET_NAME,
    
     Key: Key,
   
   }
 
   const command = new DeleteObjectCommand(params)
 
   await s3.send(command)
 
  }

 
}