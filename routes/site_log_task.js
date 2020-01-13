/**
 * Created by Phillipet on 1/5/2018.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs')
//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
router.get('/', isAuthenticated, function (req, res, next) {
    if (req.session.passport.user.userType == "ad" || req.session.passport.user.username === "phillip" || req.session.passport.user.username === "seven" || req.session.passport.user.username === "rooney")
        res.render('site_log_task', {
            theme: req.cookies.chuta_theme || 'crisp',
            username: req.session.passport.user.username,
            userType: req.session.passport.user.userType
        });
    else res.render('error', { message: 'You have a Limited Privilege', error: { status: 'false', stack: 'normal' } });
});

router.get('/get-log-task', isAuthenticated, function (req, res, next) {
    try {
        var userName = req.body.userName
        fs.readFile(global.appRoot + '/public/task.json', 'utf8', function (err, tasks) {
            if (err)
                res.send({ "error": err })
            else
                res.send(tasks)
        })
    } catch (error) {
        res.send({ "error": error })
    }
});
router.post('/append-log-task', isAuthenticated, function (req, res, next) {
    try {
        var gs = require('../utils/gsheets/gs')
        //console.log(`req.body.task:${req.body.task}`)
        // 
        if(req.body.sheetId !== '1CTpS_CY8pbOh5EpePpsXC9_qSsNZ6jzuGCHRnDKbgRw'){
            // seven rooney
            gs.uppdateToSheets(
                [JSON.parse(req.body.task)], {
                    spreadsheetId: req.body.sheetId,
                    range: 'Work_List_2018_New',
                }, (() => {
                    gs.uppdateToSheets(
                        [JSON.parse(req.body.task)], {
                            spreadsheetId: '1CTpS_CY8pbOh5EpePpsXC9_qSsNZ6jzuGCHRnDKbgRw',
                            range: 'Work_List_2018_New',
                        }, ((dataSuccess) => {
                            res.send({success: true, msg: dataSuccess.spreadsheetId })
                        })
                    )
                })
            )
        }
        else{
            // phillip adjust to estimate 10-15 minutes
            gs.uppdateToSheets(
                [JSON.parse(req.body.task)], {
                    spreadsheetId: '1CTpS_CY8pbOh5EpePpsXC9_qSsNZ6jzuGCHRnDKbgRw',
                    range: 'Work_List_2018_New',
                }, ((dataSuccess) => {
                    res.send({success: true, msg: dataSuccess.spreadsheetId })
                })
            )
        }
    } catch (error) {
        res.send({ success: false, msg: error })
    }
});

// var gs = require('../utils/gsheets/gs')
// gs.uppdateToSheets(
//     [{ "taskDate": "5/25/2018 11:32", "taskIdRequest": "##RE-748##", "taskClientName": "JASAHOKI88", "taskDetail": "- Game Poker, Tangkas, Togel, Keno, GD88 (all) not connected  (will check with db team, not related to us)- Add Meta and Footer- Change minimum depo to 25.000 and put the Jadwal Bank Offline Image (Deposit Menu) https://prnt.sc/jm414z  (wap site need handle as well)- Put Jadwal Bank Offline image (Withdraw Menu) http://prntscr.com/jm445z- Put Referral Bonus Image (Referral Menu) http://prntscr.com/jm45bh- Put livechat script<script type=\"text/javascript\">    var lhnAccountN = \"35050-1\";    var lhnButtonN = 38;    var lhnChatPosition = 'default';    var lhnInviteEnabled = 0;    var lhnWindowN = 42268;    var lhnDepartmentN = 41244;</script><script src=\"//www.livehelpnow.net/lhn/widgets/chatbutton/lhnchatbutton-current.min.js\" type=\"text/javascript\" id=\"lhnscript\"></script>    *Supporting files attached", "taskSummary": "Summary", "taskStartTime": "5/26/2018 11:05:56", "taskEndTime": "5/26/2018 11:05:59", "taskDuration": "00:00:03", "taskStatus": "" }],
//     {
//         spreadsheetId: '1ZuHny7Fa_BObEpvNKGxT2MFLYcE9sC3uwq5wAlWpgC8',
//         range: 'Work_List_2018',
//     }, (dataSuccess) => {
//         console.log(dataSuccess)
//     }
// )
module.exports = router;

