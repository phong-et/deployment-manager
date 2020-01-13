const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
global.appRoot = require('app-root-path');
const log = console.log
// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = global.appRoot + '/utils/gsheets/credentials.json';
//const altCfg = require('../alt.cfg')
// emails messages array
var values = [], spreadsheetId, range

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    try {
      callback(oAuth2Client);
    } catch (error) {
      log(error)
    }

  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1CTpS_CY8pbOh5EpePpsXC9_qSsNZ6jzuGCHRnDKbgRw',
    range: 'Work_List_2018!A320:B320',
  }, (err, { data }) => {
    if (err) return console.log('The API returned an error: ' + err);
    log(data)
  });
}
function formatToSheetsValue(tasks) {
  var values = []
  try {
    tasks.forEach((task) => {
      values.push([
        task.taskDate, 
        task.taskIdRequest, 
        task.taskClientName, 
        task.taskSummary, 
        task.taskDetail, 
        //task.taskStartTime, 
        //task.taskEndTime, 
        //task.taskDuration, 
        task.taskStatus
      ])
    })
  }
  catch (e) {
    log(e)
  }
  return values
}
function appendTask(auth, callback) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    var params = {
      spreadsheetId: spreadsheetId,
      range: range,
      includeValuesInResponse: true,
      insertDataOption: 'INSERT_ROWS',
      responseDateTimeRenderOption: 'SERIAL_NUMBER',
      responseValueRenderOption: 'FORMATTED_VALUE',
      valueInputOption: 'RAW',
      resource: {
        values: formatToSheetsValue(values)
      }
    }
    //log(params)
    sheets.spreadsheets.values.append(params).then((response) => {
      log(response.data)
      callback(response.data)
    })
  } catch (error) {
    log(error)
  }
}

module.exports = {
  uppdateToSheets: function (tasks, infoSheets, callback) {
    values = tasks
    spreadsheetId = infoSheets.spreadsheetId
    range = infoSheets.range
    // Load client secrets from a local file.
    fs.readFile(global.appRoot + '/utils/gsheets/client_secret.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), (auth) => {
        appendTask(auth, (dataSucces) => {
          callback(dataSucces)
        })
      });
    });
  }
}