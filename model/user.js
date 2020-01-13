// modules
//var request = require('request');// move to each login function
var cheerio = require('cheerio'),
	util = require('./../utils/util'),
	fs = require('fs'),
	//scraper = require('scraper'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	cfg = require('./../config'),
	path = require('path'),
	// schema define
	userSchema = new Schema({
		_id: Number,
		userName: String,
		password: String,
		status: { type: String, default: 'offline' },
		socketId: { type: String, default: '' },
		token: { type: String, default: '' },
		regDate: { type: Date, default: Date.now },
		lastLDate: { type: Date, default: Date.now },
		//isAdmin:{type:Boolean, default:false},
		userType: { type: String, default: 'fe' }
	});

function isValidate(userName, password) {
	if (userName == null || userName == undefined || userName == "" || password == null || password == "" || password == undefined) {
		return false;
	}
	return true;
}


function isExists(userName, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	console.log('check user exists...');
	u.findOne({ userName: userName }, 'userName', function (err, docs) {
		if (err) return console.error(err);
		connection.close();
		var isExists = true;
		if (docs == null) isExists = false
		console.log('user is exists:%s', isExists);
		callback(isExists);
	});
}

// create user and return fields when done
module.exports.createUser = function (jsonUser, callback) {
	console.log('register...');
	if (isValidate(jsonUser.userName, jsonUser.password)) {
		isExists(jsonUser.userName, function (isExists) {
			if (!isExists) {
				// open connection to mongodb - database demo
				var connection = mongoose.createConnection(cfg.dbURI);

				// initialize increment feature for connection
				autoIncrement.initialize(connection);

				// plug increment feature to model
				userSchema.plugin(autoIncrement.plugin, { model: 'user', field: '_id' });
				// create model
				var user = connection.model('user', userSchema);
				//jsonUser.password = sha512(jsonUser.password);
				var u = new user(jsonUser);
				console.log('create user...');
				u.save(function (err, u) {
					if (err) return console.error(err);
					console.log('create user success');
					callback({ success: true, msg: u });
				});

			}
			else {
				callback({ success: false, msg: 'user is exists' })
			}
		});
	}
	else {
		console.log('username or password not valid');
		callback({ success: false, msg: 'username or password not valid' })
	}
}

module.exports.login = function (userName, password, callback) {
	console.log('login user...');
	if (isValidate(userName, password)) {
		console.log('user info is validated');
		var connection = mongoose.createConnection(cfg.dbURI);
		var u = connection.model('user', userSchema);
		var fields = '_id userType';
		u.findOne({ userName: userName, password: password }, fields, function (err, docs) {
			if (err) return console.error(err);
			connection.close();
			var data = {
				success: true,
				msg: ""
			};
			if (docs == null) {
				data.success = false;
				data.msg = "Login failed - account not exists";
			}
			else data.msg = docs;
			callback(data);
		});
	}
	else {
		console.log('username or password not valid');
		callback({ success: false, msg: 'username or password not valid' })
	}
}

module.exports.findUser = function (userId, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.findOne({ userId: userId }, null, function (err, user) {
		if (err) return console.error(err);
		connection.close();
		callback(user);
	});
}
// "mongoose": "^4.0.7",
module.exports.deleteUser = function (userId, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.findOneAndRemove({ _id: userId }, function (err) {
		if (err) return console.error(err);
		connection.close();
		callback({ success: true, msg: 'Delete Successful' });
	});
}

module.exports.getUsers = function (callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.find({}, null, function (err, users) {
		if (err) return console.error(err);
		connection.close();
		callback(users);
	});
};

module.exports.getUserByQF = function (query, fields, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.find(query, fields, function (err, users) {
		if (err) return console.error(err);
		connection.close();
		callback(users);
	});
};
module.exports.updateUser = function (query, docs, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	// source description : http://mongoosejs.com/docs/api.html#model_Model.update
	var options = {
		//safe:false,
		//multi:true,
		//upsert:true,
		//overwrite:false,
		strict: false
	};
	u.update(query, docs, options, function (err, raw) {
		if (err) return console.error(err);
		console.log('updateUser - The raw response from Mongo was ', raw);
		callback({ success: true, msg: 'Updated' });
	});
}

module.exports.getInfo = function (query, fields, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);

	u.findOne(query, fields, function (err, docs) {
		if (err) return console.error(err);
		callback(docs);
	});
}

module.exports.getConnectionId = function (userId, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	var fields = '_id socketId';
	console.log('getConnectionId of userId=%s', userId);
	u.findOne({ _id: userId }, fields, function (err, docs) {
		if (err) return console.error(err);
		connection.close();
		console.log('result: ' + docs);
		callback(docs);
	});
}

module.exports.getStatus = function (userId, callback) {
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	var fields = '_id status socketId';
	console.log('getStatus of userId=%s', userId);
	u.findOne({ _id: userId }, fields, function (err, docs) {
		if (err) return console.error(err);
		connection.close();
		console.log('result: ' + docs);
		callback(docs);
	});
}
//
// connectionId exists like use online, so update status = online
// use for passport.js - suppose we can use updateUser function
module.exports.updateLogin = function (userId, socketId, status, callback) {
	console.log('update login...');
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.update({ _id: userId }, { socketId: socketId, status: status, lastLDate: new Date() }, function (err, raw) {
		if (err) return console.error(err);
		console.log('success:{_id:%s,socketId:%s,status:%s}', userId, socketId, status);
		callback(raw);
	});
}

module.exports.logout = function (userId, status, callback) {
	console.log('logout...');
	var connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('user', userSchema);
	u.update({ _id: userId }, { status: status }, function (err, raw) {
		if (err) return console.error(err);
		console.log('success:{_id:%s,status:%s}', userId, status);
		callback(raw);
	});
}

// login support page Innoxoft by cookie file
var loginInxSppByCookieFile = function (callback) {
	//var appRoot = require('app-root-path');
	fs.readFile(global.appRoot + '/public/cookiesInxSpp', 'utf8', function (err, data) {
		if (err) throw err;
		var request = require('request');
		var url = cfg.url3;
		request = request.defaults({ jar: true });
		var jar = request.jar();
		var cookies = data.split('; ');
		console.log(data);
		//console.log(cookies);
		var sessionId = cookies[0].split('=')[1];
		var aspxAuth = cookies[1].split('=')[1];
		var leeSecLok = cookies[2].split('=')[1];
		//console.log(sessionId);
		//console.log(aspxAuth);
		//console.log(leeSecLok);
		var cookieSessionId = request.cookie('ASP.NET_SessionId=' + sessionId);
		jar.setCookie(cookieSessionId, url);
		//var cookieAspxAuth = request.cookie('.ASPXAUTH=' + aspxAuth);
		//var cookieAspxAuth = request.cookie('.ASPXAUTHSSW=' + aspxAuth);// added 19/5/2016
		var cookieAspxAuth = request.cookie('.ASPXAUTH=' + aspxAuth); // added 12/7/2016 - old
		jar.setCookie(cookieAspxAuth, url);
		//var cookieLeeSeclok = request.cookie('LeeSeclok=' + leeSecLok);
		//var cookieLeeSeclok = request.cookie('SSWlok=' + leeSecLok); // added 19/5/2016
		var cookieLeeSeclok = request.cookie('SSWeblok=' + leeSecLok); // added 12/7/2016
		jar.setCookie(cookieLeeSeclok, url);

		//console.log(jar);
		request({ url: url, jar: jar }, function (e, response, body) {
			//console.log(body);
			console.log('Browse to :%s', url);
			console.log('code:%s', response.statusCode);
			//console.log(response.headers);
			//console.log(body);
			var $ = cheerio.load(body);

			var date = $('#Header1_lblDate').text();
			console.log(date);
			if (date != '') {
				console.log('Login successful');
				var viewStateS = $('#__VIEWSTATE').val();
				var validateS = $('#__EVENTVALIDATION').val();
				var params = {
					__EVENTTARGET: '',
					__EVENTARGUMENT: '',
					__VIEWSTATE: viewStateS,
					__EVENTVALIDATION: validateS,
					__LASTFOCUS: '',
					hidstaffid: '',
					txtWebSite: "JASABOLA",
					cboWSType: '1',
					btnSearch: 'Search',
					chkUsingOnly: 'on'
				};
				var headers = {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
					'Content-Type': 'application/x-www-form-urlencoded'
				};
				// make a request search
				var options = {
					url: url,
					method: 'POST',
					jar: jar,
					headers: headers,
					form: params
				};
				callback({ status: true, cookies: options });
			}
			else {
				console.log('Cookie was expired');
				callback({ status: false, cookies: null });
			}
		});
	});
}

// login to support page of Innoxoft by account
var loginInxSpp = function (username, password, callback) {
	// browse to page home of site
	var request = require('request');
	var url = cfg.url;
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			util.lg('Request open page : http://s.besttalk.info/default.aspx')
			util.lg(response.statusCode, 'code');
			//console.log(response.headers);

			//==============  get and create parameters  ========================
			$ = cheerio.load(body);
			var viewState = $('#__VIEWSTATE').val();
			var validate = $('#__EVENTVALIDATION').val();
			//util.lg(viewState,'viewState');
			//util.lg(validate,'__EVENTVALIDATION');

			var body = {
				__EVENTTARGET: '',
				__EVENTARGUMENT: '',
				__VIEWSTATE: viewState,
				__EVENTVALIDATION: validate,
				txtUsrName: username,
				txtPassword: password,
			};
			body["btnLogin.x"] = 23;
			body["btnLogin.y"] = 7;

			// =========================== create a request to login support page ======================================

			var headers = {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
				'Content-Type': 'application/x-www-form-urlencoded'
			};
			var form = body;
			request.post({ url: url, form: form, headers: headers }, function (e, response, body) {
				if (!error && response.statusCode) {
					util.lg('Request to login: http://s.besttalk.info/default.aspx')
					util.lg(response.statusCode, 'code');
					//console.log(response.headers);
					//sF('2.html',body);
					//sF2('22.html',response);

					// get cookie
					var strCookie = response.headers["set-cookie"];

					var sessionId = strCookie[0].split(';')[0].split('=')[1];
					var aspxAuth = strCookie[1].split(';')[0].split('=')[1];

					// create a request to authenticate after login successfully
					var url2 = cfg.url2;
					var jar = request.jar();
					var cookieSessionId = request.cookie('ASP.NET_SessionId=' + sessionId);
					jar.setCookie(cookieSessionId, url);
					//var cookieAspxAuth = request.cookie('.ASPXAUTHSSW=' + aspxAuth); // added 19/5/2016
					var cookieAspxAuth = request.cookie('.ASPXAUTH=' + aspxAuth); // added 19/5/2016
					jar.setCookie(cookieAspxAuth, url);
					//console.log(jar);

					// authenticate
					request({ url: url2, jar: jar }, function (e, response, body) {
						if (!error && response.statusCode == 200) {
							util.lg('Authenticate to : http://s.besttalk.info/Main.aspx');
							util.lg(response.statusCode, 'code');
							//console.log(response.headers);
							//var leeSecLok = jar.getCookieString(url).split(';')[2].split('=')[1];
							//var cookieLeeSeclok = request.cookie('LeeSeclok=' + leeSecLok);
							//util.lg(leeSecLok);

							//console.log(jar.getCookieString(url));
							//console.log(jar.getCookies(url));
							//var cookieLeeSeclok = jar.getCookieString(url).split(';')[2].split('=')[1];
							//console.log('cookie string: ' +  jar.getCookieString(url));
							fs.writeFile('public/cookiesInxSpp', jar.getCookieString(url), function (err) {
								console.log('==> write inx spp cookies success');
							});

							var url3 = cfg.url3;
							//jar.setCookie(cookieLeeSeclok,url2);

							//console.log(jar);
							// browse to search site
							request({ url: url3, jar: jar }, function (e, response, body) {
								if (!error && response.statusCode == 200) {
									util.lg('Browse to :http://s.besttalk.info/View/Website.aspx');
									util.lg(response.statusCode, 'code');
									//console.log(response.headers);
									var $ = cheerio.load(body);
									var viewStateS = $('#__VIEWSTATE').val();
									var validateS = $('#__EVENTVALIDATION').val();
									//util.lg(viewState,'viewState');
									//util.lg(validate,'__EVENTVALIDATION');

									//console.log(jar);
									var params = {
										__EVENTTARGET: '',
										__EVENTARGUMENT: '',
										__VIEWSTATE: viewStateS,
										__EVENTVALIDATION: validateS,
										__LASTFOCUS: '',
										hidstaffid: '',
										txtWebSite: "JASABOLA",
										cboWSType: '1',
										btnSearch: 'Search',
										chkUsingOnly: 'on'
									};

									// make a request search
									var options = {
										url: url3,
										method: 'POST',
										jar: jar,
										headers: headers,
										form: params
									};
									// return a cookies  - use this cookies for all request from browsers until it expired
									callback({ success: true, cookies: options });
								}
								else {
									console.log('Login success phrase - some network error - try again');
									callback({ status: false, cookies: 'some network error - try again' });
								}
							})
						}
					});
				}
				else {
					console.log('Login phrase - some network error - try again');
					callback({ status: false, cookies: 'some network error - try again' });
				}
			});
		}
		else {
			console.log('Open page login phrase - some network error - try again');
			callback({ status: false, cookies: 'some network error - try again' });
		}
	});
}

// use for server died and start again and global.cookies is null
var loginNow = function (callback) {
	// login by global.cookies file
	loginInxSppByCookieFile(function (result) {
		// cookie was expired
		if (result.status == false) {
			loginInxSpp(cfg.username, cfg.password, function (result) {
				// save global.cookies for all browser request
				// result = {success:true, cookies:cookies}
				callback(result);
			});
		}
		else if (result.status == true) {
			// login by cookie file success
			callback({ success: true, cookies: result.cookies });
		}
	});
}


module.exports.userSchema = userSchema;
module.exports.loginInxSpp = loginInxSpp;
module.exports.loginInxSppByCookieFile = loginInxSppByCookieFile;
module.exports.loginNow = loginNow;
