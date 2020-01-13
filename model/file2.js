// modules
//var request = require('request');// move to each login function
var cheerio = require('cheerio');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment'),
    cfg = require('./../config');

// schema define
var fileSchema = new Schema({
  _id: Number,
  fileName: {type: String, default: '' },
  fileUploadedDate: { type: Date, default: Date.now },
  fileUserUpload: { type: String, default: '' },
  fileClientName: { type: String, default: '' },
  fileWsType: { type: String, default: '' },
});

// create user and return fields when done
module.exports.createLog = function(data,callback){
    // open connection to mongodb - database demo
    var	connection = mongoose.createConnection(cfg.dbURI);
    // initialize increment feature for connection
    autoIncrement.initialize(connection);
    // plug increment feature to model
    fileSchema.plugin(autoIncrement.plugin, {model:'file', field:'_id'});
    // create model
    var file = connection.model('file', fileSchema);
    //jsonUser.password = sha512(jsonUser.password);
    var f = new file(data);
    console.log('create file record...');
    f.save(function (err,l) {
        if (err) return console.error(err);
        console.log('create file success');
        callback({success:true, msg:l});
    });
}
module.exports.getLogs = function(query,fields,callback){
    console.log('get files...');
    console.log(query);
    var	connection = mongoose.createConnection(cfg.dbURI);
    var f = connection.model('file', fileSchema);
    f.find(query,fields,function(err,logs){
      if (err) return console.error(err);
      connection.close();
      callback(logs);
    });
}
