/**
 * Created by hiep on 11/6/2015.
 */

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var db = require('./db');
//var crypto = require('crypto');

var user = require('./model/user');
var jwt = require('jsonwebtoken');

passport.use(new LocalStrategy(
    function (username, password, done) {
        user.login(username,password, function(data){
            if(data.success==true){ // login ET Support Page success
                // user for 1st login to INX ==> currently disabled it. Will login when user use find site feature
                //console.log('logining inx support page...');
                //if(global.cookies == ""){
                //    // login by global.cookies file
                //    user.loginInxSppByCookieFile(function(result){
                //        // cookie was expired
                //        if(result.status==false){
                //            user.loginInxSpp('lkk','333',function(options){
                //                // save global.cookies for all browser request
                //                global.cookies = options;
                //            });
                //        }
                //        else if(result.status==true){
                //            global.cookies = result.cookies;
                //        }
                //    });
                //}
                //else{
                //    console.log('Login before !');
                //}

                // update login
                user.updateLogin(data.msg._id, '', 'online' ,function(raw){
                    console.log(raw);
                });
                // We are sending the profile inside the token
                var token = jwt.sign({username:username, userId:data.msg._id}, global.jwt_secret, { expiresIn: 60*600});
                //res.json({success:true,token:token});
                return done(null, {token:token,username:username,userId:data.msg._id,userType:data.msg.userType});
            }
            else if(data.success==false){
                console.log('user not exists');
                //res.json({success:false,msg:});
                return done(null,false,{message:data.msg});
            }
        });
    })
);

//serialize User to Session
passport.serializeUser(function (user, done) {
    done(null, user);
});

//deserialize from Session to get User to check authentication status for every new request
//done(err,id) -> means authentication failed
passport.deserializeUser(function (user, done) {
    // do some thing

    done(null, user);
});

module.exports = passport;