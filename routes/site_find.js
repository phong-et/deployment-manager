/**
 * Created by Phillipet on 11/14/2015.
 */
var express = require('express');
var router = express.Router();

//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
router.get('/', isAuthenticated, function(req, res, next) {
    res.render('site_find', {theme: req.cookies.chuta_theme || 'crisp'})
});

module.exports = router;
