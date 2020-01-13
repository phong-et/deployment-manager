module.exports = {
  mongoose: require('mongoose'),
  Schema: function() {
    var me = this, mongoose = me. mongoose
    return mongoose.Schema
  },
  //autoIncrement: require('mongoose-auto-increment'),
  cfg: require('./../config'),
  log : console.log,
  fileSchema: function(){
    var me = this, Schema = me.Schema
    return new Schema({
      _id: Number,
      fileName: { type: String, default: '' },
      fileUploadedDate: { type: Date, default: Date.now },
      fileUserUpload: { type: String, default: '' },
      fileClientName: { type: String, default: '' },
      fileWsType: { type: String, default: '' },
    })
  },
  createLogFile: function (data, callback) {
    let me = this, log = me.log, autoIncrement = require('mongoose-auto-increment')
    log('logging...');
    // open connection to mongodb - database demo
    var connection = me.mongoose.createConnection(me.cfg.dbURI);
    // initialize increment feature for connection
    autoIncrement.initialize(connection);
    // plug increment feature to model
    me.fileSchema.plugin(autoIncrement.plugin, { model: 'file', field: '_id' });
    // create model
    var file = connection.model('file', me.fileSchema);
    //jsonUser.password = sha512(jsonUser.password);
    var f = new file(data);
    log('create file record...');
    f.save(function (err, l) {
      if (err) return console.error(err);
      log('create file success');
      callback({ success: true, msg: l });
    });
  },
  getFiles : function (query, fields, callback) {
    let log = this.log
    log('get files...');
    log(query);
    var connection = mongoose.createConnection(cfg.dbURI);
    var f = connection.model('file', fileSchema);
    f.find(query, fields, function (err, files) {
      if (err) return console.error(err);
      connection.close();
      callback(files);
    });
  }
}
