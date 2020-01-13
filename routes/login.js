var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');

//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = function(passport){
    /* GET home page. */
    router.get('/', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('index', {
                title: 'ET\'s support page',
                theme: req.cookies.chuta_theme || 'neptune',
                token:req.session.passport.user.token,
                username: req.session.passport.user.username,
                userType:req.session.passport.user.userType
            });
        } else {
            var err = req.flash().error;
            res.render('login', {
                title: 'ET\'s Suppport page',
                theme: req.cookies.chuta_theme || 'neptune',
                statusLoginText:err||'Type your username and password',
                statusLoginTextColor:'#000'
            });
        }
    });

    //Login
    router.post('/', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true,
        successFlash: true
    }));


    //Logout
    router.get('/signout', isAuthenticated, function (req, res) {
        require('./../model/user').logout(req.session.passport.user.userId, 'offline',function(raw){
            console.log(raw);
        });
        req.logout();
        res.redirect('/');
    });

    //Register
    //router.post('/reg', function (req, res) {
    //    var data = {
    //        username: req.body.username,
    //        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
    //        email: req.body.email
    //    };
    //    db.query('INSERT INTO ct_Users SET ?', data, function (err, rows, fields) {
    //        console.log(err);
    //        if (err == null) {
    //            passport.authenticate('local')(req, res, function () {
    //                res.redirect('/');
    //            });
    //        } else {
    //            req.flash('error', 'error: ' + err);
    //            res.redirect('/');
    //        }
    //    });
    //});
    return router;
};
