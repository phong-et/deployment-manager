/**
 * Created by Phillipet on 1/5/2018.
 */
var getCmp = function (query) {
  return Ext.ComponentQuery.query(query)[0];
};

Ext.define('log', {
  extend: 'Ext.data.Model',
  fields: ['fileUserUpload','fileUploadedDate','fileName','fileClientName', 'fileWsType']
});
var storeLog = Ext.create('Ext.data.Store', {
  model: 'log'
});

var arrUsers = [['All','all'],['Phillip','phillip'],['Andrew','andrew'],['Nick','nick'],['Seven','seven'],['Rooney','rooney'],['Vu','vuet'],['Thang','thang']];
var storeUsers= new Ext.data.ArrayStore({
  fields: ['userId','userName'],
  data: arrUsers
});
var optionFind = "D"
Ext.onReady(function() {
  var gridUser = Ext.create('Ext.grid.Panel',{
      id: 'gridUserLog',
      title: 'User Log',
      frame: true,
      collapsible: true,
      resizable: true,
      header:false,
      height: Ext.getBody().getViewSize().height,
      width: Ext.getBody().getViewSize().width,
      store: storeLog,
      selType: 'cellmodel',
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
          new Ext.grid.RowNumberer({text: 'STT', width:50}),
          { text: 'User Name', dataIndex: 'fileUserUpload', width:100},
          { text: 'Client Name', dataIndex: 'fileClientName', width:200},
          { text: 'WS Type', dataIndex: 'fileWsType', width:200},
          { text: 'File Name', dataIndex: 'fileName', width:320},
          { text: 'Date', dataIndex: 'fileUploadedDate', width:200,
              renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView){
                  var date = new Date(value);
                  //return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() ;
                  return date.toLocaleDateString() + '-' + date.toLocaleTimeString();
              }
          }
      ],
      tbar:[{
            xtype:'combo',
            store:storeUsers,
            queryMode: 'local',
            displayField: 'userName',
            valueField: 'userName',
            fieldLabel: 'Select User',
            labelWidth:80,
            width:180,
            hidden:false,
            id:'cbbUserName',
            listeners:{
              change:function(ob,username){
                var date = Ext.getCmp('txtThreadDate').getRawValue()
                var dates = date.split('/'), day = 0, month = 0, year = 0
                if(optionFind == "D"){
                    day = dates[0], month = dates[1], year = dates[2]
                }
                else if(optionFind == "M"){
                    month = dates[0], year = dates[1]
                }
                else if(optionFind == "Y"){
                    year = dates[0]
                }
                Ext.Ajax.request({
                  url: '/user_deploy_statistic/get-file-user-by-date',
                  method: 'POST',
                  params: {username, day, month, year, optionFind},
                  success: function (response) {
                    var logs = JSON.parse(response.responseText);
                    storeLog.loadData(logs);
                  }, 
                  failure: function (response) {
                    console.log('server-side failure with status code ' + response.status);
                  }
                })
              }
            }
          },
          {
            xtype: 'radiogroup',
            id: 'rbOptionFind',
            items: [{
                boxLabel: 'Day ',
                inputValue: 'D',
                name: 'rb',
                id: 'cbD',
                labelWidth: 35,
                width: 70,
                checked:true
            }, {
                boxLabel: 'Month ',
                inputValue: 'M',
                name: 'rb',
                id: 'cbM',
                labelWidth: 35,
                width: 70
            }, {
                boxLabel: 'Year ',
                inputValue: 'Y',
                name: 'rb',
                id: 'cbY',
                labelWidth: 35,
                width: 70
            }],
            listeners: {
                change: function (rb, newValue) {
                    optionFind = newValue.rb;
                    switch (optionFind) {
                        // Tb : Top bar                        
                        case "D": {
                            //Ext.getCmp('txtThreadDate').setDisabled(false)
                            Ext.getCmp('txtThreadDate').format = 'd/m/Y'
                            Ext.getCmp('txtThreadDate').setValue(new Date())
                            break;
                        }
                        case "M" : {
                            //Ext.getCmp('txtThreadDate').setDisabled(false)
                            Ext.getCmp('txtThreadDate').format = 'm/Y'
                            Ext.getCmp('txtThreadDate').setValue(new Date())
                            break;
                        }
                        case "Y" : {
                            //Ext.getCmp('txtThreadDate').setDisabled(false)
                            Ext.getCmp('txtThreadDate').format = 'Y'
                            Ext.getCmp('txtThreadDate').setValue(new Date())
                            break;
                        }
                    }
                    var cbbUserName = Ext.getCmp('cbbUserName')
                    cbbUserName.fireEvent('change',cbbUserName,cbbUserName.getRawValue());
                }
            }
        }, {
            xtype: 'datefield',
            fieldLabel: 'Select Date',
            format: 'd/m/Y',
            name: 'txtThreadDate',
            id: 'txtThreadDate',
            labelWidth: 100,
            width: 230,
            value: new Date(),
            allowBlank: false,
            listeners: {
                change: function () {
                    var cbbUserName = Ext.getCmp('cbbUserName')
                    cbbUserName.fireEvent('change',cbbUserName,cbbUserName.getRawValue());
                }
            }
        },
      ],
      listeners:{
        viewready:function(){
            var userType = $('#txtUserType').val()
            var username = $('#txtUserName').val()
            var cbbUserName = Ext.getCmp('cbbUserName')
            if(userType !== "ad"){
                // var cbbUserName = Ext.getCmp('cbbUserName')
                cbbUserName.setValue(username)
                if(username === 'phillip')
                    cbbUserName.setHidden(false)
            }
            else{
                cbbUserName.setHidden(false)
            }
        }
      },
      renderTo:'divGridUser'
  });
});
