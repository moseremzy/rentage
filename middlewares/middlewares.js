const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require("fs")
const nodemailer = require("nodemailer");

module.exports = class MIDDLEWARES {

    static SendConfirmationMail(req, res, useremail, confirmationCode, firstname) {

      var smtpConfig = {
        host: 'trustexchangebank.com',
        port: 465,
        secure: true, // use SSL
         auth:{
                 user: 'test@trustexchangebank.com',
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
            from: ' "Easy Rentage" <test@trustexchangebank.com>', // sender address
            to: useremail,//'agbaojemoses@gmail.com',
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
                          res.json({message: "Email not sent", confirmationCode: confirmationCode})
                      } else {
                          res.status(200).json({message: "Account created succesfully, Mail sent", confirmationCode: confirmationCode})
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


//Email that goes to user after listing approval
static approval (req, res, listing_id, user_email, firstname) {

    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth:{
                user: 'mohsisxfactsarena@gmail.com',
                pass: 'qbdvoyrbpltsakum'
            }
        }
      );
      
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
        from: ' "Easy Rentage" <mohsisxfactsarena@gmail.com>', // sender address
        to: user_email, //'agbaojemoses@gmail.com',
        subject: 'Listing Status',
        attachments: [{
             filename: 'logo.png',
             path: './images/logo.png',
             cid: "logo"
       }],
        template: 'Listing_approval_email', // the name of the template file i.e email.handlebars
        context:{
            listing_id: listing_id,
            user_email: user_email,
            firstname: firstname,
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      //res.json({message: "Email not sent"})
                      console.log("Email not sent")
                  } else {
                      //res.json({message: "Email sent"})
                      console.log("email sent")
                  }
           })        
}



//Email that goes to user after listing rejection
static declined (req, res, listing_id, user_email, firstname) {

    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth:{
                user: 'mohsisxfactsarena@gmail.com',
                pass: 'qbdvoyrbpltsakum'
            }
        }
      );
      
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
        from: ' "Easy Rentage" <mohsisxfactsarena@gmail.com>', // sender address
        to: user_email, //'agbaojemoses@gmail.com',
        subject: 'Listing Status',
        attachments: [{
             filename: 'logo.png',
             path: './images/logo.png',
             cid: "logo"
       }],
        template: 'Listing_declined_email', // the name of the template file i.e email.handlebars
        context:{
            listing_id: listing_id,
            user_email: user_email,
            firstname: firstname,
        }
      };      
           // trigger the sending of the E-mail
           transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                      //res.json({message: "Email not sent"})
                      console.log("Email not sent")
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


}