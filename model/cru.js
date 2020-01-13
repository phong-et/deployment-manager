var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	cfg = require('./../config'),
	sha512 = require('js-sha512'),
	util = require('./../utils/util');

// schema define
var userSchema = new Schema({
	_id: Number,
	userName: String,
	password: String,
	status: {type:String, default:'offline'},
	socketId: {type:String, default:''},
	token:{type:String, default:''},
	regDate: {type:Date, default:Date.now},
	lastLDate:{type:Date, default:Date.now},
	isAdmin:{type:Boolean, default:false},
	userType:{type:String, default:'ad'}
});

function isValidate(userName, password){
	if(userName == null || userName == undefined || userName == "" || password == null || password == "" || password == undefined){
		return false;
	}
	return true;
}


function isExists(userName, callback){
	var	connection = mongoose.createConnection(cfg.dbURI);	
	var u = connection.model('user', userSchema);
	console.log('check user exists...');
	u.findOne({userName:userName},'userName',function(err,docs){
		if (err) return console.error(err);		
		connection.close();
		var isExists = true;
		if(docs == null) isExists = false 
		console.log('user is exists:%s',isExists);
		callback(isExists);
	});
}
// create user and return fields when done
var createUser = function(jsonUser,callback){
	console.log('register...');
	if(isValidate(jsonUser.userName,jsonUser.password)){
		isExists(jsonUser.userName,function(isExists){
			if(!isExists){
				// open connection to mongodb - database demo
				var	connection = mongoose.createConnection(cfg.dbURI);

				// initialize increment feature for connection
				autoIncrement.initialize(connection);	
				
				// plug increment feature to model 
				userSchema.plugin(autoIncrement.plugin, {model:'user', field:'_id'});
				// create model 
				var user = connection.model('user', userSchema);
				//jsonUser.password = sha512(jsonUser.password);
				var u = new user(jsonUser);
				console.log('create user...');
				u.save(function (err,u) {
					if (err) return console.error(err);	
					console.log('create user success');
					callback({success:true, msg:u});
				});
				
			}
			else{
				callback({success:false,msg:'user is exists'})
			}
		});
	}
	else{
		console.log('username or password not valid');
		callback({success:false,msg:'username or password not valid'})
	}
}

var jsonUser = {};
jsonUser.userName = process.argv[2];
jsonUser.password = sha512(process.argv[3]);
createUser(jsonUser, function(o){
	console.log(o.msg);
})
