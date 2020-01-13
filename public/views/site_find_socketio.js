/**
 * Created by Phillipet on 11/15/2015.
 */
socket.on('createRdgFile',function(fileName){
    window.open(fileName, '_blank');

    // send a message to delete file after sencond
    // socket.emit('deleteRdg');
});
socket.on('exportText',function(fileName){
    window.open(fileName, '_blank');
});
socket.on('exportJson',function(fileName){
    window.open('/backup/' + fileName, '_blank');
});
socket.on('addSite',function(status){
    if(status==true)(alert('ok'));
});
socket.on('findSites',function(records){
    //Ext.getCmp('gridSite').getStore().fields.item('batUploaded').defaultValue = false;
    Ext.getCmp('gridSite').getStore().loadData(records);
    // show icon upload zip file
    gGroups = storeSite.getGroups();
    for(var i=0; i<gGroups.length; i++){
        for(var j=0; j<gGroups.items[i].length; j++){
            storeSite.findRecord('siteUrl',gGroups.items[i].items[0].data["siteUrl"]).set('zipUpload',0);
            j=gGroups.items[i].length;
        }
    }

    // show button
    var bt = Ext.getCmp('btFind')
    bt.setIconCls('findCls');
    bt.setDisabled(false);
});
socket.on('reFind',function(records){
    Ext.getCmp('gridSite').getStore().add(records);
});

socket.on('getSubClientsByClient',function(subClients){
    Ext.getCmp('txtSubClientNames').getStore().loadData(subClients);
});


// ====================== USER ======================================
socket.on('getUsers',function(records){
    Ext.getCmp('gridUser').getStore().loadData(records);
});
socket.on('conflictLogin',function(data){
    Ext.Msg.prompt('Conflict', 'Anyone just login by this account', function(btn, text){
        if (btn == 'ok'){
            // process text value and close...
            socket.disconnect();
            location.reload();
        }
    });
});
var wsType = [[0,'All'],[25,'ADMIN'],[3,'AGENT'],[18,'AGENT Cash'],[35,'AGENT TEST'],[22,'API'],[41,'BANNER'],[6,'BO'],[33,'BO Test'],[34,'BO TRAIN'],[19,'CASINO LINK'],[12,'CHAT'],[9,'EGAME'],[27,'EGAME COMM'],[40,'INDEX'],[24,'LAPI'],[8,'MAIL'],[1,'MAIN'],[16,'MAIN TEST'],[26,'MAINTENANCE'],[2,'MEMBER'],[17,'MEMBER TEST'],[31,'MRTG'],[20,'ODDS'],[14,'OM'],[15,'OTHERS'],[21,'PHONE'],[13,'REDIRECT'],[29,'REPORT'],[30,'SERVICE'],[10,'SHARECACHE'],[36,'SMART'],[32,'SPORT'],[7,'STATS'],[11,'VIDEO'],[5,'WAP AGENT'],[4,'WAP MEMBER']];
var wsTypeFind = function(id){
    for(var i=0; i<wsType.length; i++){
        if(wsType[i][0] == id)
            return wsType[i][1];
    }
};
socket.on('logginglogin', function (msg) {
    var log = $('#logging');
    //var strHtml = log.html();
    log.html(msg + '<br/>');
    var height = log[0].scrollHeight;
    log.scrollTop(height);
});
socket.on('logging',function(msg){
    var msgs = msg.split(' - ');
    var wsType = msgs[1];
    var wsTypeId = wsType.split('=')[1];
    var outputString = msgs[0] + '-' + wsTypeFind(wsTypeId);
    var log = $('#logging');
    var strHtml = log.html();
    log.html(strHtml + outputString + '<br/>');
    var height = log[0].scrollHeight;
    log.scrollTop(height);
});
socket.on('scraper-logger',function(msg){
    var log = $('#logging');
    log.append(msg + '<br/>');
    var height = log[0].scrollHeight;
    log.scrollTop(height);
});
socket.on('done-finding',function(msg){
    var log = $('#logging');
    var strHtml = log.html();
    log.html(strHtml +  msg  + '<br/>');
    var height = log[0].scrollHeight;
    log.scrollTop(height);
});

socket.on('login-again',function(msg){
    var log = $('#logging');
    log.html('have some network errors - try refresh again');
    var height = log[0].scrollHeight;
    log.scrollTop(height);
    // enable button
    var bt = Ext.getCmp('btFind')
    bt.setIconCls('findCls');
    bt.setDisabled(false);
});


socket.on('shareFR',function(data){
    if(data != undefined){
        if(data.length>0){
            Ext.getCmp('gridSite').getStore().loadData(data);
            Ext.getCmp('gridShareRecord').setHidden(true);

            Ext.getCmp('cbbGrouping').setValue('ipAddrL');
            //storeSite.setGroupField('ipAddrL');
            gGroups = storeSite.getGroups();
            for(var i=0; i<gGroups.length; i++){
                for(var j=0; j<gGroups.items[i].length; j++){
                    storeSite.findRecord('siteUrl',gGroups.items[i].items[0].data["siteUrl"]).set('zipUpload',0);
                    j=gGroups.items[i].length;
                }
            }
        }
    }
    else {
        alert('Record not found !');
    }
});
socket.on('refreshFR',function(data){
    if(data != undefined){
        if(data.length>0){
            Ext.getCmp('gridSite').getStore().loadData(data);
            Ext.getCmp('btRefreshGridSite').setDisabled(false);
            for(var i=0; i<gGroups.length; i++){
                for(var j=0; j<gGroups.items[i].length; j++){
                    storeSite.findRecord('siteUrl',gGroups.items[i].items[0].data["siteUrl"]).set('zipUpload',0);
                    j=gGroups.items[i].length;
                }
            }
            Ext.getCmp('cbbGrouping').setValue('ipAddrL');
            storeSite.setGroupField('ipAddrL');
        }
    }
    else {
        alert('Record not found !');
        Ext.getCmp('btRefreshGridSite').setDisabled(false);
    }
});
socket.on('reFind',function(data){
    if(data != undefined){
        if(data.length>0) {
            Ext.getCmp('gridSite').getStore().add(data);
        }
    }
    else{
        alert('data not found');
    }
});
// added 04/03/2016
socket.on('emptyFile',function(){
    $('#fileList').html('');
});

socket.on('change-password',function(data){
    alert(data);
});


