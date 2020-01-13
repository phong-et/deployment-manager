/**
 * Created by Phillipet on 3/4/2016.
 */
// Checking form
Ext.onReady(function() {
    Ext.create('Ext.form.Panel', {
        id: 'formChecking',
        itemId: 'uploadManager',
        title: 'Upload Manager',
        bodyPadding: 5,
        width: 850,
        height: 500,
        style: {marginTop: '20px', position: 'absolute', top: '100px', left: '100px', zIndex: 999, padding: '5px'},
        frame: true,
        collapsible: true,
        resizable: true,
        draggable: true,
        layout: 'column',
        hidden: true,
        defaults: {
            anchor: '100%'
        },
        items: [{
            xtype: 'panel',
            id: 'fileListPanel',
            width: 440,
            height: 490,
            html: '<div style="height:80%;overflow: scroll" id="fileList"></div>',
        }, {
            xtype: 'panel',
            style: {marginLeft: '10px'},
            border: false,
            items: [{
                xtype: 'checkbox',
                id: 'useUrlCheckingDefault',
                boxLabel: 'Use URLs BO Test ',
                labelWidth: 150,
                width: 300,
                value: true,
                listeners: {
                    change: function (chb, newValue, oldValue) {
                        if (newValue == true) {
                            Ext.getCmp('fsBOTest').setDisabled(false);
                            Ext.getCmp('txtUrlCheckingDefault').setDisabled(false);
                        } else {
                            Ext.getCmp('fsBOTest').setDisabled(true);
                            Ext.getCmp('txtUrlCheckingDefault').setDisabled(true);
                        }
                    }
                }
            }, /*{
             xtype:'textfield',
             fieldLabel :'Url default',
             labelWidth:70,
             width:300,
             id:'txtUrlCheckingDefault',
             name:'txtUrlCheckingDefault',
             value:urlCheckingDefault
             },*/{
                xtype: 'combo',
                labelWidth: 100,
                width: 330,
                fieldLabel: 'URLs BO Test',
                store: storeSiteBOTest,
                displayField: 'urlName',
                valueField: 'urlName',
                queryMode: 'local',
                id: 'txtUrlCheckingDefault',
                itemId: 'txtUrlCheckingDefaultField',
                value: urlCheckingDefault,
                multiSelect: false,
                //enableKeyEvents:true,
                //shiftKey :true,
                doQuery: function (queryString, forceAll) {
                    this.expand();
                    this.store.clearFilter(!forceAll);

                    if (!forceAll) {
                        this.store.filter(this.displayField, new RegExp(Ext.String.escapeRegex(queryString), 'i'));
                    }
                },
                listeners: {
                    focus: function () {
                        Ext.getCmp('useUrlCheckingDefault').setValue(true);
                        if (Ext.getCmp('txtUrlCheckingDefault').getValue() == 'http://localhost/wsadabo_v1') {
                            Ext.getCmp('txtUrlCheckingDefault').setValue('');
                        }
                    }
                }

            }, {
                xtype: 'fieldset',
                id: 'fsBOTest',
                title: 'Upload & Checking',
                height: 80,
                //columnWidth: 0.5,
                //checkboxToggle: true,
                collapsed: false,
                layout: 'anchor',
                defaults: {marginLeft: '10px'},
                items: [{
                    xtype: 'button',
                    width: 100,
                    height: 40,
                    id: 'btUploadTestSite',
                    text: 'Upload',
                    iconCls: 'uploadTestSiteCls',
                    scale: 'medium',
                    style: {margin: '5px'},
                    listeners: {
                        click: function () {
                            if (Ext.getCmp('useUrlCheckingDefault').getValue() == false) {
                                Ext.Msg.alert('Info', 'Check to "Use URLs BO Test" checkbox please !');
                                return;
                            }
                            if (Ext.getCmp('txtUrlCheckingDefault').getValue() == '' || Ext.getCmp('txtUrlCheckingDefault').getValue() == null) {
                                Ext.Msg.alert('Info', 'URLs BO Test is blank')
                                return;
                            }
                            var dzFileName = Ext.getCmp('dzFileName').getValue();
                            if (dzFileName == '') {
                                Ext.Msg.alert('Missing params', 'Zip File haven\'t uploaded yet');
                                return;
                            }

                            var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue() + '/Public/GetDateModifiedOfFiles.aspx';
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            // create request to express server
                            Ext.getCmp('btUploadTestSite').setIconCls('checkingCls'); // start checking
                            Ext.getCmp('btUploadTestSite').setDisabled(true);
                            Ext.Ajax.request({
                                url: 'checkdate/upload-zip-deploy',
                                params: {siteName: siteName, dzFileName: dzFileName, action: 'u'},
                                success: function (response) {
                                    // parse jsonString from server
                                    var jsonR = JSON.parse(response.responseText);
                                    // done uploading
                                    if (jsonR.success == true) {
                                        Ext.getCmp('btUploadTestSite').setIconCls('zipUploadedCls');
                                        // generate then run bat file
                                        var urlCheckingDefault = Ext.getCmp('txtUrlCheckingDefault').getValue().split('/');
                                        var nameBatFile = urlCheckingDefault[urlCheckingDefault.length - 1] + "_" + Ext.getCmp('rbBatMode').getValue().rb + ".bat";
                                        var nameBkFile = $('#txtUserName').val() + '_' + getToday();
                                        var params = {
                                            dzFileName: Ext.getCmp('dzFileName').getValue(),
                                            dzFileNameList: dzFileNameListGen(jsonObjsZipFile),
                                            //bkFile:bkFile,
                                            //pathFolder:pathFolder,
                                            nameBatFile: nameBatFile,
                                            siteName: siteName,
                                            batMode: Ext.getCmp('rbBatMode').getValue().rb,
                                            nameBkFile: nameBkFile
                                        };
                                        // create request to server to generate and run bat
                                        setTimeout(function () {
                                            Ext.getCmp('btUploadTestSite').setIconCls('batUploadCls'); // start waiting generate and run bat phrase
                                        }, 1000);

                                        Ext.Ajax.request({
                                            url: 'checkdate/generate-bat-file',
                                            params: params,
                                            success: function (response) {
                                                var jsonResult = JSON.parse(response.responseText);
                                                // done generating and running phrase
                                                if (jsonResult.success == true) {
                                                    var checkingTime = Ext.getCmp('txtCheckingTime').getValue();
                                                    setTimeout(function () {
                                                        Ext.getCmp('btUploadTestSite').setIconCls('batUploadedCls');

                                                        // start demo count down clock
                                                        //var checkingTime = Ext.getCmp('txtCheckingTime').getValue(); // share with button check
                                                        Duration = parseInt(checkingTime);
                                                        //alert(Duration);
                                                        setFormatStart(Duration, "hour", "minute", "second");
                                                        iDuration = Duration;
                                                        setTimeout('start(Duration,"hour","minute","second")', 1000);
                                                        // end count down clock
                                                    }, 2000);

                                                    setTimeout(function () {
                                                        Ext.getCmp('btCheckTestSite').setIconCls('checkingCls'); // start checking
                                                        Ext.Ajax.request({
                                                            url: 'checkdate/get-date-modified',
                                                            params: {
                                                                filesParam: filesParam,
                                                                siteName: siteName,
                                                                nameBkFile: nameBkFile
                                                            },
                                                            success: function (response) {
                                                                // parse jsonString from server
                                                                var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g, '/'));
                                                                if (jsonObjsFromSite.success == true) {
                                                                    // compare two json object
                                                                    var result = compare2Json(jsonObjsFromSite.files, jsonObjsZipFile);
                                                                    if (result.success == true) {
                                                                        Ext.getCmp('btCheckTestSite').setIconCls('checkOkCls'); // checkOk
                                                                        Ext.getCmp('btCheckTestSite').setText('Check'); // checkOk
                                                                        //grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                                                    }
                                                                    else {
                                                                        Ext.getCmp('btCheckTestSite').setIconCls('checkKoCls'); // checkKo
                                                                        Ext.getCmp('btCheckTestSite').setText('Error');
                                                                        //grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                                                        jsonFailed[0] = result;
                                                                    }
                                                                    // format data infomation to row
                                                                    if (jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                                                                        var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                                                                        var sizeOfFile = fileInfo[1];
                                                                        sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                                                                        Ext.getCmp('lblModifiedDateOfBKFile').setText('Date Modified and Size: ' + fileInfo[0] + '-' + sizeOfFile + ' KB');
                                                                    }
                                                                    // empty file at server
                                                                    //grid.getStore().getAt(rowIndex).set('zipUpload', 1); // start checking
                                                                    Ext.Ajax.request({
                                                                        url: 'checkdate/upload-zip-deploy',
                                                                        params: {
                                                                            siteName: siteName,
                                                                            dzFileName: dzFileName,
                                                                            action: 'e'
                                                                        },
                                                                        success: function (response) {
                                                                            // parse jsonString from server
                                                                            var jsonR = JSON.parse(response.responseText);
                                                                            if (jsonR.success == true) {
                                                                                Ext.getCmp('btUploadTestSite').setIconCls('zipUploadEmptyCls');

                                                                                // empty file on express service
                                                                                var dzFileName =  Ext.getCmp('dzFileName').getValue();
                                                                                if(dzFileName != '' & dzFileName != null)
                                                                                    socket.emit('emptyFile',dzFileName);
                                                                            }
                                                                            else {
                                                                                Ext.getCmp('btUploadTestSite').setIconCls('zipUploadErrCls'); // temp use error image of upload err
                                                                                Ext.Msg.alert('Error empty file', jsonR.msg);
                                                                            }
                                                                        },
                                                                        failure: function (response) {
                                                                            Ext.Msg.alert('Bad connection network', 'server-side failure with status code - checkdate/upload-zip-deploy' + response.status);
                                                                            console.log('server-side failure with status code ' + response.status);
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    Ext.getCmp('btCheckTestSite').setIconCls('checkKoCls'); // checkKo
                                                                    Ext.getCmp('lblModifiedDateOfBKFile').setText('Date Modified and Size: ' + jsonObjsFromSite.modifiedDateOfBKFile);
                                                                }
                                                            },
                                                            failure: function (response) {
                                                                Ext.Msg.alert('Bad connection network', 'server-side failure with status code - checkdate/get-date-modified' + response.status);
                                                                console.log('server-side failure with status code - checkdate/get-date-modified ' + response.status);
                                                            }
                                                        });
                                                    }, (parseInt(checkingTime)+2) * 1000);
                                                    // stop here
                                                }
                                                else {
                                                    Ext.Msg.alert('Error generate Bat File', jsonResult.msg)
                                                }
                                            },

                                            failure: function (response) {
                                                Ext.Msg.alert('Bad connection network', 'server-side failure with status code - generate-bat-file' + response.status);
                                                console.log('server-side failure with status code - generate-bat-file' + response.status);
                                            }
                                        });
                                    }
                                    else {
                                        grid.getStore().getAt(rowIndex).set('aio', 20);
                                        Ext.Msg.alert('Error Upload', jsonR.msg);
                                    }
                                },
                                failure: function (response) {
                                    Ext.Msg.alert('Bad connection network', 'server-side failure with status code' + response.status);
                                    console.log('server-side failure with status code ' + response.status);
                                }
                            });

                            //Ext.getCmp('btUploadTestSite').setIconCls('zipUploadedCls'); // start checking

                        }
                    }
                },{
                    xtype:'button',
                    style:{margin:'5px 0 5px 5px'},
                    width:105,
                    height:40,
                    html: '<style type="text/css">span#button-1058-btnEl{margin-top: 2px}</style><div style="display: none;" id="hour"></div><img style="display: none;" src="images/clock/colon.gif" />' +
                    '<span id="minute"><img style="width:20px" src="../images/clock/c0.gif"><img style="width:20px" src="../images/clock/c0.gif"></span><span><img style="width:11px;" src="images/clock/colon.gif" /></span>' +
                    '<span id="second"><img style="width:20px" src="../images/clock/c0.gif"><img style="width:20px" src="../images/clock/c0.gif"></span><br />',
                },{
                    xtype: 'button',
                    width: 100,
                    height: 40,
                    text: 'Check',
                    id: 'btCheckTestSite',
                    iconCls: 'checkTestSiteCls',
                    scale: 'medium',
                    style: {margin: '5px'},
                    listeners: {
                        click: function () {
                            if (Ext.getCmp('useUrlCheckingDefault').getValue() == false) {
                                Ext.Msg.alert('Info', 'Check to "Use URLs BO Test" checkbox please !');
                                return;
                            }
                            if (Ext.getCmp('txtUrlCheckingDefault').getValue() == '' || Ext.getCmp('txtUrlCheckingDefault').getValue() == null) {
                                Ext.Msg.alert('Info', 'URLs BO Test is blank')
                                return;
                            }
                            if (Ext.getCmp('dzFileName').getValue() == '') {
                                Ext.Msg.alert('Missing params', 'Zip File haven\'t uploaded yet');
                                return;
                            }
                            if (Ext.getCmp('btCheckTestSite').getText() == 'Error') {
                                alert(JSON.stringify(jsonFailed[0]));
                                return;
                            }
                            // params
                            var siteName = Ext.getCmp('txtUrlCheckingDefault').getValue() + '/Public/GetDateModifiedOfFiles.aspx';
                            var isUseUrlCheckingDefault = Ext.getCmp('useUrlCheckingDefault').getValue();
                            if (isUseUrlCheckingDefault == false) {
                                siteName = 'http://' + grid.getStore().getAt(rowIndex).get('siteUrl') + '/Public/GetDateModifiedOfFiles.aspx';
                            }
                            var nameBkFile = $('#txtUserName').val() + '_' + getToday();
                            Ext.getCmp('btCheckTestSite').setIconCls('checkingCls'); // start checking
                            Ext.Ajax.request({
                                url: 'checkdate/get-date-modified',
                                params: {
                                    filesParam: filesParam,
                                    siteName: siteName,
                                    nameBkFile: nameBkFile
                                },
                                success: function (response) {
                                    // parse jsonString from server
                                    var jsonObjsFromSite = JSON.parse(response.responseText.replace(/\\/g, '/'));
                                    if (jsonObjsFromSite.success == true) {
                                        // compare two json object
                                        var result = compare2Json(jsonObjsFromSite.files, jsonObjsZipFile);
                                        if (result.success == true) {
                                            Ext.getCmp('btCheckTestSite').setIconCls('checkOkCls'); // checkOk
                                            Ext.getCmp('btCheckTestSite').setText('Check');
                                            //grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                        }
                                        else {
                                            Ext.getCmp('btCheckTestSite').setIconCls('checkKoCls'); // checkKo
                                            Ext.getCmp('btCheckTestSite').setText('Error'); // checkKo
                                            //grid.getStore().getAt(rowIndex).set('folderPath', jsonObjsFromSite.path.replace(/\//g, '\\'));
                                            jsonFailed[0] = result;
                                        }
                                        // format data infomation to row
                                        if (jsonObjsFromSite.modifiedDateOfBKFile != undefined) {
                                            var fileInfo = jsonObjsFromSite.modifiedDateOfBKFile.split('-');
                                            var sizeOfFile = fileInfo[1];
                                            sizeOfFile = formatCurrency(Math.round(parseFloat(sizeOfFile / (1024))));
                                            Ext.getCmp('lblModifiedDateOfBKFile').setText('Date Modified and Size: ' + fileInfo[0] + '-' + sizeOfFile + ' KB');
                                        }
                                    }
                                    else {
                                        Ext.getCmp('btCheckTestSite').setIconCls('checkKoCls'); // checkKo
                                        Ext.getCmp('btCheckTestSite').setText('Error'); // checkKo
                                        Ext.getCmp('lblModifiedDateOfBKFile').setText('Date Modified and Size: ' + jsonObjsFromSite.modifiedDateOfBKFile);
                                    }
                                },
                                failure: function (response) {
                                    Ext.Msg.alert('Bad connection network', 'server-side failure with status code - checkdate/get-date-modified' + response.status);
                                    console.log('server-side failure with status code - checkdate/get-date-modified ' + response.status);
                                }
                            });
                        }
                    }
                }]
            }, {
                xtype: 'label',
                id: 'lblModifiedDateOfBKFile',
                text: 'Date Modified and Size:',
                style: {margin: '10px 10px 10px 0px'}
            }, {
                xtype: 'textfield',
                fieldLabel: 'Files param',
                id: 'filesParam',
                editable: false,
                labelWidth: 75,
                width: 300,
                disabled: true,
                value: filesParam
            }, {
                xtype: 'textfield',
                fieldLabel: 'Deploy file name',
                id: 'dzFileName',
                editable: false,
                labelWidth: 150,
                width: 300,
                disabled: true,
                value: ''
            }, {
                // Fieldset in Column 2 - collapsible via checkbox, collapsed by default, contains a panel
                xtype: 'fieldset',
                title: 'Upload Mode',
                height: 100,
                //columnWidth: 0.5,
                //checkboxToggle: true,
                collapsed: false,
                //layout:'anchor',
                items: [{
                    xtype: 'radiogroup',
                    id: 'rbBatMode',
                    //fieldLabel: 'Modes',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: false,
                    items: [
                        {boxLabel: 'Only Backup', name: 'rb', inputValue: 'b'},
                        {boxLabel: 'Only Upload', name: 'rb', inputValue: 'd'},
                        {boxLabel: 'Backup then Upload', name: 'rb', inputValue: 'bd', checked: true},
                    ]
                }]
            }]
        }],
        tools: [{
            type: 'close',
            disabled: false,
            handler: function (event, toolEl, panelHeader) {
                // refresh logic
                Ext.getCmp('formChecking').setHidden(true);
            }
        }],
        tbar: [{
            xtype: 'filefield',
            name: 'zipFile',
            id: 'zipFile',
            fieldLabel: '',
            labelWidth: 0,
            width: 300,
            msgTarget: 'side',
            allowBlank: false,
            buttonText: 'Select .zip file to upload...',
            listeners: {
                change: function () {
                    // need filter at client also
                    // https://www.sencha.com/forum/showthread.php?286958-How-to-filter-file-types-in-extjs-5
                    var dzFileNamePath = Ext.getCmp('zipFile').getValue().split('\\');
                    var dzFileName = dzFileNamePath[dzFileNamePath.length - 1];
                    Ext.getCmp('dzFileName').setValue(dzFileName);
                    Ext.getCmp('btUpload').fireEvent('click');
                }
            }
        }, {
            xtype: 'button',
            text: 'Upload',
            id: 'btUpload',
            hidden: true,
            listeners: {
                click: function () {
                    var form = this.up('form').getForm();
                    if (form.isValid()) {
                        form.submit({
                            url: 'checkdate/upload-file',
                            waitMsg: 'Uploading your file...',
                            success: function (fp, o) {
                                if (o.result.success == false) {
                                    Ext.Msg.alert('Caution', '"' + o.result.file + '"');
                                    return;
                                }
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
                                    title: 'file list',
                                    width: 440,
                                    height: 400,
                                    store: store,
                                    rootVisible: true,
                                    scrollable: true,
                                    renderTo: 'fileList'
                                });

                                // enable upload button
                                Ext.getCmp('btUploadTestSite').setDisabled(false);
                                Ext.getCmp('btUploadTestSite').setIconCls('uploadTestSiteCls');
                                // reset check button iconCls
                                Ext.getCmp('btCheckTestSite').setIconCls('checkCls'); // checkKo
                                Ext.getCmp('btCheckTestSite').setText('Check'); // checkKo

                                Ext.getCmp('lblModifiedDateOfBKFile').setText('');

                            },
                            failure: function (fb, o) { // equals to o.result.success==false
                                if (o.result.success == false) {
                                    Ext.Msg.alert('Caution', '"' + o.result.file + '"');
                                    return;
                                }
                                else {
                                    alert(o.result.msg);
                                }
                            }
                        });
                    }
                }
            }
        }, {
            xtype: 'button',
            width: 85,
            hidden: true,
            text: 'view info',
            iconCls: 'viewInfoChecking',
            listeners: {
                click: function () {
                    Ext.Msg.alert('Info', 'jsonObjsZipFile=' + JSON.stringify(jsonObjsZipFile) + '<br/> filesParam=' + filesParam);
                }
            }
        }, {
            xtype: 'button',
            width: 130,
            text: 'Check Deploy all',
            iconCls: 'checkCls',
            hidden: true,
            listeners: {
                click: function () {
                    // call event click of all button in grid
                    // checkAllDeployingSite();
                }
            }
        }, {
            xtype: 'button',
            width: 120,
            text: 'Test Clock',
            iconCls: 'hasNotFolderCls',
            hidden: true,
            listeners: {
                click: function () {
                    // call event click of all button in grid
                    //getAllFolderSite();
                    // start demo count down clock
                    Duration = parseInt(Ext.getCmp('txtCheckingTime').getValue());
                    //alert(Duration);
                    setFormatStart(Duration, "hour", "minute", "second");
                    iDuration = Duration;
                    setTimeout('start(Duration,"hour","minute","second")', 1000);
                    // end count down clock
                }
            }
        }, {
            xtype: 'textfield',
            fieldLabel: 'Check time second',
            labelWidth: 120,
            width: 160,
            id: 'txtCheckingTime',
            name: 'txtCheckingTime',
            value: 15,
            //vtype:'numeric',
            maxLength: 2,
            allowBlank: false,
            //enableKeyEvents :true,
        }],
        listeners: {
            show: function (fromUploadManager) {
                Ext.getCmp('gridSite').setDisabled(true);
            },
            hide: function (fromUploadManager) {
                Ext.getCmp('gridSite').setDisabled(false);
            }
        },
        renderTo: Ext.getBody()
    })
});