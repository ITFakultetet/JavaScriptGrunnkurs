var express = require('express');
var router = express.Router();

// Last inn PostgreSQL-driveren og opprett en tilkobling til en eksisterende PostgreSQL-server

var db = require('pg');
var dbConnection = "postgres://kurs:kurs123@s1.itfakultetet.no:5432/hr";

// Her er koden som henter data og sender dem til ejs-malen

router.get('/', function (req, res, next) {

    var dbClient = new db.Client(dbConnection);
    dbClient.connect(function (err) {

        if (err)
            throw err;

        var query = "select concat(first_name,' ',last_name) as Navn, extract(year from birth_date) as Fodt, gender as Kjonn from employees limit 1000";

        dbClient.query(query, function (err, result) {

            if (err) {
                throw err;
            } else {
                res.render('ansatte.ejs', {
                    title: 'Ansatte',
                    ansatte: result
                });
                res.end();
            }
        });
    });
});

module.exports = router;

