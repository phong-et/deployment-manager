var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	cfg = require('./../config');

var siteSchema = new Schema({
	_id:Number,
	siteUrl: String,
	clientName:String,
	subClientName:String,
	wsType:String,
	ipAddrP:{type:String, default:null},
	ipAddrL:String,
	remotePort:{type:String, default:null},
	webFolder:{type:String, default:null}
});
function add(jsonSite,callback){	

	// open connection to mongodb
	var	connection = mongoose.createConnection(cfg.dbURI);
	
	// initialize increment feature for connection
	autoIncrement.initialize(connection);
	
	// plug increment feature to model 
	siteSchema.plugin(autoIncrement.plugin, {model:'site', field:'_id'});

	var site = connection.model('site', siteSchema);	
	
	//console.log('save site...');
	isExists(jsonSite.siteUrl,site,function(bool){
		if(bool==true){
			console.log('==>site is exists');
			connection.close(function(){console.log('connection is closed!');});
		}
		else{
			var s = new site(jsonSite);
			s.save(function (err) {
				if (err) return console.error(err);		
				console.log('==>added a site');
				connection.close(function(){console.log('connection is closed!');});
				callback(true);
			});
		}
	})
	
}
// check a site is exists
function isExists(siteUrl,siteModel,callback){
	console.log('check site exists...');
	siteModel.findOne({siteUrl:siteUrl},'siteUrl',function(err,docs){
		if (err) return console.error(err);		
		var isExists = true;
		if(docs == null) isExists = false 
		console.log('isExists=%s',isExists);
		callback(isExists);
	});
}
module.exports.add = add;
/*
add({
	clientName: "LIGA",
	folderPath: "a",
	id: "site-11",
	ipAddrL: "192.168.99.150",
	ipAddrP: "125.252.101.44",
	remotePort: "192.168.99.150",
	siteUrl: "www.idb365.com",
	subClientName: "INDOBET365",
	wsType: "MAIN"
	},
	function(a){	
	console.log(a);
})*/