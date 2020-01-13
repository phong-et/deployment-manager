// modules
//var request = require('request');// move to each login function
var cheerio = require('cheerio');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment'),
    cfg = require('./../config');

// schema define
var logSchema = new Schema({
    _id: Number,
    actionUser: {type:String, default:''},
    actionName:  {type:String, default:''},
    actionContent:  {type:String, default:''},
    actionDate: {type:Date, default:Date.now},
});

// create user and return fields when done
module.exports.createLog = function(data,callback){
    console.log('logging...');
    // open connection to mongodb - database demo
    var	connection = mongoose.createConnection(cfg.dbURI);
    // initialize increment feature for connection
    autoIncrement.initialize(connection);
    // plug increment feature to model
    logSchema.plugin(autoIncrement.plugin, {model:'log', field:'_id'});
    // create model
    var log = connection.model('log', logSchema);
    //jsonUser.password = sha512(jsonUser.password);
    var lg = new log(data);
    console.log('create log record...');
    lg.save(function (err,l) {
        if (err) return console.error(err);
        console.log('create log success');
        callback({success:true, msg:l});
    });
}
module.exports.getLogs = function(query,fields,callback){
    console.log('get logs...');
    console.log(query);
    var	connection = mongoose.createConnection(cfg.dbURI);
	var u = connection.model('log', logSchema);
	u.find(query,fields,function(err,logs){
		if (err) return console.error(err);
		connection.close();
		callback(logs);
	});
}
