/**
 * Created by Phillipet on 1/5/2018.
 */
var getCmp = function (query) {
  return Ext.ComponentQuery.query(query)[0];
};
function formatDuration(num) {
  if (num < 10)
    num = '0' + num
  return num;
}
var log = console.log
Ext.define('logTask', {
  extend: 'Ext.data.Model',
  fields: ['taskDate', 'taskIdRequest', 'taskClientName', 'taskDetail', 'taskSummary', 'taskStartTime', 'taskEndTime', 'taskDuration', 'taskStatus']
});
var storeLogTask = Ext.create('Ext.data.Store', {
  model: 'logTask'
});
var optionFind = "D"
Ext.onReady(function () {
  var gridTask = Ext.create('Ext.grid.Panel', {
    id: 'gridTaskLog',
    title: 'Task Log',
    frame: true,
    collapsible: true,
    resizable: true,
    header: false,
    height: Ext.getBody().getViewSize().height,
    width: Ext.getBody().getViewSize().width,
    store: storeLogTask,
    //selType: 'rowmodel',
    //masked: true,
    //multiSelect: false, // deprected 4.1.1
    selModel: Ext.create('Ext.selection.CheckboxModel', {
      mode: 'SINGLE',
      listeners: {
        selectionchange: function (model, selections) {
          //Ext.getCmp('formTaskConfirmation').loadRecord(selections);
        },
      }
    }),
    selType: 'cellmodel',
    plugins: {
      ptype: 'cellediting',
      clicksToEdit: 2
    },
    tbar:[{
      xtype:'button',
      text:'Refresh',
      iconCls:'refreshGridSiteCls',
      id:'btRefreshTask',
      listeners:{
          click:function() {
              // Ext.getCmp('btRefreshGridSite').setDisabled(true);
              // socket.emit('refreshFR');
          }
      }
    }],
    columns: [
      new Ext.grid.RowNumberer({ text: 'STT', width: 50 }),
      //  fields: ['taskDate','taskIdRequest','taskClientName','taskDetail', 'taskSumary','taskStartTime','taskEndTime', 'taskDuration','taskStatus']
      { text: 'Date', dataIndex: 'taskDate', width: 120 },
      { text: 'Request ID', dataIndex: 'taskIdRequest', width: 110 },
      { text: 'Client Name', dataIndex: 'taskClientName', width: 120 },
      { text: 'Task', dataIndex: 'taskDetail', width: 450 },
      { text: 'Resolution', dataIndex: 'taskSummary', width: 100 },
      // {
      //   text: 'Start Time', dataIndex: 'taskStartTime', width: 160, editor: {
      //     xtype: 'textfield'
      //   }
      // },
      // { text: 'End Time', dataIndex: 'taskEndTime', width: 160 },
      // { text: 'Duration', dataIndex: 'taskDuration', width: 90 },
      { text: 'Status', dataIndex: 'taskStatus', width: 80 }
      // renderer: function(value, metaData, record, rowIndex, colIndex, store, gridView){
      //     var date = new Date(value);
      //     //return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() ;
      //     return date.toLocaleDateString() + '-' + date.toLocaleTimeString();
      // }
    ],
    listeners: {
      viewready: function () {
        Ext.Ajax.request({
          url: '/site_log_task/get-log-task',
          method: 'GET',
          success: function (response) {
            var logs = JSON.parse(response.responseText);
            storeLogTask.loadData(logs);
          },
          failure: function (response) {
            console.log('server-side failure with status code ' + response.status);
          }
        })
      },
      selectionchange: function (grid, record) {

      },
      rowclick: function (grid, record, element, rowIndex, e, eOpts) {
        startDate = new Date().getTime()
        Ext.getCmp('taskStartTime2').setValue(new Date(startDate).toLocaleDateString("en-US").replace(/-/g, '/') + ' ' + new Date(startDate).toTimeString().substr(0, 8))
        popupTask.show();
        //var recordSelection = grid.getSelectionModel().getSelected();
        var record = grid.getStore().getAt(rowIndex); // Get the Record for the row
        //console.log(record);
        Ext.getCmp('formTaskConfirmation').loadRecord(record)
        gridTask.setDisabled(true)
      },
      edit: function (editor, e) {
        //e.record.commit()
      }
    },
    renderTo: 'gridTask'
  });
  var startDate
  var arrUsers = [['1CTpS_CY8pbOh5EpePpsXC9_qSsNZ6jzuGCHRnDKbgRw','phillip'],['1BNjxvJ4RTk8SQ1iZIgca6mtkJdD_OqT20AgVrYL38qQ','rooney'],['1ZuHny7Fa_BObEpvNKGxT2MFLYcE9sC3uwq5wAlWpgC8','seven']];
  function getSheetId(username){
    for(let i = 0; i<arrUsers.length; i++){
      if(arrUsers[i][1] === username)
        return arrUsers[i][0]
    }
  }
  var storeUsers= new Ext.data.ArrayStore({
    fields: ['userId','userName'],
    data: arrUsers
  });
  var popupTask = Ext.create('Ext.window.Window', {
    title: 'Task Confirmation',
    height: 700,
    width: 700,
    style: { top: 10, left: 50 },
    layout: 'fit',
    closeAction: 'method-hide',
    listeners: {
      hide: function () {
        gridTask.setDisabled(false)
      }
    },
    items: {  // Let's put an empty grid in just to illustrate fit layout
      xtype: 'form',
      id: 'formTaskConfirmation',
      header: false,
      frame: false,

      bodyPadding: 5,
      width: 350,

      // The form will submit an AJAX request to this URL when submitted
      url: 'save-form.php',

      // Fields will be arranged vertically, stretched to full width
      layout: 'anchor',
      defaults: {
        anchor: '100%'
      },

      // The fields
      defaultType: 'textfield',
      items: [{
        xtype:'combo',
        store:storeUsers,
        queryMode: 'local',
        displayField: 'userName',
        valueField: 'userName',
        fieldLabel: 'Select User',
        hidden:false,
        id:'cbbUserName',
        listeners:{
          change:function(ob,username){
          }
        }
      },{
        fieldLabel: 'Email Subject',
        name: 'taskSubject',
        editable: false,
      }, {
        fieldLabel: 'Request ID',
        name: 'taskIdRequest',
        id: 'taskIdRequest'
      }, {
        fieldLabel: 'Client Name',
        name: 'taskClientName',
        id: 'taskClientName'
      }, {
        fieldLabel: 'Start Time',
        hidden:true,
        //name: 'taskStartTime',
        editable: true,
        id: 'taskStartTime2',
        listeners: {
          change: function (_this, newValue, oldValue) {
            let y, month, d, h, m, s, mdy, time, date
            date = newValue.split(' ')
            mdy = date[0].split('/')
            month = mdy[0] - 1
            d = mdy[1]
            y = mdy[2]
            time = date[1].split(':')
            h = time[0]
            m = time[1]
            s = time[2]
            startDate = new Date(y, month, d, h, m, s, 0).getTime()
            //log(startDate)
          }
        }
      }, {
        xtype: 'checkbox',
        hidden:true,
        value: true,
        id: 'cbEndTime',
        boxLabel: 'Use system time for End Time',
        listeners: {
          change: function (_this, newValue, oldValue) {
            this.next().setDisabled(_this.checked)
            // var boxLabel = _this.checked ? 'End time is used by system time':'Adjsut end time'
            // _this.setBoxLabel(boxLabel)
          }
        }
      }, {
        fieldLabel: 'End Time',
        hidden:true,
        //name: 'taskStartTime',
        editable: true,
        id: 'taskEndTime2',
        disabled: true,
        value: new Date().toLocaleDateString("en-US").replace(/-/g, '/') + ' ' + new Date().toTimeString().substr(0, 8)
      }, {
        xtype: 'textareafield',
        fieldLabel: 'Task Detail',
        height: 180,
        editable: true,
        name: 'taskDetail',
        id: 'taskDetail'
      }, {
        xtype: 'checkbox',
        boxLabel: 'Use Summary AI Engine(Only the DREAM)'
      }, {
        xtype: 'button',
        text: 'Copy to summary task',
        margin: 5,
        handler: function () {
          var value = this.prev().prev().getValue()
          this.next().setValue(value)
        }
      }, {
        xtype: 'textareafield',
        fieldLabel: 'Summary Task',
        name: 'taskSummary',
        id: 'taskSummary',
        height: 100,
        allowBlank: false
      }, {
        xtype: 'combo',
        store: ['Done', 'Queued', 'Pending'],
        queryMode: 'local',
        displayField: 'statusName',
        valueField: 'statusName',
        fieldLabel: 'Select Status',
        editable: false,
        value: 'Done',
        //labelWidth: 80,
        //width: 180,
        id: 'txtStatus',
      }],
      listeners: {
        boxready: function () {
            // var userType = $('#txtUserType').val()
            var username = $('#txtUserName').val()
            var cbbUserName = Ext.getCmp('cbbUserName')
            cbbUserName.setValue(username)
        }
      },
      // Reset and Submit buttons
      buttons: [{
        id: 'btDone',
        text: 'Done',
        formBind: true, //only enabled once the form is valid
        disabled: true,
        handler: function () {
          var recordSelected = gridTask.getSelectionModel().getSelected().getRange()
          //console.log(recordSelected)
          var task = recordSelected[0].data
          //console.log(task)
          var endDate = new Date().getTime()
          if (!Ext.getCmp('cbEndTime').checked) {
            var endTime = Ext.getCmp('taskEndTime2').getValue()
            let y, month, d, h, m, s, mdy, time, date
            date = endTime.split(' ')
            mdy = date[0].split('/')
            month = mdy[0] - 1
            d = mdy[1]
            y = mdy[2]
            time = date[1].split(':')
            h = time[0]
            m = time[1]
            s = time[2]
            endDate = new Date(y, month, d, h, m, s, 0).getTime()
          }
          var duration = Math.floor((endDate - startDate) / 1000)

          log(`startDate:${new Date(startDate)} - ${startDate}`)
          log(`endtDate:${new Date(endDate)} - ${endDate}`)
          log(`duration:${duration}`)
          var hours = Math.floor(duration / 3600)
          var minutes = Math.floor((duration % 3600) / 60)
          var second = (duration - hours * 3600 - minutes * 60)
          task.taskStartTime = new Date(startDate).toLocaleDateString("en-US").replace(/-/g, '/') + ' ' + new Date(startDate).toTimeString().substr(0, 8)
          task.taskEndTime = new Date(endDate).toLocaleDateString("en-US").replace(/-/g, '/') + ' ' + new Date(endDate).toTimeString().substr(0, 8)
          task.taskDuration = formatDuration(hours) + ':' + formatDuration(minutes) + ':' + formatDuration(second)

          task.taskSummary = Ext.getCmp('taskSummary').getValue()
          task.taskStatus = Ext.getCmp('txtStatus').getRawValue()
          task.taskClientName = Ext.getCmp('taskClientName').getValue()
          task.taskIdRequest =  Ext.getCmp('taskIdRequest').getValue()
          task.taskDetail =  Ext.getCmp('taskDetail').getValue()
          // if(task.taskClientName == '' || task.taskClientName == null || task.taskClientName == undefined){
          //   task.taskClientName = Ext.getCmp('taskClientName').getValue()
          // }
          log(JSON.stringify(task))

          btDone = Ext.getCmp('btDone')
          btDone.setIconCls('spinCls');
          btDone.setDisabled(true);

          Ext.Ajax.request({
            url: '/site_log_task/append-log-task',
            method: 'POST',
            params: {
              task: JSON.stringify(task),
              sheetId:getSheetId(Ext.getCmp('cbbUserName').getValue())
            },
            success: function (response) {
              var data = JSON.parse(response.responseText)
              var success = data.success
              if (success) {
                popupTask.hide()
                btDone.setIconCls('');
                btDone.setDisabled(false);
              }
              else {
                alert(response.responseText)
                btDone.setIconCls('');
                btDone.setDisabled(false);
              }
              gridTask.setDisabled(false)
            },
            failure: function (response) {
              console.log('server-side failure with status code ' + response.status);
            }
          })
        }
      }],
    }
  })

});
