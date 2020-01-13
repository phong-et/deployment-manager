/**
 * Created by Phillipet on 1/5/2018.
 */
var express = require('express');
var router = express.Router();
var file = require('./../model/file2');
//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/', isAuthenticated, function(req, res, next) {
    if(req.session.passport.user.userType == "ad" || req.session.passport.user.username === "phillip" || req.session.passport.user.username === "seven")
        res.render('user_deploy_statistic', {
            theme: req.cookies.chuta_theme || 'crisp', 
            username: req.session.passport.user.username,
            userType: req.session.passport.user.userType
        });
    else res.render('error',{message:'You have a Limited Privilege',error:{status:'false',stack:'normal'}});
});

router.post('/get-file-user', isAuthenticated, function(req, res, next) {
  var userName = req.body.userName
  console.log('userName:',userName)
  file.getLogs({actionUser: req.body.userName},'actionUser actionName actionContent actionDate', function(logs){
    res.send(logs);
  });
});

router.post('/get-file-user-by-date', isAuthenticated, function(req, res, next) {
    // http://prntscr.com/iicohb - query sample ROBO mongo GUI
    // db.getCollection('logs').find({actionUser:'phillip', '$where': 'this.actionDate.toJSON().slice(0,10) == "2018-02-22"'})
    var date, strQueryWhere, optionFind = req.body.optionFind
    if(optionFind == "D"){
        date = req.body.year + '-' + req.body.month + '-' + req.body.day
        strQueryWhere = 'this.fileUploadedDate.toJSON().slice(0,10) == "' + date + '"'
    }
    else if(optionFind == "M"){
        date = req.body.year + '-' + req.body.month
        strQueryWhere = 'this.fileUploadedDate.toJSON().slice(0,7) == "' + date + '"'
    }
    else if(optionFind == "Y"){
        date = req.body.year
        strQueryWhere = 'this.fileUploadedDate.toJSON().slice(0,4) == "' + date + '"'
    }
    var query = {
        fileUserUpload: req.body.username,
        '$where': strQueryWhere
    }
    if(req.body.username === 'all')
        query = {'$where': strQueryWhere} 
    console.log(query)
    file.getLogs(query,'fileUserUpload fileClientName fileWsType fileUploadedDate fileName', function(logs){
      res.send(logs);
    });
  });

module.exports = router;
