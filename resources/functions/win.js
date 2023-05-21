const {app, Menu, Notification, TouchBar, BrowserWindow} = require("electron"),
    {TouchBarButton, TouchBarLabel, TouchBarSpacer} = TouchBar,
    {join} = require("path"),
    windowStateKeeper = require("electron-window-state");
    const { PARAMS, VALUE,  MicaBrowserWindow, IS_WINDOWS_11, WIN10 } = require('mica-electron');


module.exports = {

    SetApplicationMenu: () => {
        if (process.platform !== "darwin") return;

        Menu.setApplicationMenu(Menu.buildFromTemplate([
            {
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                  ]
            },
            {
                label: 'View',
                submenu: [
                  { role: 'reload' },
                  { role: 'forceReload' },
                  { role: 'toggleDevTools' },
                  { type: 'separator' },
                  { role: 'resetZoom' },
                  { role: 'zoomIn' },
                  { role: 'zoomOut' },
                  { type: 'separator' },
                  { role: 'togglefullscreen' }
                ]
              },
            {
                label: 'Window',
                role: 'window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                  ]
            },
            {
                label: 'Support',
                role: 'help',
                submenu: [
                    {
                        label: 'Discord',
                        click() {
                            require("shell").openExternal("https://discord.gg/CezHYdXHEM")
                        }
                    },
                    {
                        label: 'GitHub Wiki',
                        click() {
                            require("shell").openExternal("https://github.com/Apple-Music-Electron/Apple-Music-Electron/wiki")
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'View License',
                        click() {
                            require("shell").openExternal("https://github.com/Apple-Music-Electron/Apple-Music-Electron/blob/master/LICENSE")
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Toggle Developer Tools',
                        accelerator: 'Option+CommandOrControl+I',
                        click() {
                            app.win.webContents.openDevTools()
                        }
                    },
                    {
                        label: 'Open Configuration File in Editor',
                        click() {
                            app.cfg.openInEditor()
                        }
                    }
                ]
            },
        ]));
    },

    SetContextMenu: (visibility) => {

        if (visibility) {
            app.tray.setContextMenu(Menu.buildFromTemplate([
                {
                    label: 'Check for Updates',
                    click: function () {
                        app.ame.utils.checkForUpdates(true)
                    }
                },
                {
                    label: 'Minimize to Tray',
                    click: function () {
                        if (typeof app.win.hide === 'function') {
                            app.win.hide();
                        }
                    }
                },
                {
                    label: 'Quit',
                    click: function () {
                        app.quit();
                    }
                }
            ]));
        } else {
            app.tray.setContextMenu(Menu.buildFromTemplate([
                {
                    label: 'Check for Updates',
                    click: function () {
                        app.ame.utils.checkForUpdates(true)
                    }
                },
                {
                    label: `Show ${app.getName()}`,
                    click: function () {
                        if (typeof app.win.show === 'function') {
                            app.win.show();
                        }
                    }
                },
                {
                    label: 'Quit',
                    click: function () {
                        app.quit();
                    }
                }
            ]));
        }
        return true

    },

    SetTaskList: () => {
        if (process.platform !== "win32") return;

        app.setUserTasks([
            {
                program: process.execPath,
                arguments: '--force-quit',
                iconPath: process.execPath,
                iconIndex: 0,
                title: `Quit ${app.getName()}`
            }
        ]);
        return true
    },

    CreateNotification: (attributes) => {
        if (!Notification.isSupported() || !(app.cfg.get('general.playbackNotifications') || app.cfg.get('general.playbackNotifications') === 'minimized')) return;

        if (app.cfg.get('general.playbackNotifications') === "minimized" && !(!app.win.isVisible() || app.win.isMinimized())) {
            return;
        }

        console.verbose(`[CreateNotification] Notification Generating | Function Parameters: SongName: ${attributes.name} | Artist: ${attributes.artistName} | Album: ${attributes.albumName}`)

        const NOTIFICATION_OBJECT = {
            title: attributes.name,
            body: `${attributes.artistName} - ${attributes.albumName}`,
            silent: true,
            icon: (attributes.artwork.url.replace('/{w}x{h}bb', '/512x512bb')).replace('/2000x2000bb', '/35x35bb'),
            actions: [{
                type: 'button',
                text: 'Skip'
            }]
        }

        app.win.webContents.send('notification', NOTIFICATION_OBJECT)
    },

    CreateBrowserWindow: () => {
        console.log('[CreateBrowserWindow] Initializing Browser Window Creation.')
        // Set default window sizes
        const mainWindowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });

        const options = {
            icon: join(__dirname, `../icons/icon.ico`),
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y,
            minWidth: (app.cfg.get('visual.streamerMode') ? 400 : 300),
            minHeight: ((app.cfg.get('visual.frameType') === 'mac' || app.cfg.get('visual.frameType') === 'mac-right') ? (app.cfg.get('visual.streamerMode')? 55 : 300) : (app.cfg.get('visual.streamerMode') ? 115 : 300)),
            frame: (process.platform !== 'win32' && !(app.cfg.get('visual.frameType') === 'mac' || app.cfg.get('visual.frameType') === 'mac-right')),
            title: app.getName(),
            resizable: true,
            show: true,
            opacity: 1,
            frame: true,
            // Enables DRM
            webPreferences: {
                plugins: true,
                // preload: join(__dirname, '../js/MusicKitInterop.js'),
                allowRunningInsecureContent: true,
                nodeIntegration: false,
                nodeIntegrationInWorker: false,
                contextIsolation: false,
                webSecurity: true,
                sandbox: true,
                nativeWindowOpen: true
            }
        };

        // // Fetch the transparency options
        // const transparencyOptions = app.ame.utils.fetchTransparencyOptions()

        // if (process.platform === 'darwin' && !app.cfg.get('visual.frameType')) { // macOS Frame and transparency
        //     options.titleBarStyle = 'hidden'
        //     options.titleBarOverlay = true
        //     options.frame = true
        //     options.trafficLightPosition = {x: 20, y: 20}
        //     options.transparent = (app.transparency && transparencyOptions)
        // }

        // Create the Browser Window
        console.log('[CreateBrowserWindow] Creating BrowserWindow.')
        let win;
        if (process.platform === "darwin" || process.platform === "linux") {
            win = new BrowserWindow(options)
        } else {
            //const {BrowserWindow} = require("electron-acrylic-window");
            // if (app.transparency && transparencyOptions) {
            //     console.log('[CreateBrowserWindow] Setting Vibrancy')
            //     options.vibrancy = transparencyOptions
            // }
            win = new BrowserWindow(options)
        }

        // Set the transparency
        if (app.transparency && transparencyOptions && process.platform === "darwin") {
            console.log('[CreateBrowserWindow] Setting Vibrancy')
            win.setVibrancy(transparencyOptions)
        }

        // alwaysOnTop
        if (!app.cfg.get('window.alwaysOnTop')) {
            win.setAlwaysOnTop(false)
        } else {
            win.setAlwaysOnTop(true)
        }

        win.setMenuBarVisibility(false); // Hide that nasty menu bar
        if (app.cfg.get('advanced.devToolsOnStartup')) win.webContents.openDevTools({mode: 'detach'}); // Enables Detached DevTools

        // Register listeners on Window to track size and position of the Window.
        mainWindowState.manage(win);

        // Load the Website
        app.ame.load.LoadWebsite(win)
    
        return win
    },

    HandleBrowserWindow: () => {
        // Detect if the application has been opened with --minimized
        if (app.commandLine.hasSwitch('minimized') || process.argv.includes('--minimized')) {
            console.log("[Apple-Music-Electron] Application opened with '--minimized'");
            if (typeof app.win.minimize === 'function') {
                app.win.minimize();
            }
        }

        // Detect if the application has been opened with --hidden
        if (app.commandLine.hasSwitch('hidden') || process.argv.includes('--hidden')) {
            console.log("[Apple-Music-Electron] Application opened with '--hidden'");
            if (typeof app.win.hide === 'function') {
                app.win.hide()
            }
        }
    },

    removeInsertedCSS: (index) => {
        if (app.injectedCSS[index]) {
            app.win.webContents.removeInsertedCSS(app.injectedCSS[index]).then(r => { if (r) { console.error(r); }});
        }

    }
}