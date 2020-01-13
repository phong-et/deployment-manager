/**
 * Created by Phillipet on 8/16/2016.
 */

var express = require('express');
var router = express.Router();

var fs = require('fs');
var request = require('request');
var user = require('./../model/user');

//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

router.get('/', isAuthenticated, function(req, res, next) {
    var userType = req.session.passport.user.userType;
    var page = '';
    if(userType == "fe") page = 'site_find_check';
    else if(userType == "feav") page = 'site_find_check_deploy';
    res.render(page, {theme: req.cookies.chuta_theme || 'neptune',userId:req.session.passport.user.userId, userName:req.session.passport.user.username})
});