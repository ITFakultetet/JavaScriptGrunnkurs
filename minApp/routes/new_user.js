var express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('new_user', {
        title: 'Ny Bruker',
        message: ''
    });

});

/* Register new user. */
router.post('/', function(req, res, next) {

    const navn = req.body.navn;
    const brukernavn = req.body.brukernavn;
    const passord_plain = req.body.passord;
    const passord = bcrypt.hashSync(passord_plain, saltRounds);
    const epost = req.body.epost;
    const dato = req.body.dato;

    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb://noderia.com/kurs?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });

    client.connect(err => {
        console.log("Connected successfully to server");
        const coll = client.db("kurs").collection("kursbrukere");
        // Insert a single document
        coll.insertOne({ "navn": navn, "brukernavn": brukernavn, "passord": passord, "epost": epost, "dato": dato }, function(err, r) {
            
            client.close();
        });

    });

    res.render('new_user', {
        title: 'Ny Bruker',
        message: `Ny bruker ${navn} lagret`

    });
}); // end router.post


module.exports = router;