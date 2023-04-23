const { app, BrowserWindow } = require('electron');
const electron = require('electron');
const glasstron = require('glasstron');

electron.app.commandLine.appendSwitch("enable-transparent-visuals");

electron.app.on('ready', () => {
	setTimeout(
		spawnWindow,
		process.platform == "linux" ? 1000 : 0
	);
});

function spawnWindow(){
	win = new glasstron.BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
	});
	win.blurType = "acrylic";
	// Windows 10 1803+; for older versions you
	// might want to use 'blurbehind'
	win.setBlur(true);
	win.loadURL("https://music.apple.com/de");

	return win;
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

