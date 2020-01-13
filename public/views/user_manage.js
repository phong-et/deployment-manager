/**
 * Created by Phillipet on 11/15/2015.
 */
var getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
};

Ext.define('mdUser', {
    extend: 'Ext.data.Model',
    //fields: ['userId','userName','token','connectionId','status','folderPath'],
    url: '/user_manage/get-users',
    proxy: {
        type: 'ajax',
        //url: '/user_manage/get-users',
        reader: {
            type: 'json'
        },
        api: {
            read: '/user_manage/get-users',
            update: '/user_manage/update-users',
            destroy: '/user_manage/delete-users'
        },
        writer: {
            type: 'json',
            dateFormat: 'd/m/Y',
            writeAllFields: true,
            allowSingle: true
        }
    }
});

var stUser = Ext.create('Ext.data.Store', {
    autoSync: true,
    autoLoad:true,
    storeId: 'stUser',
    model: 'mdUser'
});
var stUserType =[['ad','Admin'],['fe','FE'],['bo','BO']];
var popUser= Ext.create('Ext.window.Window', {
    title: '<i class="fa fa-user-plus"></i> Add user',
    width: 500,
    closeAction: 'hide',
    layout: 'fit',
    items: [{
        xtype: 'form',
        url: '/user_manage/update-users',
        itemId: 'frmUser',
        bodyStyle: 'border-width: 0px 0px 1px 0px',
        layout: 'hbox',
        bodyPadding: '5 5 0',
        defaults: {
            border: false,
            xtype: 'panel',
            flex: 1,
            layout: 'anchor',
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                selectOnFocus: true,
                msgTarget: 'side',
                anchor: '-5'
            }
        }, items: [{
            items: [{
                fieldLabel: 'User Name',
                name: 'userName',
                minLength:3,
                allowBlank:false
            }]

        }, {
            items: [{
                inputType:'password',
                fieldLabel: 'Password',
                itemId:'txtPassword',
                anchor: '100%',
                minLength:3,
                name: 'password',
                allowBlank:false
            }]
        },{
            items: [{
                xtype:'combo',
                fieldLabel: 'User Type',
                anchor: '100%',
                style:{marginLeft:'5px'},
                name: 'userType',
                value:'fe',
                store:stUserType
            }]
        }],
        buttons: ['->', {
            text: 'Add',
            itemId: 'btnAddSup',
            iconCls: 'addCls',
            handler: function (t) {
                var txtPassword = getCmp('#txtPassword');
                txtPassword.setValue(sha512(txtPassword.getValue()));
                t.disable();
                getCmp('#frmUser').submit({
                    clientValidation: true,
                    url: '/user_manage/add-users',
                    success: function (form, action) {
                        t.enable();
                        //Ext.Msg.alert('Success!', action.result.msg);
                        stUser.reload();
                        getCmp('#frmUser').reset();
                    },
                    failure: function (form, action) {
                        t.enable();
                        if (action.failureType != 'client') {
                            Ext.Msg.alert('Failed!', action.result.msg);
                        }
                    }
                });
            }
        }, {
            text: 'Save',
            itemId: 'btnSaveSup',
            iconCls: 'saveCls',
            handler: function (t) {
                t.disable();
                getCmp('#frmUser').submit({
                    clientValidation: true,
                    success: function (form, action) {
                        t.enable();
                        //Ext.Msg.alert('Success!', action.result.msg);
                        stUser.reload();
                    },
                    failure: function (form, action) {
                        t.enable();
                        if (action.failureType != 'client') {
                            Ext.Msg.alert('Failed!', action.result.msg);
                        }
                    }
                });
            }
        }, {
            text: 'Cancel',
            iconCls: 'cancelCls',
            handler: function () {
                popUser.hide();
            }
        },{
            text: 'Reset',
            iconCls: 'resetCls',
            handler: function () {
                getCmp('#frmUser').reset();
            }
        }]
    }]
});

Ext.onReady(function() {
    var gridUser = Ext.create('Ext.grid.Panel',{
        id: 'gridUser',
        title: 'User list',
        frame: true,
        collapsible: true,
        resizable: true,
        //draggable: true,
        header:false,
        height: Ext.getBody().getViewSize().height,
        width: Ext.getBody().getViewSize().width,
        //maxWidth:1024,
        //maxHeight:600,
        //style: { marginBottom: '20px', zIndex: 999999, position: 'absolute', top: '70px', right: '10px' },
        store: stUser,
        selType: 'cellmodel',
        plugins: {
            ptype: 'cellediting',
            clicksToEdit:2
        },
        features: [{ ftype: 'grouping' }],
        masked:true,
        multiSelect: true,
        selModel: Ext.create('Ext.selection.CheckboxModel', {
            mode: 'SIMPLE',
            listeners: {
                selectionchange: function (model, selections) {
                }
            }
        }),
        tools:[{
            type:'close',
            handler: function(event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('gridUser').setHidden(true);
            }
        }],
        viewConfig: {
            getRowClass: function(record, rowIndex, rowParams, store){
                return record.get("status")=="online" ? "online" : "offline";
            }
        },
        columns:[
            new Ext.grid.RowNumberer({text: 'STT', width:70}),
            { text: 'User name', dataIndex: 'userName', width:150},
            { text: 'Password', dataIndex: 'password', width:150},
            { text: 'Status', dataIndex: 'status', width: 100,
                editor:{xtype:'combo',store:['online','offline','locked']}
            },
            { text: 'Socket Id', dataIndex: 'socketId', width:200, editor:{xtype:'textfield'}},
            { text: 'LastLDate', dataIndex: 'lastLDate', width:200,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView){
                    var date = new Date(value);
                    //return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() ;
                    return date.toLocaleDateString() + '-' + date.toLocaleTimeString();
                }
            },
            //{ text: 'Token', dataIndex: 'token', width:200},
            { text: 'User Type', dataIndex: 'userType', width:100,
                editor:{xtype:'combo',store:stUserType}
            },
            {
                xtype: 'actioncolumn',
                width: 85,
                sortable: false,
                menuDisabled: true,
                text:'Delete',
                items: [{
                    iconCls: 'del',
                    handler: function (grid, rowIndex) {
                        Ext.Msg.confirm('Confirmation', 'Are you sure ?', function (btn) {
                            if (btn == 'yes') {
                                grid.getStore().removeAt(rowIndex);
                            }
                        });
                    }
                }]
            }
        ],
        tbar:[{
                iconCls:'addUserCls',
                xtype:'button',
                text:'Add user',
                handler:function(){
                    popUser.show();
                    getCmp('#btnSaveSup').hide();

                }
            },{
                iconCls:'refreshUserCls',
                xtype:'button',
                text:'Refresh',
                handler:function(){
                    stUser.reload();
                }
            }
        ],
        listeners:{
            itemclick: function(grid, record, items, index, e, eOpts) {

            },
            viewready: function(){
                //socket.emit('getUsers');
            },
            edit: function(editor, e) {
                e.record.commit();
            }
        },
        renderTo:'divGridUser'
    });
});