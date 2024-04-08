const {app, BrowserWindow} = require('electron')
const path = require('path')

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
        contextIsolation: false,
    }
  });

    mainWindow.loadFile('index.html');

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});