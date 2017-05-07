/**
 * Created by dkroeske on 28/04/2017.
 */

// API - versie 2

var express = require('express');
var router = express.Router();
var auth =  require('../auth/authentication');
var users = require('../datasource/user_ds');

// Sample database
var intel_microarchitecture = [
    {
        name : '80486',
        info : {
            year: '1968',
            clock: '100 MHz',
            pipeline: 3
        }
    },
    {
        name : 'Sandy Brigde',
        info : {
            year: "2011",
            clock: '4000 MHz',
            pipeline: 14
        }
    },
    {
        name : 'Silvermont',
        info : {
            year: '2013',
            clock: '2670 MHz',
            pipeline: 14
        }
    },
    {
        name : 'Haswell',
        info : {
            year: '2013',
            clock: '4400 MHz',
            pipeline: 14
        }
    },
    {
        name : 'Kabylake',
        info : {
            year: '2016',
            clock: '4500 MHz',
            pipeline: 14
        }
    },
    {
        name : 'Cannonlake',
        info : {
            year: '2017',
            clock: 'Not defined yet',
            pipeline: 14
        }
    }
];

//
// Catch all except login
//
router.all( new RegExp("[^(\/login)]"), function (req, res, next) {

    //
    console.log("VALIDATE TOKEN")

    var token = (req.header('X-Access-Token')) || '';

    auth.decodeToken(token, function (err, payload) {
        if (err) {
            console.log('Error handler: ' + err.message);
            res.status((err.status || 401 )).json({error: new Error("Not authorised").message});
        } else {
            next();
        }
    });
});


//
// Login with {"username":"<username>", "password":"<password>"}
//
router.route('/login')

    .post( function(req, res) {

        //
        // Get body params or ''
        //
        var username = req.body.username || '';
        var password = req.body.password || '';

        //
        // Check in datasource for user & password combo.
        //
        // Remark: result is an ARRAY (design error?)
        //
        result = users.filter(function (user) {
            if( user.username === username && user.password === password) {
                return ( user );
            }
        });

        // Debug
        console.log("result: " +  JSON.stringify(result[0]));

        // Generate JWT
        if( result[0] ) {
            res.status(200).json({"token" : auth.encodeToken(username), "username" : username});
        } else {
            res.status(401).json({"error":"Invalid credentials, bye"})
        }

});


//
// Sample ENDPOINT
//
router.get('/intel/:year?', function(req, res, next) {

    var year = req.params.year || '';
    var result = [];

    if( year ) {
        console.log('year')

        result = intel_microarchitecture.filter( function(y) {
            return ( y.info.year == year );
        })
    } else {
        result = intel_microarchitecture;
    }

    res.json(result);
});


module.exports = router;