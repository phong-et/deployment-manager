/* New json record :
	data = {
		userName,
		password,
		...
		...
	}
	data.records = [{
		_groupkey:,
		sites:[{
			ipAddrL:,
			siteUrl:
		},{
			
		}
		...
		...
		]
	},{
		
	}
	...
	...
	...
	]
*/
module.exports.createXMLGroups = function(data,callback){
	var strXmlG = "";
	// create file 
	strXmlG +=['<?xml version="1.0" encoding="utf-8"?>',
	'<RDCMan schemaVersion="1">',
    '\t<version>' + data.version + '</version>',
    '\t<file>',
        '\t\t<properties>',
            '\t\t\t<name>' + data.name + '</name>',
            '\t\t\t<expanded>True</expanded>',
            '\t\t\t<comment />',
            '\t\t\t<logonCredentials inherit="None">',
                '\t\t\t\t<userName>' + data.username + '</userName>',
                '\t\t\t\t<domain />',
                '\t\t\t\t<password storeAsClearText="True">' + data.password + '</password>',
            '\t\t\t</logonCredentials>',
            '\t\t\t<connectionSettings inherit="FromParent" />',
            '\t\t\t<gatewaySettings inherit="FromParent" />',
            '\t\t\t<remoteDesktop inherit="None">',
                '\t\t\t\t<size>' + data.screen + '</size>',
                '\t\t\t\t<sameSizeAsClientArea>False</sameSizeAsClientArea>',
                '\t\t\t\t<fullScreen>False</fullScreen>',
                '\t\t\t\t<colorDepth>' + data.colorDepth + '</colorDepth>',
            '\t\t\t</remoteDesktop>',
           '\t\t\t<localResources inherit="None">',
                '\t\t\t\t<audioRedirection>0</audioRedirection>',
                '\t\t\t\t<audioRedirectionQuality>0</audioRedirectionQuality>',
                '\t\t\t\t<audioCaptureRedirection>0</audioCaptureRedirection>',
                '\t\t\t\t<keyboardHook>2</keyboardHook>',
                '\t\t\t\t<redirectClipboard>True</redirectClipboard>',
                '\t\t\t\t<redirectDrives>True</redirectDrives>',
                '\t\t\t\t<redirectPorts>False</redirectPorts>',
                '\t\t\t\t<redirectPrinters>False</redirectPrinters>',
                '\t\t\t\t<redirectSmartCards>False</redirectSmartCards>',
            '\t\t\t</localResources>',
            '\t\t\t<securitySettings inherit="FromParent" />',
            '\t\t\t<displaySettings inherit="None">',
                '\t\t\t<thumbnailScale>1</thumbnailScale>',
                '\t\t\t<liveThumbnailUpdates>True</liveThumbnailUpdates>',
                '\t\t\t<showDisconnectedThumbnails>True</showDisconnectedThumbnails>',
            '\t\t\t</displaySettings>',
        '\t\t</properties>'].join('\r');
	
	// create group
	var records = data.records;	
	for(var i=0; i<records.length; i++){
		 strXmlG += ['\r\t\t<group>',
            '\t\t\t<properties>',
                '\t\t\t\t<name>' + records[i]._groupKey + '</name>',
                '\t\t\t\t<expanded>False</expanded>',
                '\t\t\t\t<comment />',
                '\t\t\t\t<logonCredentials inherit="FromParent" />',
                '\t\t\t\t<connectionSettings inherit="FromParent" />',
                '\t\t\t\t<gatewaySettings inherit="FromParent" />',
                '\t\t\t\t<remoteDesktop inherit="FromParent" />',
                '\t\t\t\t<localResources inherit="FromParent" />',
                '\t\t\t\t<securitySettings inherit="FromParent" />',
                '\t\t\t\t<displaySettings inherit="FromParent" />',
            '\t\t\t</properties>'].join('\r');
		var sites = records[i].sites;
		for(var j=0; j<sites.length; j++){
			strXmlG += createXMLServer(sites[j].ipAddrL,sites[j].siteUrl);
		
		}
		strXmlG +='\t\t</group>\r';
	}
	strXmlG +='\t</file>\r';
	strXmlG +='</RDCMan>';
	callback(strXmlG)
	//return strXmlG;
	
};
function createXMLServer(ipAddrL,siteUrl){
	var strXml =['\r\t\t\t<server>',
                '\t\t\t\t<name>' + ipAddrL + '</name>',
                '\t\t\t\t<displayName>' + siteUrl + '</displayName>',
                '\t\t\t\t<comment />',
                '\t\t\t\t<logonCredentials inherit="FromParent" />',
                '\t\t\t\t<connectionSettings inherit="FromParent" />',
                '\t\t\t\t<gatewaySettings inherit="FromParent" />',
                '\t\t\t\t<remoteDesktop inherit="FromParent" />',
                '\t\t\t\t<localResources inherit="FromParent" />',
                '\t\t\t\t<securitySettings inherit="FromParent" />',
                '\t\t\t\t<displaySettings inherit="FromParent" />',
            '\t\t\t</server>\r'].join('\r');
	return strXml;
};
//console.log(createXMLServer('192.168.99.110','HAHA.com'));

// export to excel file (tab column)
module.exports.exportText = function(d,callback){
    var strText = "";
    for(var i=0; i<d.length; i++){
        strText += 'http://' + d[i].siteUrl + '\t' + d[i].clientName + '\t' + d[i].subClientName + '\t' + d[i].wsType + '\t' + d[i].ipAddrL +'\r';
        console.log(strText);
    }
    callback(strText);
};
// export to json file
module.exports.exportJson = function(d,callback){
    var strText = JSON.stringify(d);
    callback(strText);
};
// console.log customize
module.exports.lg = function(text,label){
	if(label == undefined){
		console.log(JSON.stringify(text));
	}
	else
		console.log(label + ':' + JSON.stringify(text));
};
