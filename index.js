const { app, BrowserWindow } = require('electron');
const electron = require('electron');
require('v8-compile-cache');

electron.app.commandLine.appendSwitch("enable-transparent-visuals");

// Initialize the Preferences so verbose doesnt fuck up
const appFuncs = require('./resources/functions/app-init');
app.ame = appFuncs()

electron.app.on('ready', () => {
	setTimeout(
		spawnWindow,
		process.platform == "linux" ? 1000 : 0
	);
});

function spawnWindow(){
	app.win = app.ame.win.CreateBrowserWindow()
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

