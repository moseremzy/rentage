require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 9000;
const Uri = process.env.Uri
const routes = require("./routes/routes")
const app = express();
const path = require("path")

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(routes);
app.use(express.static(path.join(__dirname, "/images")));
app.use(express.static(path.join(__dirname, "/property_images")));
app.use(express.static(path.join(__dirname, "/css")));

//delete this code and the dist folder to go back to development env
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname+"/dist/"))
    app.get("*", (req, res) => {
        res.sendFile(__dirname+"/dist/index.html")
    })
}

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
