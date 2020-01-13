/**
 * Created by Phillipet on 11/14/2015.
 */
var express = require('express');
var router = express.Router();
var user = require('./../model/user');
//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/', isAuthenticated, function(req, res, next) {
    if(req.session.passport.user.userType == "ad")
        res.render('user_manage', {theme: req.cookies.chuta_theme || 'crisp'});
    else res.render('error',{message:'You have a Limited Privilege',error:{status:'false',stack:'normal'}});
});

router.get('/get-users', isAuthenticated, function(req, res, next) {
    user.getUsers(function(users) {
        res.send(users);
    });
});

router.post('/add-users', isAuthenticated, function(req, res, next) {
    var jsonUser={
        userName:req.body.userName,
        password:req.body.password,
        userType:req.body.userType,
    };
    user.createUser(jsonUser,function(responseJson) {
        // set hard configString for user
        var cfg = {
            findStyle:'Free',
            clientName:'LIGA',
            wsType:[1,2],
            grouping:'ipAddrL',
            isGroupingExpand:false,
            isShowFCfgChecking:false
        };
        if(jsonUser.userType == 'bo'){
            cfg.wsType=6;
        }
        user.updateUser({_id:responseJson.msg._id},{CfgFind:JSON.stringify(cfg)},function(msg){
            // form format response message
            console.log(msg);
            res.send(responseJson);

        });
    });
});

router.post('/update-users', isAuthenticated, function(req, res, next) {

    user.updateUser({_id:req.body._id},{
        userType:req.body.userType,
        status:req.body.status
    },function(rs) {
        res.send(rs);
    });
});

router.post('/delete-users', isAuthenticated, function(req, res, next) {
    user.deleteUser(req.body._id, function(rs){
        res.send(rs);
    });
});

module.exports = router;
