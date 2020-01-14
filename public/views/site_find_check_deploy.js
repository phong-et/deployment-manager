/**
 * Created by Phillipet on 11/20/2015.
 */

function getQueryParam(name, queryString) {
    var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
    return match && decodeURIComponent(match[1]);
}

var gGroups;
Ext.define('site', {
    extend: 'Ext.data.Model',
    fields: ['siteUrl','clientName','subClientName','wsType','ipAddrL','folderPath', 'checked','batUpload', 'gnp',
        {
            name: 'ipAddrL',
            //mapping: 'continent',
            convert: function(v, record) {
                return v;
            }
        }]
});
Ext.define('subclient', {
    extend: 'Ext.data.Model',
    fields: ['_id','subClientName']
});
var storeSite = Ext.create('Ext.data.Store', {
    model: 'site',
    groupField: 'ipAddrL'
});
var storeSubClient = Ext.create('Ext.data.Store', {
    model: 'subclient',
});

var storeGrouping = new Ext.data.ArrayStore({
    fields: ['gId','gName'],
    data: [['subClientName', 'Name'],['ipAddrL', 'IP']]
});

//var wsType = [[0,'All'],[25,'ADMIN'],[3,'AGENT'],[18,'AGENT Cash'],[35,'AGENT TEST'],[22,'API'],[41,'BANNER'],[6,'BO'],[33,'BO Test'],[34,'BO TRAIN'],[19,'CASINO LINK'],[12,'CHAT'],[9,'EGAME'],[27,'EGAME COMM'],[40,'INDEX'],[24,'LAPI'],[8,'MAIL'],[1,'MAIN'],[16,'MAIN TEST'],[26,'MAINTENANCE'],[2,'MEMBER'],[17,'MEMBER TEST'],[31,'MRTG'],[20,'ODDS'],[14,'OM'],[15,'OTHERS'],[21,'PHONE'],[13,'REDIRECT'],[29,'REPORT'],[30,'SERVICE'],[10,'SHARECACHE'],[36,'SMART'],[32,'SPORT'],[7,'STATS'],[11,'VIDEO'],[5,'WAP AGENT'],[4,'WAP MEMBER']];
var wsType = [['ag', 'AGENT'], ['mb', 'MEMBER'], ['mo', 'MOBILE']]; //[[3,'AGENT'],[22,'API'],[1,'MAIN'],[2,'MEMBER'],[20,'ODDS'],[32,'SPORT'],[4,'WAP MEMBER'],[45,'WALLET']];
//var wsType = [{wsTypeId:3,wsTypeName:'AGENT'},{wsTypeId:1,wsTypeName:'MAIN'},{wsTypeId:2,wsTypeName:'MEMBER'},{wsTypeId:20,wsTypeName:'ODDS'},{wsTypeId:30,wsTypeName:'SERVICE'},{wsTypeId:32,wsTypeName:'SPORT'}];
//var wsType=[{wsTypeId:0,wsTypeName:'All'},{wsTypeId:25,wsTypeName:'ADMIN'},{wsTypeId:3,wsTypeName:'AGENT'},{wsTypeId:18,wsTypeName:'AGENT Cash'},{wsTypeId:35,wsTypeName:'AGENT TEST'},{wsTypeId:22,wsTypeName:'API'},{wsTypeId:41,wsTypeName:'BANNER'},{wsTypeId:6,wsTypeName:'BO'},{wsTypeId:33,wsTypeName:'BO Test'},{wsTypeId:34,wsTypeName:'BO TRAIN'},{wsTypeId:19,wsTypeName:'CASINO LINK'},{wsTypeId:12,wsTypeName:'CHAT'},{wsTypeId:9,wsTypeName:'EGAME'},{wsTypeId:27,wsTypeName:'EGAME COMM'},{wsTypeId:40,wsTypeName:'INDEX'},{wsTypeId:24,wsTypeName:'LAPI'},{wsTypeId:8,wsTypeName:'MAIL'},{wsTypeId:1,wsTypeName:'MAIN'},{wsTypeId:16,wsTypeName:'MAIN TEST'},{wsTypeId:26,wsTypeName:'MAINTENANCE'},{wsTypeId:2,wsTypeName:'MEMBER'},{wsTypeId:17,wsTypeName:'MEMBER TEST'},{wsTypeId:31,wsTypeName:'MRTG'},{wsTypeId:20,wsTypeName:'ODDS'},{wsTypeId:14,wsTypeName:'OM'},{wsTypeId:15,wsTypeName:'OTHERS'},{wsTypeId:21,wsTypeName:'PHONE'},{wsTypeId:13,wsTypeName:'REDIRECT'},{wsTypeId:29,wsTypeName:'REPORT'},{wsTypeId:30,wsTypeName:'SERVICE'},{wsTypeId:10,wsTypeName:'SHARECACHE'},{wsTypeId:36,wsTypeName:'SMART'},{wsTypeId:32,wsTypeName:'SPORT'},{wsTypeId:7,wsTypeName:'STATS'},{wsTypeId:11,wsTypeName:'VIDEO'},{wsTypeId:5,wsTypeName:'WAP AGENT'},{wsTypeId:4,wsTypeName:'WAP MEMBER'}];
var wsTypeFindByName = function(name){
    for(var i=0; i<wsType.length; i++){
        if(wsType[i][1] == name)
            return wsType[i][0]
    }
};
var wsTypeFindById = function(id){
    for(var i=0; i<wsType.length; i++){
        if(wsType[i][0] == id)
            return wsType[i][1];
    }
};
var storeWsType = new Ext.data.ArrayStore({
    fields: ['wsTypeId','wsTypeName'],
    data: wsType
});
var storeAuth = new Ext.data.ArrayStore({
    fields: ['authId','authName'],
    data: [[true,'Force Auth'],[false,'None Auth']]
});
/*
var wsTypeFindById = function(id){
    for(var i=0; i<wsType.length; i++){
        if(wsType[i]["wsTypeId"] == id)
            return wsType[i][1];
    }
};
Ext.define('wsType', {
    extend: 'Ext.data.Model',
    fields: ['wsTypeId','wsTypeName']
});
var storeWsType = Ext.create('Ext.data.Store', {
    model: 'wsType',
    data:wsType
});
*/
Ext.tip.QuickTipManager.init();
// Global variable
var isLoadedGridUser;
/* use for check deploying
format:[{
    "fileName":"Default8.aspx",
    "modifiedDate":"11/17/2015 1:42:47 PM"
    },
    {
        "fileName":"bin/wsligweb_v6.dll",
        "modifiedDate":"1/1/1601 7:00:00 AM"
    }]
*/
var jsonObjsZipFile;

// format: <host>/GetDateModifiedOfFiles.aspx?files=Default8.aspx,_view/BettingRules8..aspx,bin/wsligweb_v6.dll
var filesParam = '';

var urlCheckingDefault = 'http://localhost/wsligweb_v6';

// contain info failed files
var jsonFailed = [];
/*
var featureOnExpand = Ext.create('Ext.grid.feature.Grouping', {
    startCollapsed: true,
    //id:'onExpand',
    disabled:false,
    groupers: [{
        property: 'asset',
        groupFn: function (val) {
            return val.data.name;
        }
    }]
});
var featureOffExpand = Ext.create('Ext.grid.feature.Grouping', {
    startCollapsed: true,
    id:'offExpand',
    //disabled:true,
    groupers: [{
        property: 'asset',
        groupFn: function (val) {
            return val.data.name;
        }
    }]
});
*/

var feature = Ext.create('Ext.grid.feature.Grouping', {
    startCollapsed: false,
   /* groupers: [{
        property: 'asset',
        groupFn: function (val) {
            return val.data.name;
        }
    }]
    */
});
function openLive(hostName){
    window.open(hostName + 'LiveTV.aspx?Channel=63&amp;ClosingDate=3/17/2016 10:00:00 AM&amp;h=Santos+Laguna&amp;a=Club+America&amp;mt=CONCACAF+CHAMPIONS+LEAGUE&amp;pid=1275|6311|3294', 'LiveTV', 'width=590,height=425,top=50,left=100,toolbars=no,scrollbars=yes,status=no,resizable=yes');
}
function getHttpHttps(){
    return Ext.getCmp('rbProtocolMode').getValue().rbProtocol + '://';
}
Ext.onReady(function() {
    var grid = Ext.create('Ext.grid.Panel',{
        id: 'gridSite',
        title: 'SubClient list',
        header:false,
        resizable: false,
        height:Ext.getBody().getViewSize().height,
        width: Ext.getBody().getViewSize().width,
        store: storeSite,
        selType: 'cellmodel',
        plugins: [{
            ptype: 'cellediting',
            clicksToEdit:2
            },
            //'headerfiltering'
        ],
        features: [
            //feature
            //featureOffExpand,
            //featureOnExpand
            //{ ftype: 'grouping' }
            Ext.create('Ext.grid.feature.GroupingSummary', {
                id: 'groupSummary',
                startCollapsed: true,
                showSummaryRow: false,
                //groupHeaderTpl: '{name} ({rows.length} {[values.rows.length > 1 ? "Records" : "Record"]})'
                groupHeaderTpl: [
                    '<div style="color:#d14836; font-weight: bold">{name:this.formatName}<span style="color:green; font-weight: normal">({rows.length} {[values.rows.length > 1 ? "Records" : "Record"]})</span></div>',
                    {
                        formatName: function(name) {
                            for(var i=0; i<gGroups.items.length; i++){
                                 if(name == gGroups.items[i]._groupKey){
                                    return '<span style="color:green">[' + (i+1) +']</span> ' +  name;
                                 }
                            }
                            //return Ext.String.trim(name);
                        }
                    }
                ]
            })
        ],
        masked:true,
        //multiSelect: true,
        // selModel: Ext.create('Ext.selection.CheckboxModel', {
        //     mode: 'SIMPLE',
        //     listeners: {
        //         selectionchange: function (model, selections) {
        //
        //         }
        //     }
        // }),
        columns:[
            new Ext.grid.RowNumberer({text: '', width:40}),
            { text: 'Domain', dataIndex: 'siteUrl', width:160,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="' + getHttpHttps() + value + '" target="_blank" title="go to site">' + value + '</a>';
                }
            },
            { text: 'Option', dataIndex: 'siteUrl', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/_bet/panel.aspx" target="_blank" title="go to site">Sport menu</a>';
                }
            },
			{ text: 'Main', dataIndex: 'siteUrl', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/Main.aspx" target="_blank" title="go to site">Main</a>';
                }
            },
            { text: 'Maintenance', dataIndex: 'siteUrl', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/maintenancepg.aspx" target="_blank" title="go to site">Maintenance</a>';
                }
            },
            {
                text: 'Remote', dataIndex: 'ipAddrL', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="aUpdate" href="#" title="add or update" onclick="return openRemoteDesktop(' + record + ');"><img src="images/site/update.png"/></a>';
                }
            },{ text: 'LiveTV', dataIndex: 'siteUrl', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/_view/LiveTV.aspx" target="_blank" title="go to site">LiveTV</a>';
                }
            },{ text: 'JSOdd1', dataIndex: 'siteUrl', width:300, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    var jsOdds = '<a class="siteUrl" href="http://' + value + '/_view/JSOdds1.aspx" target="_blank" title="go to site">JSOdds1</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOdds2.aspx" target="_blank" title="go to site">JSOdds2</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOddsFav1.aspx" target="_blank" title="go to site">JSOddsFav1</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOddsFav2.aspx" target="_blank" title="go to site">JSOddsFav2</a>';
                    return jsOdds;
                }
            },
            { text: 'Client', dataIndex: 'clientName', width: 100, hidden: true},
            { text: 'Sub Client', dataIndex: 'subClientName', width:150},
            { text: 'Type', dataIndex: 'wsType', width: 60},
            { type:'combo', text: 'IP Local', dataIndex: 'ipAddrL', width:130,
                // renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                //     return value;
                // },
                // editor:{
                //     type:'textfield',
                //     editable:false
                // }
                //     editor: {
                //         xtype: 'combobox',
                //         typeAhead: true, triggerAction: 'all', queryMode: 'local',
                //         store: new Ext.data.ArrayStore({
                //              data: [1234,123,444],
                //              fields: [
                //                   {name: 'value', type: 'int'},
                //              ]
                //         }),
                //         listeners: {
                //              select: 'onChangeTeam'
                //         }
                //    }
                // editor: new Ext.form.field.ComboBox({
                //     store: App.store.Prices,
                //     displayField: 'period_unit_name',
                //     valueField: 'id',
                //     listeners: {
                //       beforequery: function(queryEvent){
                //           queryEvent.combo.store.filter('product_id', /* the id of the product goes here */);
                //       }    
                //   }
                // })
            },
            { 
                text: 'ID', dataIndex: 'serverId', width:50, tooltip:"Main Server Id"
            },
            { 
                text: 'Folder web', dataIndex: 'folderPath', width:300,
                editor:{
                    type:'textfield'
                }
            },{ // get folderPath
                // change icon very very great : http://www.learnsomethings.com/2011/09/25/the-new-extjs4-xtype-actioncolumn-in-a-nutshell/
                xtype: 'actioncolumn',
                width: 30,
                tooltip:'Get folder path of website project',
                sortable: false,
                menuDisabled: true,
                text:'Get Folder',
                items: [{
                    iconCls: 'hasNotFolderCls',
                    getClass: function (value, meta, record, rowIndex, colIndex) {
                        var folderPath = record.get('folderPath');
                        var iconCls = '';
                        if(folderPath == '')    iconCls='hasNotFolderCls';
                        else if(folderPath==' ')  iconCls='checkingCls';
                        else iconCls='hasFolderCls';
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {
                        // prevent click after done
                        if(grid.getStore().getAt(rowIndex).get('folderPath') != '') return;

                        // create request to express server
                        grid.getStore().getAt(rowIndex).set('folderPath',' '); // start checking
                        // check url
                        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
                        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                        filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
                        if(isUseUrlCheckingDefault==false) {
                            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
                            // filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
                        }
                        Ext.Ajax.request({
                            url: 'checkdate/get-date-modified',
                            params:{filesParam:filesParam,siteName:siteName},
                            success: function(response) {
                                // parse jsonString from server
                                var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g,'\\\\'));
                                if(jsonObjsFromSite.path != undefined)
                                    grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                else{
                                    grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.msg);
                                    var path = jsonObjsFromSite.msg.substr(21,jsonObjsFromSite.msg.length-3);
                                    var pathElements = path.split('\\');
                                    var lastPathElement = pathElements[pathElements.length-1];
                                    grid.getStore().getAt(rowIndex).set('folderPath',path.substr(0,path.length - lastPathElement.length));
                                }
                            },
                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
                                grid.getStore().getAt(rowIndex).set('folderPath','server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }]
            },{ xtype: 'actioncolumn',
                width: 30,
                tooltip:'Upload zip file to server for deploying',
                sortable: false,
                menuDisabled: true,
                text:'Zip Upload',
                items: [{
                    iconCls: 'zipUploadCls',
                    getClass: function (value, meta, record, rowIndex, colIndex) {
                        var iconCls = '';
                        var zipUpload = record.get('zipUpload');
                        switch (zipUpload){
                            case 0: iconCls='zipUploadCls';     break;
                            case 1: iconCls='checkingCls';      break;
                            case 2: iconCls='zipUploadedCls';   break;
                            case 3: iconCls='zipUploadErrCls';  break;
                            case 4: iconCls='zipUploadEmptyCls';  break;
                        }
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {

                        var dzFileName = Ext.getCmp('dzFileName').getValue();
                        if(dzFileName == ''){
                            Ext.Msg.alert('Missing params','Zip File haven\'t uploaded yet');
                            return;
                        }

                        // prevent click after done
                        var doAction = grid.getStore().getAt(rowIndex).get('zipUpload');
                        //alert(doAction)
                        if(doAction == "3" || doAction == 3 || doAction == "4" || doAction == 4 ){
                            //Ext.Msg.alert('Info','Can\'t not do this action')
                            return;
                        }
                        // done uploading zip file
                        else if(doAction == 2 || doAction == "2"){
                            var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue() + '/Public/GetDateModifiedOfFiles.aspx';
                            var serverId = grid.getStore().getAt(rowIndex).get('serverId')
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            // create request to express server
                            grid.getStore().getAt(rowIndex).set('zipUpload', 1); // start checking
                            Ext.Ajax.request({
                                url: 'checkdate/upload-zip-deploy',
                                params: {siteName: siteName, serverId:serverId, dzFileName: dzFileName, action:'e'},
                                success: function (response) {
                                    // parse jsonString from server
                                    var jsonR = JSON.parse(response.responseText);
                                    if (jsonR.success == true)
                                        grid.getStore().getAt(rowIndex).set('zipUpload', 4);
                                    else {
                                        grid.getStore().getAt(rowIndex).set('zipUpload', 3);
                                        Ext.Msg.alert('Error Upload', jsonR.msg);
                                    }
                                },
                                failure: function (response) {
                                    console.log('server-side failure with status code ' + response.status);
                                    grid.getStore().getAt(rowIndex).set('zipUpload', 3);
                                    Ext.Msg.alert('Error Upload', 'server-side failure with status code ' + response.status);
                                }
                            });
                        }
                        // upload
                        else if(doAction == '') {
                            // check url
                            var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue() + '/Public/GetDateModifiedOfFiles.aspx';
                            var serverId = grid.getStore().getAt(rowIndex).get('serverId')
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            // create request to express server
                            grid.getStore().getAt(rowIndex).set('zipUpload', 1); // start checking
                            Ext.Ajax.request({
                                url: 'checkdate/upload-zip-deploy',
                                params: {siteName: siteName, serverId:serverId, dzFileName: dzFileName, action:'u'},
                                success: function (response) {
                                    // parse jsonString from server
                                    var jsonR = JSON.parse(response.responseText);
                                    if (jsonR.success == true)
                                        grid.getStore().getAt(rowIndex).set('zipUpload', 2);
                                    else {
                                        grid.getStore().getAt(rowIndex).set('zipUpload', 3);
                                        Ext.Msg.alert('Error Upload', jsonR.msg);
                                    }
                                },
                                failure: function (response) {
                                    console.log('server-side failure with status code ' + response.status);
                                    grid.getStore().getAt(rowIndex).set('zipUpload', 3);
                                    Ext.Msg.alert('Error Upload', 'server-side failure with status code ' + response.status);
                                }
                            });
                        }
                    }
                }]
            },{
                xtype: 'actioncolumn',
                width: 30,
                sortable: false,
                menuDisabled: true,
                tooltip:'Generate Bat File for Deploying',
                text:'Bat Generate',
                items: [{
                    iconCls: 'batUploadCls',
                    getClass: function (value, meta, record, rowIndex, colIndex) {
                        var batUploaded = record.get('batUpload');
                        var iconCls = '';
                        if(batUploaded == '')    iconCls='batUploadCls';
                        else if(batUploaded==' ')  iconCls='checkingCls';
                        else iconCls='batUploadedCls';
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {
                        // prevent click after done
                        if(grid.getStore().getAt(rowIndex).get('batUpload') == true) return;
                        //if(grid.getStore().getAt(rowIndex).get('folderPath') == '') { Ext.Msg.alert('Missing values','Folder path missing'); return};
                        if(Ext.getCmp('dzFileName').getValue() == '') { Ext.Msg.alert('Missing values','Zip File haven\'t uploaded yet'); return};

                        // check url
                        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue()  + '/Public/GetDateModifiedOfFiles.aspx';

                        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                        if(isUseUrlCheckingDefault==false) {
                            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                        }
                        var pathFolder = grid.getStore().getAt(rowIndex).get('folderPath');
                        //pathFolder = pathFolder.replace(/\\/g,'\/')
                        var bkFile = pathFolder + '.zip';
                        if(pathFolder.substr(pathFolder.length-1,1) == '\\') {
                            bkFile = pathFolder.substr(0, pathFolder.length - 1) + ".zip";
                        }
                        var nameBatFile = grid.getStore().getAt(rowIndex).get('ipAddrL') + '_' + grid.getStore().getAt(rowIndex).get('subClientName') + '_' + grid.getStore().getAt(rowIndex).get('siteUrl') + "_" + Ext.getCmp('rbBatMode').getValue().rb + ".bat";
                        // create nameBkFile
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //January is 0!
                        var yyyy = today.getFullYear();
                        if(dd<10) dd='0'+dd
                        if(mm<10) mm='0'+mm
                        today = yyyy + '' + mm + '' + dd;
                        var nameBkFile =  $('#txtUserName').val() + '_' + today;
                        var folderPath = grid.getStore().getAt(rowIndex).get('folderPath');
                        if(folderPath == '' || folderPath == ' '){
                            Ext.Msg.alert('Miss params', 'Folder path not exist');
                            return;
                        }
                        var params = {
                            dzFileName:Ext.getCmp('dzFileName').getValue(),
                            dzFileNameList:dzFileNameListGen(jsonObjsZipFile,folderPath),
                            bkFile:bkFile,
                            pathFolder:pathFolder,
                            nameBatFile:nameBatFile,
                            siteName:siteName,
                            batMode:Ext.getCmp('rbBatMode').getValue().rb,
                            nameBkFile:nameBkFile, // only use for BO team
                            isBKFull:Ext.getCmp('cbBackupFull').getValue()
                        };
                        // create request to server
                        grid.getStore().getAt(rowIndex).set('batUpload',' '); // start uploading
                        Ext.Ajax.request({
                            url: 'checkdate/generate-bat-file',
                            params:params,
                            success: function(response) {
                                var jsonResult = JSON.parse(response.responseText);
                                if(jsonResult.success==true) {
                                    grid.getStore().getAt(rowIndex).set('batUpload', true);
                                    // automatic checking after runbat - 15s default
                                    if(Ext.getCmp('cbAutoCheck').getValue() == true){
                                        var second = Ext.getCmp('txtCheckingTime').getValue()*1000;
                                        if(isNaN(second)) return;
                                        // start check auto
                                        grid.getStore().getAt(rowIndex).set('checked',1); // start checking
                                        setTimeout(function(){
                                            Ext.Ajax.request({
                                                url: 'checkdate/get-date-modified',
                                                params:{filesParam:filesParam,siteName:siteName},
                                                success: function(response) {
                                                    // parse jsonString from server
                                                    var jsonObjsFromSite = JSON.parse(response.responseText);
                                                    //console.dir(jsonObjsFromSite);

                                                    // compare two json object
                                                    var result = compare2Json(jsonObjsFromSite.files,jsonObjsZipFile);

                                                    //Ext.Msg.alert('Info Compare ZipFile & FromSite',JSON.stringify(result));
                                                    if(result.success == true){
                                                        grid.getStore().getAt(rowIndex).set('checked',2); // checkOk
                                                        grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                                    }
                                                    else {
                                                        grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                                        grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                                        jsonFailed[rowIndex]=result;
                                                    }
                                                    if(jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                                                        var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                                                        var sizeOfFile = fileInfo[1];
                                                        sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                                                        grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', fileInfo[0] + '-' + sizeOfFile + ' KB');
                                                    }
                                                },
                                                failure: function(response) {
                                                    console.log('server-side failure with status code ' + response.status);
                                                    grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                                    Ext.Msg.alert('Error genbat', 'server-side failure with status code ' + response.status);
                                                }
                                            });
                                        },second);
                                    }
                                    /*

                                    */
                                }
                                else{
                                    Ext.Msg.alert('Error generate Bat File',jsonResult.msg)
                                }
                            },

                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
                                grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                Ext.Msg.alert('Error genbat', 'server-side failure with status code ' + response.status);
                            }
                        });
                        // ==> use upload bat file method - fast but don't security
                        //var params = {
                        //    cmd:'UploadBatFile',
                        //    name:grid.getStore().getAt(rowIndex).get('siteUrl') + ".bat",
                        //    content:generateBatScript(grid.getStore().getAt(rowIndex).get('folderPath'),'Liga_New.zip'),
                        //    siteName:siteName
                        //};
                        //Ext.Ajax.request({
                        //    url: 'checkdate/upload-bat-file',
                        //    params:params,
                        //    success: function(response) {
                        //        var jsonResult = JSON.parse(response.responseText);
                        //        if(jsonResult.success==true)
                        //            grid.getStore().getAt(rowIndex).set('batUpload',true);
                        //        else{
                        //            Ext.Msg.alert('Error Upload Bat File - Deploy.aspx not exist',jsonResult.msg)
                        //        }
                        //    },
                        //
                        //    failure: function(response) {
                        //        console.log('server-side failure with status code ' + response.status);
                        //    }
                        //});
                    }
                }]
            },{
                // change icon very very great : http://www.learnsomethings.com/2011/09/25/the-new-extjs4-xtype-actioncolumn-in-a-nutshell/
                xtype: 'actioncolumn',
                width:30,
                sortable: false,
                tooltip:'Check latest deployed and bakup files',
                menuDisabled: true,
                text:'Check',
                //id:'btChecking',
                //dataIndex:'siteUrl',
                items: [{
                    text:'btChecking',
                    iconCls: 'checkCls',
                    getClass: function (value, meta, record, rowIndex, colIndex) {
                        var checked = record.get('checked');
                        var iconCls = '';
                        switch (checked){
                            case 0: iconCls='checkCls';     break;
                            case 1: iconCls='checkingCls';  break;
                            case 2: iconCls='checkOkCls';   break;
                            case 3: iconCls='checkKoCls';   break;
                        }
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {
                        //alert(this.items[0].iconCls);
                        //this.setIconCls('checkingCls');
                        if(grid.getStore().getAt(rowIndex).get('checked') == 2 ) return;
                        if(grid.getStore().getAt(rowIndex).get('checked') == 3 ) {
                            //Ext.Msg.alert('Info Deploy Failed',JSON.stringify(jsonFailed[rowIndex]));
                            alert(JSON.stringify(jsonFailed[rowIndex]));
                            return;
                        }
                        if(jsonObjsZipFile == undefined){
                            Ext.Msg.alert('Info','Zip File have not uploaded yet');
                            return;
                        }
                        // create request to express server
                        grid.getStore().getAt(rowIndex).set('checked',1); // start checking

                        // check url
                        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
                        filesParam = Ext.getCmp('filesParam').getValue();
                        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                        if(isUseUrlCheckingDefault==false) {
                            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
                            //filesParam = Ext.getCmp('filesParam').getValue();
                        }

                        Ext.Ajax.request({
                            url: 'checkdate/get-date-modified',
                            params:{filesParam:filesParam,siteName:siteName},
                            success: function(response) {
                                // parse jsonString from server
                                var rsText = response.responseText.replace(/\\/g,'\\\\');
                                //rsText = escapeHtml(rsText);
                                var jsonObjsFromSite = JSON.parse(rsText);
                                //console.dir(jsonObjsFromSite);

                                if(jsonObjsFromSite.files == undefined){
                                    grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.msg);
                                    var path = jsonObjsFromSite.msg.substr(21,jsonObjsFromSite.msg.length-3);
                                    grid.getStore().getAt(rowIndex).set('folderPath',path.substr(0,path.length-6));

                                    grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                    return ;
                                }
                                // compare two json object
                                var result = compare2Json(jsonObjsFromSite.files,jsonObjsZipFile);

                                //Ext.Msg.alert('Info Compare ZipFile & FromSite',JSON.stringify(result));
                                if(result.success == true){
                                    grid.getStore().getAt(rowIndex).set('checked',2); // checkOk
                                    if(jsonObjsFromSite.path.indexOf('Could not find file') != -1)
                                        grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                    else
                                        grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                }
                                else {
                                    grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                    grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                    jsonFailed[rowIndex]=result;
                                }
                                if(jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                                    var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                                    var sizeOfFile = fileInfo[1];
                                    sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                                    grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', fileInfo[0] + '-' + sizeOfFile + ' KB');
                                }
                            },
                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
                                grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                                Ext.Msg.alert('Error genbat', 'server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }]
            },{
                xtype: 'actioncolumn',
                width: 30,
                sortable: false,
                menuDisabled: true,
                tooltip:'Refresh row',
                text:'Refresh',
                items: [{
                    iconCls: 'refreshGridSiteCls',
                    handler: function (grid, rowIndex) {
                        if(Ext.getCmp('gridSite').getStore().getAt(rowIndex).get('zipUpload') != '')
                            Ext.getCmp('gridSite').getStore().getAt(rowIndex).set({checked:0,folderPath:'',batUpload:'',zipUpload:0,modifiedDateOfBKFile:'',webConfig:0});
                        else
                            Ext.getCmp('gridSite').getStore().getAt(rowIndex).set({checked:0,folderPath:'',batUpload:'',zipUpload:'',modifiedDateOfBKFile:'',webConfig:0});
                    }
                }]
            },{
                xtype: 'actioncolumn',
                width: 30,
                hidden:true,
                sortable: false,
                menuDisabled: true,
                tooltip:'create del',
                text:'Create Del',
                items: [{
                    iconCls: 'refreshGridSiteCls',
                    handler:function (grid, rowIndex, colIndex, item, e, record, row){
                        var path = record.get('folderPath');
                        if(path != '') {
                            var data = {
                                ipAddrL: record.get('ipAddrL'),
                                subClientName: record.get('subClientName'),
                                wsType: record.get('wsType'),
                                siteUrl:record.get('siteUrl'),
                                script: genDeleteBettingRules(path)
                            };
                            socket.emit('gen-delete-bt', data);
                        }
                        else alert('path folder blank')
                    }
                }]
            },{ text: 'Modified Date Of Backkup File', dataIndex: 'modifiedDateOfBKFile', width:510,
                editor:{
                    type:'textfield'
                }
            },{
                xtype: 'actioncolumn',
                width: 45,
                sortable: false,
                menuDisabled: true,
                tooltip:'Add Web.config',
                text:'AW',
                hidden:true,
                items: [{
                    iconCls: 'webConfigCls',
                    getClass: function(value, meta, record, rowIndex, colIndex) {
                        var webConfig = record.get('webConfig');
                        var iconCls = '';
                        switch (webConfig){
                            case 0: iconCls='webConfigCls';     break;
                            case 1: iconCls='checkingCls';  break;
                            //case 2: iconCls = 'webConfigGetOkCls' ; break;
                            case 3 : iconCls = 'zipUploadErrCls' ; break;
                            case 4 : iconCls = 'webConfigSaveOkCls' ; break;
                        }
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {
                        var wcAction = grid.getStore().getAt(rowIndex).get('webConfig');
                        if(wcAction == 4 ){ // done add
                            alert('Web.config has added');
                            return;
                        }
                        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
                        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                        if(isUseUrlCheckingDefault==false) {
                            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
                        }

                        grid.getStore().getAt(rowIndex).set('webConfig',1);

                        Ext.Ajax.request({
                            url: 'checkdate/add-web-config',
                            params: {
                                filesParam: filesParam,
                                siteName: siteName,
                                wcMode:'addWCF20170508AG',
                            },
                            success: function (response) {
                                // parse jsonString from server
                                var result = response.responseText.replace(/\r?\n|\r/g,' ');
                                result = JSON.parse(result);
                                if(result.success == true){
                                    // done add web.config
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','...'); // effect text
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',4);
                                }
                                else{
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',3);
                                }
                                setTimeout(function(){
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile',result.msg);
                                },500)

                            },
                            failure: function (response) {
                                console.log('server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }]
            },{
                xtype: 'actioncolumn',
                width: 45,
                sortable: false,
                menuDisabled: true,
                tooltip:'Edit Web.config',
                text:'EW',
                hidden:true,
                items: [{
                    iconCls: 'webConfigCls',
                    getClass: function(value, meta, record, rowIndex, colIndex) {
                        var webConfig = record.get('webConfig');
                        var iconCls = '';
                        switch (webConfig){
                            case 0: iconCls='webConfigCls';     break;
                            case 1: iconCls='checkingCls';  break;
                            case 2: iconCls = 'webConfigGetOkCls' ; break;
                            case 3 : iconCls = 'zipUploadErrCls' ; break;
                            case 4 : iconCls = 'webConfigSaveOkCls' ; break;
                        }
                        return iconCls;
                    },
                    handler: function (grid, rowIndex) {
                        var wcAction = grid.getStore().getAt(rowIndex).get('webConfig');
                        // wcAction 0 - start || 1 - doing || 2 get
                        var isUseUrlWebConfigForAll = Ext.getCmp('useUrlWebConfigForAll').getValue();

                        if(Ext.getCmp('rbWebConfigMode').getValue().rbwc == null || Ext.getCmp('rbWebConfigMode').getValue().rbwc == undefined){
                            alert('Select tag need edit');
                            return;
                        }
                        if(isUseUrlWebConfigForAll == true && (Ext.getCmp('txtSettingKeyValue').getValue() == '' || Ext.getCmp('txtSettingKeyValue').getValue() == null)){
                            alert('Setting Key Value is null');
                            return;
                        }
                        if(Ext.getCmp('txtSettingKeyName').getValue() == '' || Ext.getCmp('txtSettingKeyName').getValue() == null){
                            alert('Setting Key Name is null');
                            return;
                        }

                        if(wcAction == 4 ){ // done change
                            alert('Web.config has changed');
                            return;
                        }
                        // check url
                        //alert(wcAction);
                        if(wcAction != 2) grid.getStore().getAt(rowIndex).set('webConfig',1);
                        //if(wcAction == 2) Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','...'); // effect text
                        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
                        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                        if(isUseUrlCheckingDefault==false) {
                            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
                        }

                        Ext.Ajax.request({
                            url: 'checkdate/change-web-config',
                            params: {
                                filesParam: filesParam,
                                siteName: siteName,
                                settingKeyName:Ext.getCmp('txtSettingKeyName').getValue(),
                                settingKeyValue:isUseUrlWebConfigForAll==true?Ext.getCmp('txtSettingKeyValue').getValue():grid.getStore().getAt(rowIndex).get('modifiedDateOfBKFile'),
                                wcMode:Ext.getCmp('rbWebConfigMode').getValue().rbwc,
                                wcAction:wcAction==2?"w":"r"
                            },
                            success: function (response) {
                                // parse jsonString from server
                                var result = response.responseText.replace(/\r?\n|\r/g,' ');
                                result = JSON.parse(result);
                                if(result.success == true){
                                    if(wcAction != 2){
                                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',2); // get url value ok
                                    }
                                    else{
                                        // done editing web.config
                                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','...'); // effect text
                                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',4);
                                    }
                                }
                                else{
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',3);
                                }
                                setTimeout(function(){
                                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile',result.msg);
                                },500)

                            },
                            failure: function (response) {
                                console.log('server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }]
            }],
        tbar:[{
            xtype:'button',
            text:'Refresh',
            iconCls:'refreshGridSiteCls',
            id:'btRefreshGridSite',
            listeners:{
                click:function() {
                    Ext.getCmp('btRefreshGridSite').setDisabled(true);
                    socket.emit('refreshFR');
                }
            }
        },{
            xtype: 'combo',
            width: 85,
            store: ['Hard','Free'],
            queryMode: 'local',
            name: 'cbbModeQuery',
            //itemId:'cbbModeQuery',
            editable:false,
            id:'cbbModeQuery',
            value:'Hard',
            listeners:{
                change:function(cb,val){
                    if(val=='Free'){
                        Ext.getCmp('cbbSelectAll').setVisible(false);
                        Ext.getCmp('cbbClient').setVisible(false);
                        //storeSubClient.loadData([]);
                    }
                    else{
                        Ext.getCmp('cbbSelectAll').setVisible(true);
                        Ext.getCmp('cbbClient').setVisible(true);
                        //socket.emit('getSubClientsByClient','LIGA');')
                    }
                }
            },
            //disabled:true
            hidden:true,
        },{
            xtype: 'combo',
            width: 85,
            store:['LIGA','UBO','AFB'],
            queryMode: 'local',
            value:'LIGA',
            id:'cbbClient',
            listeners:{
                change:function(cb, val){
                    Ext.getCmp('txtSubClientNames').setValue(null);
                    Ext.getCmp('cbbSelectAll').setValue('Deselect All');
                    //socket.emit('getSubClientsByClient',val);
                }
            }
        },{
            xtype: 'combo',
            width: 125,
            store:['Select All','Deselect All'],
            queryMode: 'local',
            value:'Deselect All',
            id:'cbbSelectAll',
            listeners:{
                change:function(cb, val){
                    var combo = Ext.ComponentQuery.query('#txtSubClientNamesField')[0];
                    var records = combo.getStore().getRange();
                    if(val=='Select All'){
                        combo.setValue(records, false);
                    }
                    else
                        combo.setValue([], false);
                }
            }
        },{
            xtype: 'combo',
            labelWidth:100,
            width: 350,
            //fieldLabel: 'Client name',
            store:storeSubClient,
            displayField:'subClientName',
            valueField: 'subClientName',
            queryMode: 'local',
            //value:'LIGA365',
            id:'txtSubClientNames',
            itemId: 'txtSubClientNamesField',
            multiSelect :true,
            enableKeyEvents:true,
            //shiftKey :true,
            doQuery: function(queryString, forceAll) {
                this.expand();
                this.store.clearFilter(!forceAll);

                if (!forceAll) {
                    this.store.filter(this.displayField, new RegExp(Ext.String.escapeRegex(queryString), 'i'));
                }
            },
            listeners:{
               keydown:function(bt,e){
                   if(e.getKey() === e.ENTER && Ext.getCmp('cbbModeQuery').getValue() == 'Free'){
                       Ext.getCmp('btFind').fireEvent('click');
                       Ext.getCmp('txtSubClientNames').blur();
                   }
               }, keypress:function(bt,e){
                    if(e.getKey() === e.ENTER && Ext.getCmp('cbbModeQuery').getValue() == 'Free'){
                        Ext.getCmp('btFind').fireEvent('click');
                        Ext.getCmp('txtSubClientNames').blur();
                    }
                }, keyup:function(bt,e){
                    if(e.getKey() === e.ENTER && Ext.getCmp('cbbModeQuery').getValue() == 'Free'){
                        Ext.getCmp('btFind').fireEvent('click');
                        Ext.getCmp('txtSubClientNames').blur();
                    }
                },
                focus:function(bt,e){

                }
            }
        },{
            xtype: 'combo',
            width:100,
            store:storeWsType,
            displayField:'wsTypeName',
            valueField: 'wsTypeId',
            queryMode: 'local',
            value:['mb'],
            editable:false,
            id:'txtWsType',
            multiSelect :true,
            enableKeyEvents:true,
            shiftKey :true,
            doQuery: function(queryString, forceAll) {
                this.expand();
                this.store.clearFilter(!forceAll);

                if (!forceAll) {
                    this.store.filter(this.displayField, new RegExp(Ext.String.escapeRegex(queryString), 'i'));
                }
            },
            listeners:{
            }
        },{
            xtype: 'combo',
            labelWidth:50,
            width: 80,
            store: storeGrouping,
            queryMode: 'local',
            displayField: 'gName',
            valueField: 'gId',
            //fieldLabel: 'Group',
            name: 'cbbGrouping',
            id:'cbbGrouping',
            value:'ipAddrL',
            editable:false,
            listeners:{
                change:function(cb,val){
                    storeSite.setGroupField(val);
                    //alert(val);
                }
            }
        },{
            xtype: 'combo',
            width:100,
            store:storeAuth,
            displayField:'authName',
            valueField: 'authId',
            queryMode: 'local',
            value:true,
            editable:false,
            id:'cbbAuth',
            enableKeyEvents:true,
            shiftKey :true,
        },{
            xtype:'button',
            text:'Find',
            ico:'findCls',
            iconCls:'findCls',
            id:'btFind',
            //plugins:{ptype:'spin'},
            listeners:{
                click:function(){
                    // when input is blank
                    if(Ext.getCmp('txtSubClientNames').getRawValue() == ''){
                        Ext.Msg.alert('Status', 'textbox is blank');
                        return;
                    }
                    Ext.getCmp('formLogging').setCollapsed(false);
                    var bt = Ext.getCmp('btFind');
                    // hide button
                    bt.setIconCls('spinCls');
                    bt.setDisabled(true);

                    // get mode searching
                    var queryMode = Ext.getCmp('cbbModeQuery').getValue();

                    // contain array client name
                    var subClientNames;

                    if(queryMode == 'Hard'){
                        subClientNames = Ext.getCmp('txtSubClientNames').getValue();
                    }
                    else if(queryMode == 'Free'){
                        subClientNames = Ext.getCmp('txtSubClientNames').getRawValue().split(',');
                    }
                    if(subClientNames.length == undefined){
                        Ext.Msg.alert('Error','Error query text ! Refresh page please');
                        return;
                    }
                    if(subClientNames.length>0){
                        //alert(subClientNames);
                        var data = {
                            //userName:$('txtUserName').val(),
                            subClientNames:subClientNames,
                            wsTypes:Ext.getCmp('txtWsType').getValue(),
                            skipAuth:!Ext.getCmp('cbbAuth').getValue()
                        };
                        Ext.getCmp('lblCountSClient').setText('sClients.length=' + subClientNames.length);
                        //send request find to server
                        socket.emit('findSites',data);
                    }
                }
            }
        },{
            xtype:'button',
            text:'Deploy Manager',
            iconCls:'checkCls', // 'configCheckingCls',
            id:'btConfigChecking',
            listeners:{
                click:function(){
                    Ext.getCmp('formChecking').setHidden(false);
                    // records = http://prntscr.com/8nwo9m - tidy at client - overflow size
                }
            }
        },{
            xtype:'button',
            text:'Export & Import',
            iconCls:'iePortCls',
            id:'btOpenIEPort',
            handler:function(){
                    Ext.getCmp('formIEPort').setHidden(false);
            }
        },{
            xtype:'button',
            text:'USER SETTING',
            iconCls:'configUserCls',
            id:'btConfigPage',
            listeners:{
                click:function(){
                    Ext.getCmp('formConfigPage').setHidden(false);
                }
            }
        },{
            xtype:'button',
            text:'Share FR',
            iconCls:'shareCls',
            id:'btShare',
            listeners:{
                click:function(){
                    Ext.getCmp('gridShareRecord').setHidden(false);
                }
            }
        }],
        listeners:{
            viewready:function(grid){
                //socket.emit('getSubClientsByClient','LIGA');
                // create a request post to server - setup default value configure of user
				
                //alert(getQueryParam('subClientNames'));
                var val = getQueryParam('subClientNames');
                if(val===null || val === undefined || val=="null") val='';
                //alert(val);
                Ext.getCmp('txtSubClientNames').setValue(val);
                Ext.Ajax.request({
                    url: 'checkdate/get-cfg-default-values',
                    params:{userId:$('#txtUserId').val()},
                    success: function(res) {
                        var jsonCfg = JSON.parse(JSON.parse(res.responseText).CfgFind);
                        Ext.getCmp('cbbModeQuery').setValue(jsonCfg.findStyle);
                        Ext.getCmp('cbbClient').setValue(jsonCfg.clientName);
                        //Ext.getCmp('cbbGrouping').setValue(jsonCfg.grouping);
                        Ext.getCmp('txtWsType').setValue(jsonCfg.wsType);

                        //Ext.getCmp('gridSite').getView().getFeature('onExpand').setConfig({startCollapsed:jsonCfg.isGroupingExpand});
                        Ext.getCmp('formChecking').setHidden(jsonCfg.isShowFCfgChecking==false?true:false);

                        // fill on formConfigPage
                        Ext.getCmp('cbbModeQueryCfg').setValue(jsonCfg.findStyle);
                        if(jsonCfg.findStyle == 'Free'){
                            setTimeout(function(){
                                // Ext.getCmp('txtSubClientNames').setValue(null);
                                //storeSubClient.loadData([]);
                            },2000);
                        }
                        else{
                            //socket.emit('getSubClientsByClient','LIGA');
                        }
                        Ext.getCmp('cbbClientCfg').setValue(jsonCfg.clientName);
                        //Ext.getCmp('cbbGroupingCfg').setValue(jsonCfg.grouping);
                        /**
                         * Customize wsType list by user
                         * Descriptor by Nick Nguyen 27/09/2016
                         **/
                        //storeWsType.loadData(jsonCfg.wsType);
                        Ext.getCmp('txtWsTypeCfg').setValue(jsonCfg.wsType);

                        Ext.getCmp('isGroupingExpand').setValue(jsonCfg.isGroupingExpand);
                        Ext.getCmp('isShowFCfgChecking').setValue(jsonCfg.isShowFCfgChecking);

                        // print list WLs into text area WLs
                        if(jsonCfg.listWLs != undefined && jsonCfg.listWLs != '' && jsonCfg.listWLs != null){
                            var WLs = jsonCfg.listWLs.split(',');
                            var arrWLs = [];
                            for(var i = 0 ; i<WLs.length; i++){
                                // format subclient model
                                var obWL = {_id:i,subClientName:WLs[i]};
                                arrWLs.push(obWL);
                            }
                            Ext.getCmp('txtListWLs').setValue(jsonCfg.listWLs || 'a');
                            storeSubClient.loadData(arrWLs);
                            //Ext.getCmp('txtSubClientNames').getStore().loadData(arrWLs);
                            //alert(arrWLs);
                        }
                    },
                    failure: function(response) {
                        console.log('server-side failure with status code ' + response.status);
                    }
                });
            }
        },
        renderTo:'gridSubClient'
    });
    // Explicitly create a Container

    // Create RDG form
    Ext.create('Ext.form.Panel', {
        id:'formRdg',
        title: 'Config RDG file',
        bodyPadding: 5,
        width: 300,
        height:420,
        style:{marginBottom: '20px', position: 'absolute', top: '10%', right: '20%', zIndex:999},
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        layout: 'anchor',
        hidden:true,
        defaults: {
            anchor: '100%'
        },
        tools:[{
            type:'close',
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('formRdg').setHidden(true);
            }
        }],
        // The fields
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'RDG Name',
            name: 'txtName',
            allowBlank: false,
            value:'ET'
        },{
            fieldLabel: 'Version',
            name: 'txtVersion',
            allowBlank: false,
            value:'2.2'
        },{
            fieldLabel: 'File Name',
            name: 'txtFileName',
            allowBlank: false,
            value:'LIGA_AGENT'
        },{
            fieldLabel: 'Username',
            id: 'txtUsername',
            name: 'txtUsername',
            allowBlank: false
        },{
            fieldLabel: 'Password',
            name: 'txtPassword',
            inputType:'password',
            allowBlank: false
        },{
            xtype:'combo',
            fieldLabel: 'Srceen',
            name: 'cbbSrceen',
            store:['1024 x 768','1366 x 768','1280 x 800','1366 x 768','1280 x 1024','1680 x 1050'],
            allowBlank: false,
            style:{zIndex:999900},
            value:'1024 x 768'
        },{
            xtype:'combo',
            fieldLabel: 'Color Depth',
            name: 'cbbColorDepth',
            store:[8,15,16,24,32],
            allowBlank: false,
            style:{zIndex:999900},
            value:24
        }],

        // Reset and Submit buttons
        buttons: [{
            text: 'Reset',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }, {
            text: 'Create file',
            formBind: true, //only enabled once the form is valid
            disabled: true,
            handler: function() {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    var range = Ext.getCmp('gridSite').getStore().getGroups().getRange();
                    if(range.length>0){
                        var formVal = form.getValues();
                        var data = {
                            name:formVal.txtName,
                            version:formVal.txtVersion,
                            fileName:formVal.txtFileName,
                            username:formVal.txtUsername,
                            password:formVal.txtPassword,
                            screen:formVal.cbbSrceen,
                            colorDepth:formVal.cbbColorDepth
                        };
                        var records = [];
                        for(var i=0; i<range.length; i++){
                            var record = {
                                _groupKey:range[i]._groupKey
                            }
                            var items = range[i].items;
                            var sites = [];
                            for(var j=0; j<items.length; j++){
                                var site = {
                                    ipAddrL:items[j].data.ipAddrL,
                                    siteUrl:items[j].data.ipAddrL + ' - ' + items[j].data.siteUrl
                                }
                                sites.push(site);
                            }
                            record["sites"] = sites;

                            records.push(record);
                        }
                        data.records = records;
                        socket.emit('createRdgFile',data);

                    }
                    else{
                        Ext.Msg.alert('Status','Record is null');
                    }
                }
            }
        }],
        renderTo: Ext.getBody()
    });
    // Log Finding Form
    Ext.create('Ext.form.Panel', {
        id:'formLogging',
        title: 'Logging Socket.io Server',
        bodyPadding: 5,
        width: 300,
        height:420,
        style:{marginBottom: '20px', position: 'absolute', top: '0px', right: '0px', zIndex:999, padding:'10px'},
        frame: true,
        collapsible: true,
        collapsed:true,
        resizable: true,
        draggable: true,
        layout: 'anchor',
        hidden:false,
        defaults: {
            anchor: '100%'
        },
        tools:[{
            type:'close',
            disabled:true,
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                //Ext.getCmp('formLogging').setHidden(true);
            }
        }],
        tbar:[{
            xtype: 'button',
            width: 85,
            text:'Clear log',
            listeners:{
                click:function(){
                    $('#logging').html('');
                    Ext.getCmp('lblCountSClient').setText('sClientCount.length=0')
                }
            }
        }, {
            xtype: 'label',
            id:'lblCountSClient',
            text: 'sClientCount.length=0:',
            //margin: '0 0 0 10'
        }],
        html:'<pre style="height: 95%; overflow:scroll; word-wrap: break-word" id=\'logging\'></pre>',
        renderTo: Ext.getBody()
    });
    // Checking form
    Ext.create('Ext.form.Panel', {
        id:'formChecking',
        title: 'Deploy Manager (upload, check, edit, view info)',
        bodyPadding: 5,
        width: 850,
        height:400,
        style:{marginTop: '20px', position: 'absolute', top: '100px', left: '100px', zIndex:999, padding:'5px'},
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        layout: 'column',
        hidden:true,
        defaults: {
            anchor: '100%'
        },
        items:[{
            xtype:'panel',
            id:'fileListPanel',
            width:400,
            height:490,
            html:'<div style="height:300px; overflow: scroll" id="fileList"></div>',
        },{
            xtype:'panel',
            style:{marginLeft:'10px'},
            border:false,
            items:[{
                xtype:'fieldset',
                title: 'Protocol Mode',
                width:400,
                height:50,
                collapsed: false,
                items:[{
                    xtype: 'radiogroup',
                    id:'rbProtocolMode',
                    columns:3,
                    vertical: false,
                    items: [
                        { boxLabel: 'HTTPS', name: 'rbProtocol', inputValue: 'https' },
                        { boxLabel: 'HTTP', name: 'rbProtocol', inputValue: 'http', checked: true },
                    ],
                    listeners:{
                        change:function(){
                            var protocolMode = Ext.getCmp('rbProtocolMode').getValue();
                        }
                    }
                }]
            },{
                xtype:'checkbox',
                id:'useUrlCheckingDefault',
                boxLabel :'Use this url',
                labelWidth:150,
                width:300,
                value:false
            },{
                xtype:'textfield',
                fieldLabel :'Url default',
                labelWidth:70,
                width:300,
                id:'txtUrlCheckingDefault',
                name:'txtUrlCheckingDefault',
                value:urlCheckingDefault,
                listeners:{
                    focus:function(){
                        Ext.getCmp('useUrlCheckingDefault').setValue(true);
                    }
                }
            },{
                xtype:'hiddenfield',
                fieldLabel :'Files param',
                id:'filesParam',
                labelWidth:75,
                width:300,
                value:filesParam
            },{
                xtype:'textfield',
                fieldLabel :'Deploy file name',
                id:'dzFileName',
                editable:false,
                labelWidth:150,
                width:300,
                value:filesParam
            },{
                // Fieldset in Column 2 - collapsible via checkbox, collapsed by default, contains a panel
                xtype:'fieldset',
                title: 'Deploy Mode',
                width:400,
                height:80,
                //columnWidth: 0.5,
                //checkboxToggle: true,
                collapsed: false,
                //layout:'anchor',
                items:[{
                    xtype:'checkbox',
                    id:'cbBackupFull',
                    boxLabel :'Backup Full',
                    labelWidth:150,
                    width:170,
                    value:true
                },{
                    xtype: 'radiogroup',
                    id:'rbBatMode',
                    //fieldLabel: 'Modes',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns:3,
                    vertical: false,
                    items: [
                        { boxLabel: 'Only Backup', name: 'rb', inputValue: 'b' },
                        { boxLabel: 'Only Deploy', name: 'rb', inputValue: 'd' },
                        { boxLabel: 'Backup & Deploy', name: 'rb', inputValue: 'bd',checked: true },
                    ],
                    listeners:{
                        change:function(){
                            var deployMode = Ext.getCmp('rbBatMode').getValue();
                            var cbBKFull = Ext.getCmp('cbBackupFull');
                            if(deployMode.rb == "d"){
                                cbBKFull.setDisabled(true);
                            }
                            else{
                                cbBKFull.setDisabled(false);
                            }
                        }
                    }
                }]
            },{
                layout:'table',
                column:2,
                width:300,
                border:false,
                items:[{
                    xtype:'checkbox',
                    id:'cbAutoCheck',
                    boxLabel :'Auto checking',
                    labelWidth:150,
                    width:170,
                    value:false,
                    listeners:{
                        change:function(cb,newValue){
                            if(newValue==true){
                                Ext.getCmp('txtCheckingTime').setDisabled(false);
                            }
                            else{
                                Ext.getCmp('txtCheckingTime').setDisabled(true);
                            }
                        }
                    }
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Check time',
                    labelWidth: 70,
                    width: 110,
                    id: 'txtCheckingTime',
                    name: 'txtCheckingTime',
                    value: 7,
                    //vtype:'numeric',
                    maxLength: 2,
                    allowBlank: false,
                    disabled:true
                    //enableKeyEvents :true,
                }]
            },{
                xtype:'checkbox',
                id:'cbAddWebConfig',
                boxLabel :'Add Web.config',
                labelWidth:150,
                width:170,
                value:false,
                disabled: true,
                listeners:{
                    change:function(cb,newValue){
                        var columns = Ext.getCmp('gridSite').getColumns();
                        if(newValue==true){
                            columns[columns.length-2].setVisible(true);
                            Ext.getCmp('formLogging').collapse();
                        }
                        else{
                            columns[columns.length-2].setVisible(false);
                            Ext.getCmp('formLogging').expand();
                        }
                    }
                }
            }, {
                xtype:'checkbox',
                id:'cbEditWebConfig',
                boxLabel :'Edit Web.config',
                labelWidth:150,
                width:170,
                value:false,
                disabled: true,
                listeners:{
                    change:function(cb,newValue){
                        var columns = Ext.getCmp('gridSite').getColumns();
                        if(newValue==true){
                            Ext.getCmp('fsEditWebConfig').setDisabled(false);
                            columns[columns.length-1].setVisible(true);
                            Ext.getCmp('fsEditWebConfig').expand();
                            Ext.getCmp('formChecking').setHeight(630);
                            
                        }
                        else{
                            Ext.getCmp('fsEditWebConfig').setDisabled(true);
                            columns[columns.length-1].setVisible(false);
                            Ext.getCmp('fsEditWebConfig').collapse();
                            Ext.getCmp('formChecking').setHeight(400);
                        }
                    }
                }
            },{
                xtype: 'fieldset',
                collapsible:true,
                collapsed:true,
                title: 'Editing Web.config',
                height: 226,
                id:'fsEditWebConfig',
                disabled:true,
                items: [{
                        xtype: 'radiogroup',
                        id:'rbWebConfigMode',
                        columns:2,
                        vertical: false,
                        items: [
                            { boxLabel: 'LiveTV Service Url', name: 'rbwc', inputValue: 'applicationsettings' },
                            { boxLabel: 'LoginSite Url:', name: 'rbwc', inputValue: 'appsettings' },
                            { boxLabel: 'UserSites[0] Url', name: 'rbwc', inputValue: 'usersites'},
                            { boxLabel: 'Appsettings Dynamic Key', name: 'rbwc', inputValue: 'appsettingsDKey'},
                            { boxLabel: 'Appcationsettings DKey', name: 'rbwc', inputValue: 'applicationSDkey'},
                            { boxLabel: 'Cache Severs', name: 'rbwc', inputValue: 'cacheservers'}
                        ],
                        listeners:{
                            change:function(rg, newValue, oldValue){
                                if(newValue.rbwc == 'applicationSDkey' || newValue.rbwc == 'appsettingsDKey') {
                                    Ext.getCmp('txtSettingKeyName').setDisabled(false);
                                    Ext.getCmp('txtSettingKeyName').setValue(''); // cause remove ' ' sign before
                                }
                                else {
                                    Ext.getCmp('txtSettingKeyName').setDisabled(true);
                                    Ext.getCmp('txtSettingKeyName').setValue(' ');
                                }
                            }
                        }
                    },{
                        xtype: 'textfield',
                        fieldLabel: 'Setting Key Name',
                        labelWidth: 120,
                        width: 310,
                        value:' ',
                        disabled:true,
                        id: 'txtSettingKeyName',
                        name: 'txtSettingKeyName'
                    },{
                        xtype:'checkbox',
                        id:'useUrlWebConfigForAll',
                        boxLabel :'Use Url value for all',
                        labelWidth:150,
                        width:300,
                        value:false,
                        listeners:{
                            change:function(cb,newValue){
                                var columns = Ext.getCmp('gridSite').getColumns();
                                if(newValue==true){
                                    Ext.getCmp('txtSettingKeyValue').setDisabled(false);
                                }
                                else{
                                    Ext.getCmp('txtSettingKeyValue').setDisabled(true);
                                }
                            }
                        }
                    },{
                        xtype: 'textfield',
                        fieldLabel: 'Url Value',
                        labelWidth: 120,
                        width: 310,
                        disabled:true,
                        id: 'txtSettingKeyValue',
                        name: 'txtSettingKeyValue'
                }]
            }]
        }],
        tools:[{
            type:'close',
            disabled:false,
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('formChecking').setHidden(true);
            }
        }],
        tbar:[{
            xtype: 'filefield',
            name: 'zipFile',
            id:'zipFile',
            fieldLabel: '',
            labelWidth: 0,
            width:400,
            msgTarget: 'side',
            allowBlank: false,
            buttonText: 'Select .zip file to deploy',
            listeners:{
                change: function () {
                    // need filter at client also
                    // https://www.sencha.com/forum/showthread.php?286958-How-to-filter-file-types-in-extjs-5
                    var dzFileNamePath = Ext.getCmp('zipFile').getValue().split('\\');
                    var dzFileName = dzFileNamePath[dzFileNamePath.length-1];
                    Ext.getCmp('dzFileName').setValue(dzFileName);
                    Ext.getCmp('btUpload').fireEvent('click');
                }
            }
        },{
            xtype:'button',
            text:'Upload',
            id:'btUpload',
            hidden:true, // cause will be call by select zip button
            listeners: {
                click:function() {
                        var form = this.up('form').getForm();
                        // var username =  $('#txtUserName').val();
                        // var fileClientName =  Ext.getCmp('txtSubClientNames').getRawValue()
                        // var fileWsType = Ext.getCmp('txtWsType').getValue()                       
                        if (form.isValid()) {
                            form.submit({
                                url: 'checkdate/upload-file?fileUserUpload=' + $('#txtUserName').val()
                                 + '&fileClientName=' + Ext.getCmp('txtSubClientNames').getRawValue() 
                                 + '&fileWsType=' + Ext.getCmp('txtWsType').getRawValue() ,
                                // params: {
                                //     fileUserUpload: $('#txtUserName').val(),
                                //     fileClientName:  Ext.getCmp('txtSubClientNames').getRawValue(),
                                //     fileWsType: Ext.getCmp('txtWsType').getRawValue(),     
                                // },
                                waitMsg: 'Uploading your file...',
                                success: function (fp, o) {
                                    if(o.result.success==false) Ext.Msg.alert('Success', '"' + o.result.file + '"');

                                    // reset old session checking
                                    jsonFailed = [];

                                    // get files
                                    filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=' + exportToFilesParam(o.result.listFile);
                                    jsonObjsZipFile = o.result.listFile;
                                    Ext.getCmp('filesParam').setValue(filesParam);
                                    Ext.getCmp('fileListPanel').setHtml('<div style="height: 95%" id="fileList"></div>');
                                    // create store
                                    var store = Ext.create('Ext.data.TreeStore', {
                                        root: {
                                            expanded: true,
                                            children: addMoreTextAndLeafAttr(o.result.listFile)
                                        }
                                    });
                                    // create tree file list
                                    Ext.create('Ext.tree.Panel', {
                                        header: false,
                                        title:'file list',
                                        width: 380,
                                        height: 400,
                                        store: store,
                                        rootVisible: true,
                                        scrollable:true,
                                        renderTo: 'fileList'
                                    });
                                }
                            });
                        }
                }
            }
        },{
            xtype: 'button',
            width: 85,
            hidden:true,
            text:'view info',
            iconCls:'viewInfoChecking',
            listeners:{
                click:function(){
                    Ext.Msg.alert('Info','jsonObjsZipFile=' + JSON.stringify(jsonObjsZipFile) + '<br/> filesParam=' + filesParam);
                }
            }
        },{
            xtype: 'button',
            width: 120,
            text:'Get All Folder',
            tooltip:'Get All Folder',
            iconCls:'hasNotFolderCls',
            listeners:{
                click:function(){
                    // call event click of all button in grid
                    getAllFolderSite();
                }
            }
        },{
            xtype: 'button',
            width: 100,
            //style:{marginLeft:'100px'},
            text:'Check All',
            iconCls:'checkCls',
            listeners:{
                click:function(){
                   // call event click of all button in grid
                    checkAllDeployingSite();
                }
            }
        },{
            xtype: 'button',
            width: 170,
            text:'Get all value Web.Cfg',
            iconCls:'webConfigGetOkCls',
            hidden:true,
            listeners:{
                click:function(){
                    // call event click of all button in grid
                    getAllWebConfigStr();
                }
            }
        },{
            xtype: 'button',
            width: 30,
            tooltip:'Clear file upload',
            text:' ',
            iconCls:'zipUploadEmptyCls',
            hidden: true,
            listeners:{
                click:function(){
                    // empty file on express service
                    var dzFileName =  Ext.getCmp('dzFileName').getValue();
                    if(dzFileName != '' & dzFileName != null)
                        socket.emit('emptyFile',dzFileName);
                }
            }
        }],
		listeners:{
			show:function(){
				$('input#txtUrlCheckingDefault-inputEl').focus(function() {
					$(this).select();
				});
			}
		},
        renderTo: Ext.getBody()
    });
    // Config page form
    Ext.create('Ext.form.Panel', {
        id:'formConfigPage',
        title: 'USER SETTING DEFAULT VALUES',
        bodyPadding: 5,
        width: 400,
        height:600,
        style:{marginTop: '20px', position: 'absolute', top: '100px', right: '500px', zIndex:999, padding:'5px'},
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        layout: 'column',
        hidden:true,
        defaults: {
            anchor: '100%'
        },
        items:[{
            xtype:'panel',
            width:360,
            height:500,
            border:false,
            items:[{
                xtype: 'combo',
                width: 200,
                fieldLabel:'Find style',
                store: ['Hard','Free'],
                queryMode: 'local',
                name: 'cbbModeQueryCfg',
                id:'cbbModeQueryCfg',
                value:'Hard',
                listeners:{
                    change:function(cb,val){}
                },
                //disabled:true,
                hidden:true
            },{
                xtype: 'combo',
                width: 200,
                store:['LIGA','UBO','AFB'],
                fieldLabel:'Client',
                queryMode: 'local',
                value:'LIGA',
                id:'cbbClientCfg',
                name:'cbbClientCfg',
                listeners:{
                    change:function(cb, val){}
                }
            },{
                xtype: 'combo',
                width: 200,
                store:['Select All','Deselect All'],
                queryMode: 'local',
                value:'Deselect All',
                id:'cbbSelectAllCfg',
                name:'cbbSelectAllCfg',
                hidden:true,
                listeners:{
                    change:function(cb, val){}
                }
            },{
                xtype: 'combo',
                width:300,
                store:storeWsType,
                fieldLabel:'WS Type',
                displayField:'wsTypeName',
                valueField: 'wsTypeId',
                queryMode: 'local',
                value:['mb'],
                id:'txtWsTypeCfg',
                name:'txtWsTypeCfg',
                multiSelect :true,
                enableKeyEvents:true,
                shiftKey :true,
                doQuery: function(queryString, forceAll) {
                    this.expand();
                    this.store.clearFilter(!forceAll);

                    if (!forceAll) {
                        this.store.filter(this.displayField, new RegExp(Ext.String.escapeRegex(queryString), 'i'));
                    }
                },
                listeners:{
                }
            },{
                xtype: 'combo',
                width:250,
                store: storeGrouping,
                queryMode: 'local',
                displayField: 'gName',
                valueField: 'gId',
                fieldLabel: 'Group',
                name: 'cbbGroupingCfg',
                id:'cbbGroupingCfg',
                value:'ipAddrL',
                editable:false,
                listeners:{
                    change:function(cb,val){

                    }
                }
            },{
                xtype:'checkbox',
                id:'isGroupingExpand',
                name:'isGroupingExpand',
                boxLabel :'Expand group when done finding',
                labelWidth:150,
                width:300,
                value:true,
                hidden:true
            },{
                xtype:'checkbox',
                id:'isShowFCfgChecking',
                name:'isShowFCfgChecking',
                boxLabel :'Show form Cfg Checking',
                labelWidth:150,
                width:300,
                value:true
            },{
                xtype:'checkbox',
                id:'cbChangePwd',
                boxLabel :'Change passwod',
                labelWidth:150,
                width:300,
                value:false,
                listeners:{
                    change:function(cb, newValue){
                        if(newValue==true){
                            Ext.getCmp('fsChangePwd').setDisabled(false);
                        }
                        else{
                            Ext.getCmp('fsChangePwd').setDisabled(true);
                        }
                    }
                }
            },{
                // Fieldset in Column 2 - collapsible via checkbox, collapsed by default, contains a panel
                xtype:'fieldset',
                title: 'Change password',
                disabled:true,
                height:150,
                collapsed: false,
                id:'fsChangePwd',
                items:[{
                    xtype:'textfield',
                    inputType:'password',
                    fieldLabel:'Old Password',
                    labelWidth:145,
                    width:310,
                    id:'txtOldPwd'
                },{
                    xtype:'textfield',
                    inputType:'password',
                    fieldLabel:'New Password',
                    labelWidth:145,
                    width:310,
                    id:'txtNewPwd1'
                },{
                    xtype:'textfield',
                    inputType:'password',
                    fieldLabel:'Repeat New Password',
                    labelWidth:145,
                    width:310,
                    id:'txtNewPwd2'
                },{
                    xtype:'button',
                    text:'change',
                    handler:function(){
                        if(Ext.getCmp('txtNewPwd2').getValue() != Ext.getCmp('txtNewPwd1').getValue() || Ext.getCmp('txtNewPwd2').getValue() == '' || Ext.getCmp('txtOldPwd').getValue() == ''){
                            alert('Password not match')
                        }
                        else{
                            socket.emit('change-password',{
                                newPwd:sha512(Ext.getCmp('txtNewPwd2').getValue()),
                                oldPwd:sha512(Ext.getCmp('txtOldPwd').getValue())
                            });
                        }
                    }
                }]
            },{
                xtype:'textarea',
                id:'txtListWLs',
                name:'txtListWLs',
                width:350,
                height:180,
            }]
        },{
            xtype: 'panel',
            style: {marginLeft: '10px'},
            border: false,
        }],
        tools:[{
            type:'close',
            disabled:false,
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('formConfigPage').setHidden(true);
            }
        }],
        tbar:[{
            text: 'Save all',
            formBind: true, //only enabled once the form is valid
            iconCls: 'saveCls',
            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        url: '/checkdate/save-cfg-default-values',
                        success: function (form, action) {
                            Ext.Msg.alert('Success', action.result.msg);
                        },
                        failure: function (form, action) {
                            switch (action.failureType) {
                                case Ext.form.action.Action.CLIENT_INVALID:
                                    Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                    break;
                                case Ext.form.action.Action.CONNECT_FAILURE:
                                    Ext.Msg.alert('Failure', 'Ajax communication failed');
                                    break;
                                case Ext.form.action.Action.SERVER_INVALID:
                                    Ext.Msg.alert('Failure', action.result.msg);
                            }
                        }
                    });
                }
            }
        }],
        renderTo: Ext.getBody()
    });

    // Set up a model to use in our Store
    Ext.define('mdUser', {
        extend: 'Ext.data.Model',
        fields: ['userId','userName','socketId','status'],

    });
    var stUser = Ext.create('Ext.data.Store', {
        model: 'mdUser',
        proxy: {
            type: 'ajax',
            url: '/checkdate/get-users-share-record',
            reader: {
                type: 'json',
                //rootProperty: 'users'
            }
        },
        autoLoad: true
    });
    var gridShare = Ext.create('Ext.grid.Panel',{
        id: 'gridShareRecord',
        title: 'User Online and Share Found Records',
        hidden:true,
        header:true,
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        height: 200,
        width: 500,
        style: { marginBottom: '20px', zIndex: 999999, position: 'absolute', top: '0px', left: '0px' },
        store: stUser,
        selType: 'cellmodel',
        //plugins: {ptype: 'rowediting',clicksToEdit:2},
        //features: [],
        masked:true,
        columns:[
            new Ext.grid.RowNumberer({text: 'STT', width:50}),
            { text: 'User Name', dataIndex: 'userName', width:100},
            { text: 'Record Share Id', dataIndex: 'socketId', width:200},
            { text: 'Status', dataIndex: 'status', width:80},
        ],
        tools:[{
            type:'close',
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('gridShareRecord').setHidden(true);
            }
        }],
        listeners: {
            itemclick:function(view, record, item, index, e, eOpts)
            {
                socket.emit('shareFR', record.data["socketId"]);

            }
        },
        renderTo: Ext.getBody()
    });

    Ext.create('Ext.form.Panel', {
        id:'formIEPort',
        title: 'Export and Import',
        bodyPadding: 5,
        width: 400,
        height:400,
        style:{marginTop: '20px', position: 'absolute', top: '300px', left: '200px', zIndex:9, padding:'5px'},
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        layout: 'column',
        hidden:true,
        defaults: {
            anchor: '100%'
        },
        tools:[{
            type:'close',
            //disabled:true,
            handler: function(event, toolEl, panelHeader) {
                Ext.getCmp('formIEPort').setHidden(true);
            }
        }],
        tbar:[{
            xtype:'button',
            text:'.RDG',
            iconCls:'createCls',
            id:'btCreate',
            listeners:{
                click:function(){
                    Ext.getCmp('formRdg').setHidden(false);
                    // records = http://prntscr.com/8nwo9m - tidy at client - overflow size
                }
            }
        },{
            xtype:'button',
            text:'.TXT',
            iconCls:'exportTextCls',
            id:'btExportText',
            listeners:{
                click:function(){
                    if(Ext.getCmp('gridSite').getStore().getData().length>0)
                        socket.emit('exportText');
                    else alert('data grid have not any record');
                }
            }
        },{
            xtype:'button',
            text:'.JSON',
            iconCls:'exportJSonCls',
            id:'btExportJson',
            listeners:{
                click:function(){
                    if(Ext.getCmp('gridSite').getStore().getData().length>0){
                        socket.emit('exportJson',{
                            subClientNames:Ext.getCmp('txtSubClientNames').getRawValue().split(','),
                            wsTypes:Ext.getCmp('txtWsType').getValue()
                        });
                    }
                    else alert('data grid have not any record');
                }
            }
        },{
            xtype:'button',
            text:'Parse JSON',
            iconCls:'parseJSonCls',
            id:'btParseJson',
            listeners:{
                click:function(){
                    var strJson = Ext.getCmp('txtJsonGridImport').getValue();
                    if(strJson != '')
                        try {
                            var data = JSON.parse(strJson);
                            Ext.getCmp('gridSite').getStore().loadData(data);

                            gGroups = storeSite.getGroups();
                            for(var i=0; i<gGroups.length; i++){
                                for(var j=0; j<gGroups.items[i].length; j++){
                                    storeSite.findRecord('siteUrl',gGroups.items[i].items[0].data["siteUrl"]).set('zipUpload',0);
                                    j=gGroups.items[i].length;
                                }
                            }
                        }
                        catch(err){
                            alert(err);
                        }
                    else alert('txtJsonGridImport is blank');
                }
            }
        }],
        items:[{
            xtype: 'textarea',
            id: 'txtJsonGridImport',
            width: 370,
            height: 300,
        }],
        renderTo: Ext.getBody()
    });
});

// =========================================== FUNCTION UNIT ===========================================================
function addOrUpdate(record){
    var jsonSite = record;
    socket.emit('addSite',jsonSite);
}

function addMoreTextAndLeafAttr(json){
    for(var i=0; i<json.length; i++){
        json[i]["text"] = json[i].fileName + '(' + json[i].modifiedDate.substr(0,22) +  ')';
        json[i]["leaf"] = true;
        json[i]["iconCls"] = 'fa fa-file';
    }
    return json;
}

// filesParam = '/GetDateModifiedOfFiles.aspx?files=';
// fileName = 'Default8.aspx,_view/BettingRules8.aspx,bin/wsligweb_v6.dll';
function exportToFilesParam(json){
    var fileNames = '';
    for(var i=0; i<json.length; i++){
        fileNames += json[i].fileName + ',';
    }
    // remove comma sign
    return  fileNames.substr(0,fileNames.length-1);
}
// use compare file live and zip deploy
// json1 : site
// json2 : zip
//var jsonFailed = [] ; // ==> moved to top
function compare2Json2(json1,json2){
    if(json1.length == undefined || json2 == undefined){
        Ext.Msg.alert('JSON ERROR','site or zip file not exists');
        return;
    }
    if(json1.length !=json2.length){
        Ext.Msg.alert('Error','Error JSON jsonSite.length(' + json1.length + ')!=jsonZip.length(' + json2.length + ')');
        return;
    }
    else{
        var json = {success:true,files:[]};
        for(var i=0; i<json1.length; i++){
            // cause datetime in zip is greater than datetime on site one second for odd number ( not even)
            var dateSite =  new Date(json1[i]["modifiedDate"]);
            var secondOfDateSite = dateSite.getSeconds();
            // fix one second - .net with nodejs time stamp
            if(secondOfDateSite%2 != 0)
                dateSite.setSeconds(secondOfDateSite-1);

            // Malaysia Time & Vietnam Time
            var hourMalaysia = dateSite.getHours();
            dateSite.setHours(hourMalaysia-1);

            // fix one minute
            if(dateSite != json2[i]["modifiedDate"]){
                json["success"]=false;
                json["files"].push(json1[i]["fileName"] +  '(' + dateSite.toString().substr(3,21) +  ')')
            }
        }
        return json;
    }
}
// fix format date from server : https://msdn.microsoft.com/en-us/library/az4se3k1(v=vs.110).aspx
// 2009-06-15T13:45:30 -> 2009/6/15 13:45 (zh-CN)
// 12/15/2015, 3:23:41 PM --> convert to 12/15/2015 3:23:41 PM
function compare2Json(json1,json2){
    if(json1.length == undefined || json2 == undefined){
        Ext.Msg.alert('JSON ERROR','site or zip file not exists');
        return;
    }
    if(json1.length !=json2.length){
        Ext.Msg.alert('Error','Error JSON jsonSite.length(' + json1.length + ')!=jsonZip.length(' + json2.length + ')');
        return;
    }
    else{
        var json = {success:true,files:[]}
        for(var i=0; i<json1.length; i++){
            // cause datetime in zip is greater than datetime on site one second for odd number ( not even)
            var dateSite =  new Date(json1[i]["modifiedDate"]);
            dateSite.setSeconds(0);
            var dateZip = new Date(json2[i]["modifiedDate"].replace(', ',' '));
            dateZip.setSeconds(0);

            // Malaysia Time & Vietnam Time
            var hourMalaysia = dateSite.getHours();
            dateSite.setHours(hourMalaysia-1);

            // fix one minute
            if(dateSite.getHours() == dateZip.getHours() && dateSite.getSeconds() == dateZip.getSeconds())
                if(dateZip.getMinutes() - dateSite.getMinutes()==1) {
                    var minute = dateSite.getMinutes() + 1;
                    dateSite.setMinutes(minute, 0, 0);
                }

            if(dateSite.toLocaleString() != dateZip.toLocaleString()){
                if(dateSite.toLocaleDateString() == dateZip.toLocaleDateString() && dateSite.getHours() < dateZip.getHours() && dateSite.getMinutes() == dateZip.getMinutes() ){
                    console.log('server setup Vietnam TimeZone');
                }
                else {
                    json["success"] = false;
                    json["files"].push(json1[i]["fileName"] + '(' + dateSite.toLocaleString() + ')')
                }
            }
        }
        return json;
    }
}
// check all deploying Site One Row
function checkAllDeployingSiteOneRow(grid, rowIndex){
    if( grid.getStore().getAt(rowIndex).get('checked')==0) {

        if (jsonObjsZipFile == undefined) {
            Ext.Msg.alert('Info', 'Zip File have not uploaded yet');
            return;
        }
        // create request to express server
        grid.getStore().getAt(rowIndex).set('checked', 1); // start checking

        // check url
        var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue();
        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
        filesParam = Ext.getCmp('filesParam').getValue();
        if (isUseUrlCheckingDefault == false) {
            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
            // filesParam = Ext.getCmp('filesParam').getValue();
        }
        // create a request post to server
        Ext.Ajax.request({
            url: 'checkdate/get-date-modified',
            params: {filesParam: filesParam, siteName: siteName},
            success: function (response) {
                // parse jsonString from server
                // format : {"files":[{"fileName":"","modifiedDate":"12/9/2015 10:19:25 AM"}],"path":"D:\Projects\Liga New\wsligweb_v6"}
                var jsonObjsFromSite = JSON.parse(response.responseText);
                //console.dir(jsonObjsFromSite);

                // compare two json object
                var result = compare2Json(jsonObjsFromSite.files, jsonObjsZipFile);

                //Ext.Msg.alert('Info Compare ZipFile & FromSite',JSON.stringify(result));
                if (result.success == true) {
                    grid.getStore().getAt(rowIndex).set('checked', 2); // checkOk
                    //grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));

                }
                else {
                    grid.getStore().getAt(rowIndex).set('checked', 3); // checkKo
                    //grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                    jsonFailed[rowIndex] = result;
                }
                if(jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                    var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                    var sizeOfFile = fileInfo[1];
                    sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                    grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', fileInfo[0] + '-' + sizeOfFile + ' KB');
                }
                //grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.modifiedDateOfBKFile);
            },

            failure: function (response) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    }
}
// get all folder Site One Row
function getAllFolderSiteOneRow(grid, rowIndex){
    // create request to express server
    var folderPath =  grid.getStore().getAt(rowIndex).get('folderPath');
    if( folderPath != '') return;

    grid.getStore().getAt(rowIndex).set('folderPath',' '); // start checking
    // check url
    var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
    var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
    filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
    if(isUseUrlCheckingDefault==false) {
        siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
        // filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
    }
    // create a request post to server
    Ext.Ajax.request({
        url: 'checkdate/get-date-modified',
        params:{filesParam:filesParam,siteName:siteName},
        success: function(response) {
            // parse jsonString from server
            var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g,'\\\\'));
            if(jsonObjsFromSite.path != undefined)
                grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
            else{
                
                // grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.msg);
                // var path = jsonObjsFromSite.msg.substr(21,jsonObjsFromSite.msg.length-3);
                // grid.getStore().getAt(rowIndex).set('folderPath',path.substr(0,path.length-6));

                grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile',jsonObjsFromSite.msg);
                var path = jsonObjsFromSite.msg.substr(21,jsonObjsFromSite.msg.length-3);
                var pathElements = path.split('\\');
                var lastPathElement = pathElements[pathElements.length-1];
                grid.getStore().getAt(rowIndex).set('folderPath',path.substr(0,path.length - lastPathElement.length));
            }
        },
        failure: function(response) {
            console.log('server-side failure with status code ' + response.status);
            grid.getStore().getAt(rowIndex).set('folderPath','server-side failure with status code ' + response.status);
        }
    });
}
// get all web.config one row
function getWebConfigStrOneRow(grid, rowIndex){
        var wcAction = grid.getStore().getAt(rowIndex).get('webConfig');
        //wcAction 0 - start || 1 - doing || 2 get
        var isUseUrlWebConfigForAll = Ext.getCmp('useUrlWebConfigForAll').getValue();

        if(Ext.getCmp('rbWebConfigMode').getValue().rbwc == null || Ext.getCmp('rbWebConfigMode').getValue().rbwc == undefined){
            alert('Select tag need edit');
            return;
        }
        if(isUseUrlWebConfigForAll == true && (Ext.getCmp('txtSettingKeyValue').getValue() == '' || Ext.getCmp('txtSettingKeyValue').getValue() == null)){
            alert('Setting Key Value is null');
            return;
        }
        if(Ext.getCmp('txtSettingKeyName').getValue() == '' || Ext.getCmp('txtSettingKeyName').getValue() == null){
            alert('Setting Key Name is null');
            return;
        }

        if(wcAction == 4 ){ // done change
            alert('Web.config has changed');
            return;
        }
        // check url
        //alert(wcAction);
        if(wcAction != 2) grid.getStore().getAt(rowIndex).set('webConfig',1);
        //if(wcAction == 2) Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','...'); // effect text
        var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
        var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
        if(isUseUrlCheckingDefault==false) {
            siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
        }

        Ext.Ajax.request({
            url: 'checkdate/change-web-config',
            params: {
                filesParam: filesParam,
                siteName: siteName,
                settingKeyName:Ext.getCmp('txtSettingKeyName').getValue(),
                settingKeyValue:grid.getStore().getAt(rowIndex).get('modifiedDateOfBKFile'),
                wcMode:Ext.getCmp('rbWebConfigMode').getValue().rbwc,
                wcAction:"r"
            },
            success: function (response) {
                // parse jsonString from server
                var result = response.responseText.replace(/\r?\n|\r/g,' ');
                result = JSON.parse(result);
                if(result.success == true){
                    if(wcAction != 2){
                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',2); // get url value ok
                    }
                    else{
                        // done editing web.config
                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','...'); // effect text
                        Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',4);
                    }
                }
                else{
                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('webConfig',3);
                }
                setTimeout(function(){
                    Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile',result.msg);
                },500)

            },
            failure: function (response) {
                console.log('server-side failure with status code ' + response.status);
                Ext.getCmp('gridSite').getStore().getAt(rowIndex).set('modifiedDateOfBKFile','server-side failure with status code');
            }
        });
}

function checkAllDeployingSite(){
    var grid = Ext.getCmp('gridSite');
    for(var i = 0 ; i<grid.getStore().getCount(); i++){
        checkAllDeployingSiteOneRow(grid,i);
    }
}
function getAllFolderSite(){
    var grid = Ext.getCmp('gridSite');
    for(var i = 0 ; i<grid.getStore().getCount(); i++){
        getAllFolderSiteOneRow(grid,i);
    }
}
function getAllWebConfigStr(){
    var grid = Ext.getCmp('gridSite');
    for(var i = 0 ; i<grid.getStore().getCount(); i++){
        getWebConfigStrOneRow(grid,i);
    }
}



function dzFileNameListGen(fileList,folderPath){
    // update for v8 LIGABOLAWeb_Member
    if(folderPath.indexOf("Web")==-1)
        folderPath = folderPath.split('\\')[2]; // v6
    else
        folderPath = folderPath.split('\\')[2] + '\/WebUI'; // v8 LIGABOLAWeb_Member

    //folderPath = folderPath.split('\\')[2]; // v6
    var strFileList = "";
    for(var i=0; i<fileList.length; i++){
        strFileList += folderPath + '/' + fileList[i].fileName + '\r\n';
    }
    return strFileList;
}
function formatCurrency(num){
    num = num.toString().replace(/\$|\,/g,'');
    if(isNaN(num))
        num = "0";
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num*100+0.50000000001);
    num = Math.floor(num/100).toString();
    for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
        num = num.substring(0,num.length-(4*i+3))+','+
            num.substring(num.length-(4*i+3));
    return (((sign)?'':'-') + num).replace(/,/g,'.');
};

// create bat string automatic depend on one record of grid
function generateBatScript(pathFolder,dzFileName){
    pathFolder.replace(/\\/g,'\/');
    var bkFile = pathFolder + '.zip';
    if(pathFolder.substr(pathFolder.length-1,1) == '\\') {
        bkFile = pathFolder.substr(0, pathFolder.length - 1) + ".zip";
    }
    var batString=[
        'set PATH=%PATH%;C:\\Program Files\\7-Zip\\',
        //'set pathDZFile=%~dp0%Liga_New.zip' - move here cause can set into if condition
        'set pathDZFile=%~dp0%' + dzFileName,
        '7z.exe',
        'if not %errorlevel%==9009 ( ',
        //del /f /q C:\web\Bola168_MainTest.zip
        'del /f /q ' + bkFile,

        //'7z a C:\\Web\\HanaBet_Main.zip C:\\Web\\HanaBet_Main\\',
        '7z a ' + bkFile + ' ' + pathFolder,

        //'7z x %pathDZFile% -oC:\\Web\\HanaBet_Member -y',
        '7z x %pathDZFile% -o' + pathFolder + ' -y',

        'exit',
        ')'];
    console.log(batString);
    return batString;
}
function checkDeploying(grid, rowIndex) {
    if(grid.getStore().getAt(rowIndex).get('checked') == 2 ) return;
    if(grid.getStore().getAt(rowIndex).get('checked') == 3 ) {
        //Ext.Msg.alert('Info Deploy Failed',JSON.stringify(jsonFailed[rowIndex]));
        alert(JSON.stringify(jsonFailed[rowIndex]));
        return;
    }
    if(jsonObjsZipFile == undefined){
        Ext.Msg.alert('Info','Zip File have not uploaded yet');
        return;
    }
    // create request to express server
    grid.getStore().getAt(rowIndex).set('checked',1); // start checking

    // check url
    var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
    filesParam = Ext.getCmp('filesParam').getValue();
    var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
    if(isUseUrlCheckingDefault==false) {
        siteName = getHttpHttps() + grid.getStore().getAt(rowIndex).get('siteUrl');
        //filesParam = Ext.getCmp('filesParam').getValue();
    }

    Ext.Ajax.request({
        url: 'checkdate/get-date-modified',
        params:{filesParam:filesParam,siteName:siteName},
        success: function(response) {
            // parse jsonString from server
            var jsonObjsFromSite = JSON.parse(response.responseText);
            //console.dir(jsonObjsFromSite);

            // compare two json object
            var result = compare2Json(jsonObjsFromSite.files,jsonObjsZipFile);

            //Ext.Msg.alert('Info Compare ZipFile & FromSite',JSON.stringify(result));
            if(result.success == true){
                grid.getStore().getAt(rowIndex).set('checked',2); // checkOk
                grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
            }
            else {
                grid.getStore().getAt(rowIndex).set('checked',3); // checkKo
                grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                jsonFailed[rowIndex]=result;
            }
            if(jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                var sizeOfFile = fileInfo[1];
                sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', fileInfo[0] + '-' + sizeOfFile + ' KB');
            }
        },
        failure: function(response) {
            console.log('server-side failure with status code ' + response.status);
        }
    });
}

// added 6/4/2016
function genDeleteBettingRules(pathFolder){
    var strGenBat = "";
    strGenBat += pathFolder.split('\\')[0] + '\r\n';
    strGenBat += 'del ' + pathFolder  + '_View\\BettingRules_A.aspx' + '\r\n';
    for(var i=0; i<47; i++){
        strGenBat += 'del ' + pathFolder  + '_View\\BettingRules' + (i+1) + '.aspx' + '\r\n';
    }
    return strGenBat + '\r\npause';
}
