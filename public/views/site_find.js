/**
 * Created by Phillipet on 11/15/2015.
 */
Ext.define('site', {
    extend: 'Ext.data.Model',
    fields: ['siteUrl','clientName','subClientName','wsType','ipAddrL','folderPath']
});
Ext.define('subclient', {
    extend: 'Ext.data.Model',
    fields: ['_id','subClientName']
});
var storeSite = Ext.create('Ext.data.Store', {
    model: 'site',
    groupField: 'subClientName'
});
var storeSubClient = Ext.create('Ext.data.Store', {
    model: 'subclient',
});
/*
 var storeSite = Ext.create('Ext.data.ArrayStore', {
 model: 'site',
 storeId:'storeSite',
 data:[{siteUrl:'www.ligabola.co',clientName:'LIGA',subClientName:'LIGABOLA',wsType:'MAIN',ipAddrL:'192.168.99.60',folderPath:'C:\\web\\Ligabola_Main'}]
 });
 */
/*var storeSubClient = Ext.create('Ext.data.ArrayStore', {
 model: 'subClient',
 data:[['LIGA365','LIGA365'],['INDOBET365','INDOBET365'],['323BET','323BET'],['HANABET','HANABET'],['LIGABOLA','HANABET'],['FT95','HANABET'],['OLB365','HANABET']]
 });*/
var clients = {
    'LIGA':['LIGA365','INDOBET365','323BET','HANABET','LIGABOLA','FT95','LIGA88','OLB365','BOLA228','AFB365','KLIK365','WIN228','INIDEWA365','BOLAPELANGI','9IKANBET','IM2BET','SOTOBET','AQ88BET','PASARANMURAH','UTAMABET','JASABOLA','MALAIKATBET','KLIKBET','LAPAK365','KAPALJUDI','INDOMAXBET','BOLA168','DBSBET','HOKI365','INDOWINS','LIGAEMAS'],
    'UBO':['UBOBET','7METER','7UPBET'],
    'AFB':['AFB88','AFB365']
};

var storeGrouping = new Ext.data.ArrayStore({
    fields: ['gId','gName'],
    data: [['subClientName', 'Sub Client'],['ipAddrL', 'Local IP']]
});
var storeWsType = new Ext.data.ArrayStore({
    fields: ['wsTypeId','wsTypeName'],
    data: [[0,'All'],[25,'ADMIN'],[3,'AGENT'],[18,'AGENT Cash'],[35,'AGENT TEST'],[22,'API'],[41,'BANNER'],[6,'BO'],[33,'BO Test'],[34,'BO TRAIN'],[19,'CASINO LINK'],[12,'CHAT'],[9,'EGAME'],[27,'EGAME COMM'],[40,'INDEX'],[24,'LAPI'],[8,'MAIL'],[1,'MAIN'],[16,'MAIN TEST'],[26,'MAINTENANCE'],[2,'MEMBER'],[17,'MEMBER TEST'],[31,'MRTG'],[20,'ODDS'],[14,'OM'],[15,'OTHERS'],[21,'PHONE'],[13,'REDIRECT'],[29,'REPORT'],[30,'SERVICE'],[10,'SHARECACHE'],[36,'SMART'],[32,'SPORT'],[7,'STATS'],[11,'VIDEO'],[5,'WAP AGENT'],[4,'WAP MEMBER']]
});

// Global variable
var isLoadedGridUser;

var feature = Ext.create('Ext.grid.feature.Grouping', {
    startCollapsed: true,
    groupers: [{
        property: 'asset',
        groupFn: function (val) {
            return val.data.name;
        }
    }]
});
Ext.onReady(function() {
    var grid = Ext.create('Ext.grid.Panel',{
        id: 'gridSite',
        title: 'SubClient list',
        header:false,
        //frame: true,
        //collapsible: true,
        resizable: true,
        //draggable: true,
        height: Ext.getBody().getViewSize().height,
        width: '100%',
        //style: { marginBottom: '20px', zIndex: 999999, position: 'absolute', top: '0px', left: '0px' },
        store: storeSite,
        selType: 'cellmodel',
        plugins: {
            ptype: 'rowediting',
            clicksToEdit:2
        },
        features: [
            feature
            //{ ftype: 'grouping' }
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
            new Ext.grid.RowNumberer({text: 'STT', width:80}),
            { text: 'Website', dataIndex: 'siteUrl', width:200,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '" target="_blank" title="go to site">' + value + '</a>';
                }
            },
            { text: 'Mainsite', dataIndex: 'siteUrl', width:100,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="siteUrl" href="http://' + value + '/Main.aspx" target="_blank" title="go to site">Main.aspx</a>';
                }
            },
            { text: 'Client', dataIndex: 'clientName', width: 100},
            { text: 'Sub Client', dataIndex: 'subClientName', width:150},
            { text: 'ws Type', dataIndex: 'wsType', width:100},
            { text: 'IP Local', dataIndex: 'ipAddrL', width:150,
                editor:{
                    type:'textfield',
                    editable:false
                }
            },
            { text: 'Folder web', dataIndex: 'folderPath', width:200,
                editor:{
                    type:'textfield'
                }
            },{
                text:'Update',
                dataIndex: 'siteUrl',
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="aUpdate" href="#" title="add or update" onclick="return addOrUpdate(' + record + ');"><img src="images/site/update.png"/></a>';
                }
            },{
                text: 'Remote', dataIndex: 'ipAddrL', width:100,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView) {
                    return '<a class="aUpdate" href="#" title="add or update" onclick="return openRemoteDesktop(' + record + ');"><img src="images/site/update.png"/></a>';
                }
            }
        ],
        tbar:[{
            xtype: 'combo',
            width: 85,
            store: ['Hard','Free'],
            queryMode: 'local',
            name: 'cbbModeQuery',
            id:'cbbModeQuery',
            value:'Hard',
            listeners:{
                change:function(cb,val){
                    if(val=='Free'){
                        Ext.getCmp('cbbSelectAll').setDisabled(true);
                        Ext.getCmp('cbbClient').setDisabled(true);
                        storeSubClient.loadData([]);
                    }
                    else{
                        Ext.getCmp('cbbSelectAll').setDisabled(false);
                        Ext.getCmp('cbbClient').setDisabled(false);
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
            width: 400,
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

            }
        },{
            xtype: 'combo',
            width:150,
            store:storeWsType,
            displayField:'wsTypeName',
            valueField: 'wsTypeId',
            queryMode: 'local',
            value:[1,2],
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
            xtype: 'combo',
            labelWidth:50,
            width: 170,
            store: storeGrouping,
            queryMode: 'local',
            displayField: 'gName',
            valueField: 'gId',
            fieldLabel: 'Group',
            name: 'cbbGrouping',
            id:'cbbGrouping',
            value:'subClientName',
            listeners:{
                change:function(cb,val){
                    storeSite.setGroupField(val);
                    //alert(val);
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
        }],
        listeners:{
            viewready:function(){
                socket.emit('getSubClientsByClient','LIGA');
            }
        },
        renderTo:'gridSubClient'
    });

    // Explicitly create a Container
    Ext.create('Ext.form.Panel', {
        id:'formLogging',
        title: 'Logging Socket.io Server',
        bodyPadding: 5,
        width: 300,
        height:420,
        style:{marginBottom: '20px', position: 'absolute', top: '10%', right: '20%', zIndex:999, padding:'10px'},
        frame: true,
        collapsible: true,
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
        html:'<pre style="height: 95%; overflow:scroll" id=\'logging\'></pre>',
        renderTo: Ext.getBody()
    });

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
});

function addOrUpdate(record){
    var jsonSite = record;
    socket.emit('addSite',jsonSite);
}