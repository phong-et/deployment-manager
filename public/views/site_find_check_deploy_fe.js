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
    data: [['subClientName', 'Sub Client'],['ipAddrL', 'Local IP']]
});

var wsType = [[0,'All'],[25,'ADMIN'],[3,'AGENT'],[18,'AGENT Cash'],[35,'AGENT TEST'],[22,'API'],[41,'BANNER'],[6,'BO'],[33,'BO Test'],[34,'BO TRAIN'],[19,'CASINO LINK'],[12,'CHAT'],[9,'EGAME'],[27,'EGAME COMM'],[40,'INDEX'],[24,'LAPI'],[8,'MAIL'],[1,'MAIN'],[16,'MAIN TEST'],[26,'MAINTENANCE'],[2,'MEMBER'],[17,'MEMBER TEST'],[31,'MRTG'],[20,'ODDS'],[14,'OM'],[15,'OTHERS'],[21,'PHONE'],[13,'REDIRECT'],[29,'REPORT'],[30,'SERVICE'],[10,'SHARECACHE'],[36,'SMART'],[32,'SPORT'],[7,'STATS'],[11,'VIDEO'],[5,'WAP AGENT'],[4,'WAP MEMBER']];
var wsTypeFindByName = function(name){
    for(var i=0; i<wsType.length; i++){
        if(wsType[i][1] == name)
            return wsType[i][0];
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
Ext.onReady(function() {
    var grid = Ext.create('Ext.grid.Panel',{
        id: 'gridSite',
        title: 'SubClient list',
        header:false,
        resizable: true,
        height: Ext.getBody().getViewSize().height,
        width: '100%',
        store: storeSite,
        selType: 'cellmodel',
        plugins: {
            ptype: 'cellediting',
            clicksToEdit:2
        },
        features: [
            //feature
            //featureOffExpand,
            //featureOnExpand
            //{ ftype: 'grouping' }
            Ext.create('Ext.grid.feature.GroupingSummary', {
                id: 'groupSummary',
                startCollapsed: true,
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
        multiSelect: true,
        selModel: Ext.create('Ext.selection.CheckboxModel', {
            mode: 'SIMPLE',
            listeners: {
                selectionchange: function (model, selections) {

                }
            }
        }),
        columns:[
            new Ext.grid.RowNumberer({text: 'STT', width:35}),
            { text: 'Website', dataIndex: 'siteUrl', width:160,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '" target="_blank" title="go to site">' + value + '</a>';
                }
            },
            /*{ text: 'Mainsite', dataIndex: 'siteUrl', width:100,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/Main.aspx" target="_blank" title="go to site">Main.aspx</a>';
                }
            },*/
            { text: 'Client', dataIndex: 'clientName', width: 100},
            { text: 'Sub Client', dataIndex: 'subClientName', width:150},
            { text: 'ws Type', dataIndex: 'wsType', width:100,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    if(!isNaN(value)){
                        value = wsTypeFindById(value);
                    };
                    return value;
                }
            },
            { text: 'IP Local', dataIndex: 'ipAddrL', width:130,
                editor:{
                    type:'textfield',
                    editable:false
                }
            },{
                xtype: 'actioncolumn',
                width: 30,
                sortable: false,
                menuDisabled: true,
                text: 'Re-Find',
                id: 'btreFind',
                dataIndex: 'siteUrl',
                items: [{
                    iconCls: 'reFindCls',
                    getClass: function (value, meta, record, rowIndex, colIndex) {
                        var siteUrl = record.get('siteUrl');
                        var iconCls = '';
                        if(siteUrl == 'No Records Found - Lost Connection')
                            iconCls = 'reFindCls';
                        return iconCls;
                    },
                    handler: function (grid, rowIndex, colIndex, item, e, record, row){
                        if(record.get('siteUrl')!= 'No Records Found - Lost Connection')  return;
                        var data = {
                            subClientNames:[record.get('subClientName')],
                            wsTypes:[record.get('wsType')]
                        };
                        //send request find to server
                        //alert(JSON.stringify(data));
                        grid.getStore().remove(record);
                        socket.emit('reFind',data);
                    }
                }]
            },{
                text:'Update',
                dataIndex: 'siteUrl',
                hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="aUpdate" href="#" title="add or update" onclick="return addOrUpdate(' + record + ');"><img src="images/site/update.png"/></a>';
                }
            },{
                text: 'Remote', dataIndex: 'ipAddrL', width:100, hidden:true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="aUpdate" href="#" title="add or update" onclick="return openRemoteDesktop(' + record + ');"><img src="images/site/update.png"/></a>';
                }
            },{ text: 'LiveTV', dataIndex: 'siteUrl', width:60,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/_view/LiveTV.aspx" target="_blank" title="go to site">LiveTV</a>';
                }
            },{ text: 'JSOdd1', dataIndex: 'siteUrl', width:300,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    var jsOdds = '<a class="siteUrl" href="http://' + value + '/_view/JSOdds1.aspx" target="_blank" title="go to site">JSOdds1</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOdds2.aspx" target="_blank" title="go to site">JSOdds2</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOddsFav1.aspx" target="_blank" title="go to site">JSOddsFav1</a>'
                    + ' | ' +'<a class="siteUrl" href="http://' + value + '/_view/JSOddsFav2.aspx" target="_blank" title="go to site">JSOddsFav2</a>';
                    return jsOdds;
                }
            },{ text: 'Folder web', dataIndex: 'folderPath', width:200,
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
                        if(isUseUrlCheckingDefault==false) {
                            siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl');
                            filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
                        }
                        Ext.Ajax.request({
                            url: 'checkdate/get-date-modified',
                            params:{filesParam:'/Public/GetDateModifiedOfFiles.aspx?files=',siteName:siteName},
                            success: function(response) {
                                // parse jsonString from server
                                var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g,'\\\\'));
                                if(jsonObjsFromSite.path != undefined)
                                    grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
                                else
                                    grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.msg);
                            },

                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
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
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            // create request to express server
                            grid.getStore().getAt(rowIndex).set('zipUpload', 1); // start checking
                            Ext.Ajax.request({
                                url: 'checkdate/upload-zip-deploy',
                                params: {siteName: siteName, dzFileName: dzFileName, action:'e'},
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
                                }
                            });
                        }
                        // upload
                        else if(doAction == '') {
                            // check url
                            var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue() + '/Public/GetDateModifiedOfFiles.aspx';
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            // create request to express server
                            grid.getStore().getAt(rowIndex).set('zipUpload', 1); // start checking
                            Ext.Ajax.request({
                                url: 'checkdate/upload-zip-deploy',
                                params: {siteName: siteName, dzFileName: dzFileName, action:'u'},
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
                            siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
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
                        var params = {
                            dzFileName:Ext.getCmp('dzFileName').getValue(),
                            dzFileNameList:dzFileNameListGen(jsonObjsZipFile),
                            bkFile:bkFile,
                            pathFolder:pathFolder,
                            nameBatFile:nameBatFile,
                            siteName:siteName,
                            batMode:Ext.getCmp('rbBatMode').getValue().rb,
                            nameBkFile:nameBkFile
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
                                    //Ext.Msg.alert('Error generate Bat File', jsonResult.content);
                                }
                                else{
                                    Ext.Msg.alert('Error generate Bat File',jsonResult.msg)
                                }
                            },

                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
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
                            siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl');
                            //filesParam = Ext.getCmp('filesParam').getValue();
                        }
                        // create nameBkFile
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //January is 0!
                        var yyyy = today.getFullYear();
                        if(dd<10) dd='0'+dd
                        if(mm<10) mm='0'+mm
                        today = yyyy + '' + mm + '' + dd;
                        var nameBkFile =  $('#txtUserName').val() + '_' + today;
                        Ext.Ajax.request({
                            url: 'checkdate/get-date-modified',
                            params:{filesParam:filesParam,siteName:siteName,nameBkFile:nameBkFile},
                            success: function(response) {
                                // parse jsonString from server
                                var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g,'/'));
                                //console.dir(jsonObjsFromSite);
                                //Ext.Msg.alert('Info Compare ZipFile & FromSite',JSON.stringify(result));
                                if(jsonObjsFromSite.success == true) {
                                    // compare two json object
                                    var result = compare2Json(jsonObjsFromSite.files, jsonObjsZipFile);
                                    if (result.success == true) {
                                        grid.getStore().getAt(rowIndex).set('checked', 2); // checkOk
                                        grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                    }
                                    else {
                                        grid.getStore().getAt(rowIndex).set('checked', 3); // checkKo
                                        grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                    }
                                    // format data infomation to row
                                    if (jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                                        var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                                        var sizeOfFile = fileInfo[1];
                                        sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                                        grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', fileInfo[0] + '-' + sizeOfFile + ' KB');
                                    }
                                }
                                else{
                                    grid.getStore().getAt(rowIndex).set('checked', 3); // checkKo
                                    grid.getStore().getAt(rowIndex).set('modifiedDateOfBKFile', jsonObjsFromSite.modifiedDateOfBKFile);
                                }
                            },
                            failure: function(response) {
                                console.log('server-side failure with status code ' + response.status);
                            }
                        });
                    }
                }]
            },{ text: 'modifiedDateOfBKFile', dataIndex: 'modifiedDateOfBKFile', width:210,
                editor:{
                    type:'textfield'
                }
            },
        ],
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
                        storeSubClient.loadData([]);
                    }
                    else{
                        Ext.getCmp('cbbSelectAll').setVisible(true);
                        Ext.getCmp('cbbClient').setVisible(true);
                        socket.emit('getSubClientsByClient','LIGA');
                    }
                }
            }
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
                    socket.emit('getSubClientsByClient',val);
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
                   }
               }, keypress:function(bt,e){
                    if(e.getKey() === e.ENTER && Ext.getCmp('cbbModeQuery').getValue() == 'Free'){
                        Ext.getCmp('btFind').fireEvent('click');
                    }
                }, keyup:function(bt,e){
                    if(e.getKey() === e.ENTER && Ext.getCmp('cbbModeQuery').getValue() == 'Free'){
                        Ext.getCmp('btFind').fireEvent('click');
                    }
                }
            }
        },{
            xtype: 'combo',
            width:150,
            store:storeWsType,
            displayField:'wsTypeName',
            valueField: 'wsTypeId',
            queryMode: 'local',
            value:[1,2],
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
            width: 120,
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
            xtype:'button',
            text:'Find',
            iconCls:'findCls',
            id:'btFind',
            listeners:{
                click:function(){
                    // when input is null
                    if(Ext.getCmp('txtSubClientNames').getRawValue() == ''){
                        Ext.Msg.alert('Status', 'textbox is null');
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
                            subClientNames:subClientNames,
                            wsTypes:Ext.getCmp('txtWsType').getValue()
                        };
                        Ext.getCmp('lblCountSClient').setText('sClients.length=' + subClientNames.length);
                        //send request find to server
                        socket.emit('findSites',data);
                    }
                }
            }
        },{
            xtype:'button',
            text:'Export RDG',
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
            text:'Export .TXT',
            iconCls:'exportTextCls',
            id:'btExportText',
            listeners:{
                click:function(){
                    socket.emit('exportText');
                }
            }
        },{
            xtype:'button',
            text:'Open FCfg Checking',
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
            text:'Config User',
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
                socket.emit('getSubClientsByClient','LIGA');
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
                                storeSubClient.loadData([]);
                            },2000);
                        }
                        else{
                            socket.emit('getSubClientsByClient','LIGA');
                        }
                        Ext.getCmp('cbbClientCfg').setValue(jsonCfg.clientName);
                        //Ext.getCmp('cbbGroupingCfg').setValue(jsonCfg.grouping);
                        Ext.getCmp('txtWsTypeCfg').setValue(jsonCfg.wsType);
                        Ext.getCmp('isGroupingExpand').setValue(jsonCfg.isGroupingExpand==false?false:true);
                        Ext.getCmp('isShowFCfgChecking').setValue(jsonCfg.isShowFCfgChecking==false?false:true);

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
                                    siteUrl:items[j].data.siteUrl
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
        style:{marginBottom: '20px', position: 'absolute', top: '35px', right: '0px', zIndex:999, padding:'10px'},
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
        title: 'Checking Config Params',
        bodyPadding: 5,
        width: 750,
        height:500,
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
                xtype:'checkbox',
                id:'useUrlCheckingDefault',
                boxLabel :'Use default url(for test local site)',
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
                value:urlCheckingDefault
            },{
                xtype:'textfield',
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
                height:100,
                //columnWidth: 0.5,
                //checkboxToggle: true,
                collapsed: false,
                //layout:'anchor',
                items:[{
                    xtype: 'radiogroup',
                    id:'rbBatMode',
                    //fieldLabel: 'Modes',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns:1,
                    vertical: false,
                    items: [
                        { boxLabel: 'Only Backup', name: 'rb', inputValue: 'b' },
                        { boxLabel: 'Only Deploy', name: 'rb', inputValue: 'd' },
                        { boxLabel: 'Backup then Deploy', name: 'rb', inputValue: 'bd',checked: true },
                    ]
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
            width:300,
            msgTarget: 'side',
            allowBlank: false,
            buttonText: 'Select Deploy Zip...',
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
            hidden:true,
            listeners: {
                click:function() {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {
                            form.submit({
                                url: 'checkdate/upload-file',
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
            width: 130,
            text:'Check Deploy all',
            iconCls:'checkCls',
            listeners:{
                click:function(){
                   // call event click of all button in grid
                    checkAllDeployingSite();
                }
            }
        },{
            xtype: 'button',
            width: 120,
            text:'Get folder all',
            iconCls:'hasNotFolderCls',
            listeners:{
                click:function(){
                    // call event click of all button in grid
                    getAllFolderSite();
                }
            }
        }],
        renderTo: Ext.getBody()
    });
    // Config page form
    Ext.create('Ext.form.Panel', {
        id:'formConfigPage',
        title: 'Config Default Values',
        bodyPadding: 5,
        width: 400,
        height:300,
        style:{marginTop: '20px', position: 'absolute', top: '50%', right: '300px', zIndex:999, padding:'5px'},
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
            width:300,
            height:350,
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
                }
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
                value:[1,2],
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
            },,{
                xtype:'checkbox',
                id:'isGroupingExpand',
                name:'isGroupingExpand',
                boxLabel :'Expand group when done finding',
                labelWidth:150,
                width:300,
                value:true
            },{
                xtype:'checkbox',
                id:'isShowFCfgChecking',
                name:'isShowFCfgChecking',
                boxLabel :'Show form Cfg Checking',
                labelWidth:150,
                width:300,
                value:true
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
});

// =========================================== FUNCTION UNIT ===========================================================
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
        var json = {success:true,files:[]}
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
// convert date from toString()
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
        if (isUseUrlCheckingDefault == false) {
            siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl');
            filesParam = Ext.getCmp('filesParam').getValue();
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
function getAllFolderSiteOneRow(grid, rowIndex){
    // create request to express server
    var folderPath =  grid.getStore().getAt(rowIndex).get('folderPath');
    if( folderPath != '') return;

    grid.getStore().getAt(rowIndex).set('folderPath',' '); // start checking
    // check url
    var siteName =  Ext.getCmp('txtUrlCheckingDefault').getValue();
    var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
    if(isUseUrlCheckingDefault==false) {
        siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl');
        filesParam = '/Public/GetDateModifiedOfFiles.aspx?files=';
    }
    // create a request post to server
    Ext.Ajax.request({
        url: 'checkdate/get-date-modified',
        params:{filesParam:filesParam,siteName:siteName},
        success: function(response) {
            var jsonObjsFromSite = JSON.parse(response.responseText);
            grid.getStore().getAt(rowIndex).set('folderPath',jsonObjsFromSite.path.replace(/\//g,'\\'));
        },

        failure: function(response) {
            console.log('server-side failure with status code ' + response.status);
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
function dzFileNameListGen(fileList){
    var strFileList = "";
    for(var i=0; i<fileList.length; i++){
        strFileList += fileList[i].fileName + '\r\n';
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
