'use strict';

const electron = require('electron')
    // Module to control application life.
const app = electron.app
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            frame: false,
            resizable: false
        }) // and load the index.html of the app.
    mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'FileMap.html'),
            protocol: 'file:',
            slashes: true
        }))
        //mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // send a kill message to the Server and kill the Server. Then quit the app.
    sendMessageToVSCode('kill_server', { message: 'death to all' });

    app.quit;
});

// On OS X it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
// if (process.platform !== 'darwin') {
//   app.on('window-all-closed', app.quit);
// }
//})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function sendMessageToVSCode(type, message) {
    console.log("Test " + message);
    ipc.connectTo(
        'world',
        function() {
            ipc.of.world.emit(
                type,
                message
            );
        }
    );
}