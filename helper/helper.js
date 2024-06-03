module.exports = (req, res, next) => {

    if (req.session.email) {  

        next()
        
    } else {

        res.json({message: "dkkd"})

        //next()

    }

}