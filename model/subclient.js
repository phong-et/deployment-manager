var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	cfg = require('./../config');

	var subClientSchema = new Schema({
		_id:Number,
		subClientName:String,
		compType:Number,
		client:String
	});

// use for combo box auto complete 
module.exports.getSubClients = function(callback){
	var	connection = mongoose.createConnection(cfg.dbURI);
	var subClient = connection.model('subclient', subClientSchema);				
	// get list client
	console.log('find subClients');	
	subClient.find({},'_id subClientName',function(err, docs){
		if (err) return handleError(err);
		console.log('=>subClients.length=%s',docs.length);
		//console.log(docs);
		connection.close(function(){console.log('connection is closed !!!');});
		callback(docs);
	});			
}
module.exports.getSubClientsByClient = function(clientName,callback){
	var	connection = mongoose.createConnection(cfg.dbURI);
	var subClient = connection.model('subclient', subClientSchema);				
	// get list client
	console.log('find subClients:%s',clientName);
	subClient.find({client:clientName},'_id subClientName',function(err, docs){
		if (err) return handleError(err);
		console.log('=>subClients.length=%s',docs.length);
		//console.log(docs);
		connection.close(function(){console.log('connection is closed !!!');});
		callback(docs);
	});			
}

// =============================== SAVE ========================
function insert(){
	var subClients = [{_id:1, subClientName:'LIGA365', compType:13, client:'LIGA'},
		{_id:2, subClientName:'INDOBET365', compType:47, client:'LIGA'},
		{_id:3, subClientName:'323BET', compType:48, client:'LIGA'},
		{_id:4, subClientName:'HANABET', compType:49, client:'LIGA'},
		{_id:5, subClientName:'LIGABOLA', compType:50, client:'LIGA'},
		{_id:6, subClientName:'FT95', compType:52, client:'LIGA'},
		{_id:7, subClientName:'LIGA88', compType:53, client:'LIGA'},
		{_id:8, subClientName:'OLB365', compType:54, client:'LIGA'},
		{_id:9, subClientName:'BOLA228', compType:55, client:'LIGA'},
		{_id:10, subClientName:'AFB365', compType:56, client:'LIGA'},
		{_id:11, subClientName:'KLIK365', compType:57, client:'LIGA'},
		{_id:12, subClientName:'WIN228', compType:58, client:'LIGA'},
		{_id:13, subClientName:'INIDEWA365', compType:59, client:'LIGA'},
		{_id:14, subClientName:'BOLAPELANGI', compType:60, client:'LIGA'},
		{_id:15, subClientName:'9IKANBET', compType:62, client:'LIGA'},
		{_id:16, subClientName:'IM2BET', compType:63, client:'LIGA'},
		{_id:17, subClientName:'SOTOBET', compType:64, client:'LIGA'},
		{_id:18, subClientName:'AQ88BET', compType:65, client:'LIGA'},
		{_id:19, subClientName:'PASARANMURAH', compType:67, client:'LIGA'},
		{_id:20, subClientName:'UTAMABET', compType:68, client:'LIGA'},
		{_id:21, subClientName:'JASABOLA', compType:69, client:'LIGA'},
		{_id:22, subClientName:'MALAIKATBET', compType:70, client:'LIGA'},
		{_id:23, subClientName:'KLIKBET', compType:72, client:'LIGA'},
		{_id:24, subClientName:'LAPAK365', compType:74, client:'LIGA'},
		{_id:25, subClientName:'KAPALJUDI', compType:75, client:'LIGA'},
		{_id:26, subClientName:'INDOMAXBET', compType:76, client:'LIGA'},
		{_id:27, subClientName:'BOLA855', compType:77, client:'LIGA'},
		{_id:28, subClientName:'BOLA168', compType:78, client:'LIGA'},
		{_id:29, subClientName:'DBSBET', compType:79, client:'LIGA'},
		{_id:30, subClientName:'HOKI365', compType:80, client:'LIGA'},
		{_id:31, subClientName:'INDOWINS', compType:81, client:'LIGA'},
		{_id:32, subClientName:'LIGAEMAS', compType:82, client:'LIGA'},
		{_id:33, subClientName:'LIGA365ORG', compType:83, client:'LIGA'},
		{_id:34, subClientName:'SSSBET', compType:2, client:'UBO'},
		{_id:35, subClientName:'SSBET', compType:3, client:'UBO'},
		{_id:36, subClientName:'BOLA88', compType:11, client:'UBO'},
		{_id:37, subClientName:'UBOBET', compType:15, client:'UBO'},
		{_id:38, subClientName:'PASARDEWA (AMPMBET)', compType:16, client:'UBO'},
		{_id:39, subClientName:'BOLA828', compType:17, client:'UBO'},
		{_id:40, subClientName:'BOLAKLIK', compType:18, client:'UBO'},
		{_id:41, subClientName:'BOLAONLINE', compType:19, client:'UBO'},
		{_id:42, subClientName:'W1BET (INDOSOCCERS)', compType:20, client:'UBO'},
		{_id:43, subClientName:'ROOMVIP88 (MARKASBOLA188)', compType:21, client:'UBO'},
		{_id:44, subClientName:'API | SPORT', compType:22, client:'UBO'},
		{_id:45, subClientName:'OSG168', compType:23, client:'UBO'},
		{_id:46, subClientName:' KLIKFIFA (S88BET)', compType:24, client:'UBO'},
		{_id:47, subClientName:'VIPBET88', compType:25, client:'UBO'},
		{_id:48, subClientName:'JAVABET (ZONAWIN)', compType:26, client:'UBO'},
		{_id:49, subClientName:'FS88BET', compType:27, client:'UBO'},
		{_id:50, subClientName:'337SPORTS', compType:28, client:'UBO'},
		{_id:51, subClientName:'MGS188 (ASIANBETTOR)', compType:29, client:'UBO'},
		{_id:52, subClientName:'BURSALIGA', compType:30, client:'UBO'},
		{_id:53, subClientName:'MBCBET', compType:31, client:'UBO'},
		{_id:54, subClientName:'SOGOBET', compType:32, client:'UBO'},
		{_id:55, subClientName:'RBO88', compType:33, client:'UBO'},
		{_id:56, subClientName:'NAGABOLA', compType:34, client:'UBO'},
		{_id:57, subClientName:'BOLA789', compType:35, client:'UBO'},
		{_id:58, subClientName:'GOLBOS (SUPER1388BET)', compType:36, client:'UBO'},
		{_id:59, subClientName:'SBFBET', compType:37, client:'UBO'},
		{_id:60, subClientName:'7UPBET', compType:38, client:'UBO'},
		{_id:61, subClientName:'AIRASIABET (BOLAGILA , 303BET)', compType:39, client:'UBO'},
		{_id:62, subClientName:'BOLACASH', compType:40, client:'UBO'},
		{_id:63, subClientName:'LIGACASH', compType:41, client:'UBO'},
		{_id:64, subClientName:'7METER', compType:42, client:'UBO'},
		{_id:65, subClientName:'UBOCASH', compType:43, client:'UBO'},
		{_id:66, subClientName:'ANDROBET', compType:44, client:'UBO'},
		{_id:67, subClientName:'WLAG', compType:45, client:'UBO'},
		{_id:68, subClientName:'ODDSNWIN', compType:46, client:'UBO'},
		{_id:69, subClientName:'INDOMACAU', compType:47, client:'UBO'},
		{_id:70, subClientName:'DEWACASH', compType:48, client:'UBO'},
		{_id:71, subClientName:'CBOBET', compType:49, client:'UBO'},
		{_id:72, subClientName:'303VIP', compType:50, client:'UBO'},
		{_id:73, subClientName:'SODABET', compType:51, client:'UBO'},
		{_id:74, subClientName:'CICOBET', compType:52, client:'UBO'},
		{_id:75, subClientName:'TOKECASH', compType:53, client:'UBO'},
		{_id:76, subClientName:'BETLIVE88', compType:54, client:'UBO'},
		{_id:77, subClientName:'JALURJUDI', compType:55, client:'UBO'},
		{_id:78, subClientName:'BEINCASH', compType:56, client:'UBO'},
		{_id:79, subClientName:'SKOR88', compType:57, client:'UBO'},
		{_id:80, subClientName:'OBCCASH', compType:58, client:'UBO'},
		{_id:81, subClientName:'IDRBOLA (INDO789)', compType:59, client:'UBO'},
		{_id:82, subClientName:'BALIBOLA333', compType:60, client:'UBO'},
		{_id:83, subClientName:'PUSAKA88', compType:61, client:'UBO'},
		{_id:84, subClientName:'PIALABOLA', compType:62, client:'UBO'},
		{_id:85, subClientName:'IDRLIGA', compType:63, client:'UBO'},
		{_id:86, subClientName:'BOLABET888 (BOLABET889)', compType:64, client:'UBO'},
		{_id:87, subClientName:'99ONLINEBOLA', compType:65, client:'UBO'},
		{_id:88, subClientName:'GALATAMACASH', compType:66, client:'UBO'},
		{_id:89, subClientName:'JOKERBOLA', compType:67, client:'UBO'},
		{_id:90, subClientName:'AFB88 ', compType:0, client:'AFB'},
		{_id:91, subClientName:'CBV855', compType:0, client:'AFB'},
		{_id:92, subClientName:'KLIKBET', compType:0, client:'AFB'},
		{_id:93, subClientName:'KWIN2541', compType:0, client:'AFB'},
		{_id:94, subClientName:'BOLA858', compType:0, client:'AFB'},
		{_id:95, subClientName:'FLBET', compType:0, client:'AFB'},
		{_id:96, subClientName:'LIGA757', compType:0, client:'AFB'},
		{_id:97, subClientName:'GOLDEN818 ', compType:0, client:'AFB'},
		{_id:98, subClientName:'INDOWIN18', compType:0, client:'AFB'},
		{_id:99, subClientName:'ITUBOLA', compType:0, client:'AFB'},
		{_id:100, subClientName:'I1BET88', compType:0, client:'AFB'},
		{_id:101, subClientName:'1BCBET', compType:0, client:'AFB'},
		{_id:102, subClientName:'365FLB', compType:0, client:'AFB'},
		{_id:103, subClientName:'SAYABOLA', compType:0, client:'AFB'},
		{_id:104, subClientName:'LIGA188', compType:0, client:'AFB'},
		{_id:105, subClientName:'OMI88', compType:0, client:'AFB'},
		{_id:106, subClientName:'PARADISE VEGAS', compType:0, client:'AFB'},
		{_id:107, subClientName:'RAJABOLA88', compType:0, client:'AFB'},
		{_id:108, subClientName:'LIGA101', compType:0, client:'AFB'},
		{_id:109, subClientName:'SIN88', compType:0, client:'AFB'},
		{_id:110, subClientName:'POPZA88', compType:0, client:'AFB'}];
		
	subClientSchema = new Schema({
		_id:Number,
		subClientName:String,
		compType:Number,
		client:String
	},{versionKey:false});
	
	mongoose.connect(cfg.dbURI);
	
	var subClient = mongoose.model('subclient',subClientSchema);
	subClient.create(subClients,function(err, docs){
		console.log('create subClients success');
		console.log(docs);
		mongoose.disconnect();
	});
}
//insert();
