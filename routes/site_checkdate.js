/**
 * Created by Phillipet on 11/20/2015.
 */
var express = require('express');
var router = express.Router();

var fs = require('fs');
var yauzl = require("yauzl");
var request = require('request');
var user = require('./../model/user');
var fileLog = require('./../model/file2');
var specificServerExternalParam = 'a=a'//'bpx-backend-id=ycHvvjXWrpio-uchHyjwesldEoNC8okJQJgQc01DG3NhaAAkk2Y='
//handy middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

router.get('/', isAuthenticated, function (req, res, next) {
    var userType = req.session.passport.user.userType;
    var page = '';
    if (userType == "fe") page = 'site_find_check';
    else if (userType == "feav") page = 'site_find_check_deploy';
    else if (userType == "bo") page = 'site_find_check_deploy_bo';

    res.render(page, { theme: req.cookies.chuta_theme || 'crisp', userId: req.session.passport.user.userId, userName: req.session.passport.user.username })
});
router.post('/get-date-modified', isAuthenticated, async function (req, res, next) {
    await getModifiedDateOfFileInSite(req.body.siteName, req.body.filesParam, req.body.nameBkFile, req.body.serverId, req.body.skipAuth, function (json) {
        res.send(json);
    });
});

// src : http://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined
// added createLogFile 13-03-2018 
// use query instead params ( Currently, I don't know how req obj has not received params which passed from form submit event EXTJS)
router.post('/upload-file', isAuthenticated, function (req, res, next) {
    var fstream;
    var obj = {
        //_id: Number,
        //fileName: filename,
        //fileUploadedDate: { type: Date, default: Date.now },
        fileUserUpload: req.query.fileUserUpload,
        fileClientName: req.query.fileClientName,
        fileWsType: req.query.fileWsType,
    }
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldName, file, filename) {
        if (filename.substr(filename.length - 3, 3) == "zip") {
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream(global.appRoot + '/public/files/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {
                getModifiedDateOfFileInZip(global.appRoot + '/public/files/' + filename, function (listFile) {
                    obj.fileName = filename
                    console.log(obj)
                    fileLog.createLog(obj, function (msg) {
                        console.log(msg)
                    });
                    res.send('{"success":true,"msg":"OK","file":"' + filename + ' was uploaded ","listFile":' + listFile + '}');
                });
            });
        }
        else {
            res.send('{"success":false,"msg":"OK","file":"' + "Only support .zip file ! Failed" + '","listFile":' + "[]" + '}');
        }
    });
});

var getModifiedDateOfFileInZip = function (fileName, callback) {
    var jsonObjs = '';
    var i = 0;
    yauzl.open(
        fileName,
        function (err, zipfile) {
            if (err) {
                throw err;
            }
            zipfile.on(
                "entry",
                function (entry) {
                    // directory file names end with '/'
                    if (/\/$/.test(entry.fileName)) {
                        //i++;
                        if (i == 0)
                            jsonObjs = '';
                        if (++i == zipfile.entryCount) {
                            jsonObjs = '[' + jsonObjs.substr(0, jsonObjs.length - 1) + ']';
                            //reset i
                            i = 0;
                            callback(jsonObjs);
                        }
                        else
                            return;
                    }
                    // reset jsonObjs when do twice time
                    if (i == 0)
                        jsonObjs = '';
                    // Read the last date modified per archive entry
                    // 12/15/2015, 3:23:41 PM --> 12/15/2015 3:23:41 PM : will be convert by client ( browser )
                    jsonObjs += '{' + '"fileName":"' + entry.fileName + '","modifiedDate":"' + entry.getLastModDate().toLocaleString() + '"},';
                    if (++i == zipfile.entryCount) {
                        jsonObjs = '[' + jsonObjs.substr(0, jsonObjs.length - 1) + ']';
                        //reset i
                        i = 0;
                        callback(jsonObjs);
                    }
                }
            );
        });
};
var getModifiedDateOfFileInSite = async function (siteName, filesParam, nameBkFile, serverId, skipAuth, callback) {
    // post method - lock live url
    try {
        var headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var form = { cmd: 'GetModifiedDate', files: filesParam.substr(42, filesParam.length), nameBkFile: nameBkFile };
        console.log(form)
        request.post({ url: siteName + '/Public/GetDateModifiedOfFiles.aspx', form: form, headers: headers }, function (e, response, body) {
            try {
                if (!e && response.statusCode == 200) {
                    console.log('done /get-date-modified: %s', response.statusCode)
                    callback(body);
                }
            }
            catch (e) {
                console.log(e)
            }
        });
    }
    catch (e) {
        console.log(e)
    }
};

router.post('/save-cfg-default-values', isAuthenticated, function (req, res, next) {
    var cfg = {
        findStyle: req.body.cbbModeQueryCfg,
        clientName: req.body.cbbClientCfg,
        wsType: req.body.txtWsTypeCfg,
        grouping: req.body.cbbGroupingCfg,
        isGroupingExpand: req.body.isGroupingExpand || false,
        isShowFCfgChecking: req.body.isShowFCfgChecking || false,
        listWLs: req.body.txtListWLs || ''
    };
    console.log(cfg);
    user.updateUser({ _id: req.session.passport.user.userId }, { CfgFind: JSON.stringify(cfg) }, function (result) {
        // form format response message
        res.send(result);

    });
});
router.post('/get-cfg-default-values', isAuthenticated, function (req, res, next) {
    // get CfgFind string of user
    user.getInfo({ _id: req.session.passport.user.userId }, 'CfgFind', function (data) {
        res.send(data);
    });
});
// customize option values of each user


router.get('/get-users-share-record', isAuthenticated, function (req, res, next) {
    user.getUserByQF({ status: 'online', userType: { $in: ['fe', 'feav'] } }, 'userName socketId status', function (users) {
        res.send(users);
    });
});

// ======================== UPLOAD BAT FILE to server ========================
// src : http://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined
router.post('/upload-bat-file', isAuthenticated, function (req, res, next) {
    // post method - lock live url
    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    var form = { cmd: req.body.cmd, name: req.body.name, content: req.body.content.join('\r\n') };
    request.post({ url: req.body.siteName, form: form, headers: headers }, function (e, response, body) {
        if (!e && response.statusCode == 200) {
            console.log('done uploading bat file: %s', response.statusCode);
            res.send(body);
        } else {
            console.log('uploading bat file');
            res.send({ success: false, msg: req.body.siteName + ' not exists' });
        }
    });
});

// ======================== send params to server to GENERATE BAT FILE ========================
// src : http://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined
router.post('/generate-bat-file', isAuthenticated, async function (req, res, next) {
    // post method - lock live url
    console.log(req.body)
    var options = {
        url: req.body.siteName + '?cmd=GetModifiedDate3&bpx-backend-id=' + await require('scraper').fetchBackendId(parseInt(req.body.serverId.trim()), JSON.parse(req.body.skipAuth)),
        form: {
            dzFileName: req.body.dzFileName,
            dzFileNameList: req.body.dzFileNameList,
            //bkFile:req.body.bkFile,
            //pathFolder:req.body.pathFolder,
            nameBatFile: req.body.nameBatFile,
            batMode: req.body.batMode,
            nameBkFile: req.body.nameBkFile,
            isBKFull: req.body.isBKFull,
            isStart: req.body.isStart === 'true' ? 1 : 0
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    console.log(options)
    request.post(options, function (e, response, body) {
        if (!e && response.statusCode == 200) {
            console.log('done generate bat file: %s', response.statusCode);
            res.send(body);
        } else {
            console.log('generate bat file failed');
            console.log(body);
            console.log(response.statusCode)
            res.send({ success: false, msg: req.body.siteName + ' not exists' });
        }
    });
});

router.post('/upload-zip-deploy', isAuthenticated, async function (req, res, next) {
    var file = '';
    if (req.body.action == 'u')
        file = fs.createReadStream(global.appRoot + '/public/files/' + req.body.dzFileName);
    var formData = {
        // Pass a simple key-value pair
        dzFileField: 'dzFileName',
        action: req.body.action || '',
        // Pass data via Buffers
        my_buffer: new Buffer([1, 2, 3]),
        // Pass data via Streams
        dzFile: file,
        // Pass multiple values /w an Array
        //attachments: [
        //    fs.createReadStream(__dirname + '/attachment1.jpg'),
        //    fs.createReadStream(__dirname + '/attachment2.jpg')
        //],
        // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
        // Use case: for some types of streams, you'll need to provide "file"-related information manually.
        // See the `form-data` README for more information about options: https://github.com/form-data/form-data

        //custom_file: {
        //    value:  fs.createReadStream('/dev/urandom'),
        //    options: {
        //        filename: 'topsecret.jpg',
        //        contentType: 'image/jpg'
        //    }
        //}
    };
    //console.log(formData);
    console.log(req.body.skipAuth)
    specificServerExternalParam = await require('scraper').fetchBackendId(parseInt(req.body.serverId.trim()), JSON.parse(req.body.skipAuth))
    var options = {
        url: req.body.siteName + '?cmd=GetModifiedDate2&bpx-backend-id=' + specificServerExternalParam,
        formData: formData
    }
    console.log(options.url)
    request.post(options, function optionalCallback(e, response, body) {
        try {
            if (!e && response.statusCode == 200) {
                console.log('done upload-zip-deploy: %s', response.statusCode);
                try {
                    var jsonR = JSON.parse(body.replace(/\\/g, '\/'));
                    res.send({ success: jsonR.success, msg: jsonR.msg || formData.action + ' successfully' });
                }
                catch (e) {
                    res.send({ success: false, msg: e });
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    });
});

// change web config
router.post('/change-web-config', isAuthenticated, function (req, res, next) {
    var url = req.body.siteName + '/Public/GetDateModifiedOfFiles.aspx';
    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    var form = {
        cmd: 'GetModifiedDate4',
        settingKeyName: req.body.settingKeyName,
        settingKeyValue: req.body.settingKeyValue,
        wcMode: req.body.wcMode,
        wcAction: req.body.wcAction
    };
    // hide /Public/GetDateModifiedOfFiles.aspx from client site ( should apply for other action)
    request.post({ url: url, form: form, headers: headers }, function (e, response, body) {
        if (!e && response.statusCode == 200) {
            console.log('done change web config: %s', response.statusCode);
            res.send(body);
        } else {
            console.log('change web.config failed');
            console.log(body);
            res.send({ success: false, msg: req.body.siteName + ' not exists' });
        }
    });
});

router.post('/add-web-config', isAuthenticated, function (req, res, next) {
    var url = req.body.siteName + '/Public/GetDateModifiedOfFiles.aspx';
    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    var form = {
        cmd: 'GetModifiedDate4',
        //settingKeyName:req.body.settingKeyName,
        //settingKeyValue:req.body.settingKeyValue,
        wcMode: req.body.wcMode,
        //wcAction:req.body.wcAction
    };
    request.post({ url: url, form: form, headers: headers }, function (e, response, body) {
        if (!e && response.statusCode == 200) {
            console.log('done adding web config: %s', response.statusCode);
            res.send(body);
        } else {
            console.log('adding web.config failed');
            console.log(body);
            res.send({ success: false, msg: req.body.siteName + ' not exists' });
        }
    });
});

router.post('/remote', isAuthenticated, function (req, res, next) {
    try {
        var spawn = require('child_process').spawn;
        //console.log(req)
        console.log('remote ip :%s', req.body.serverIp)
        spawn('C:\\Windows\\System32\\mstsc.exe', ['/v:' + req.body.serverIp])
        res.send({ success: true })
    } catch (error) {
        res.send({ success: false })
    }
})


module.exports = router;
// (async function(){
//     //console.log(await require('scraper').fetchBackendId(169))
//     var ip = '10.168.106.111'
//     var spawn = require('child_process').spawn
//     console.log(ip)
//     spawn('C:\\Windows\\System32\\mstsc.exe', ['/v:' + ip])
// }())