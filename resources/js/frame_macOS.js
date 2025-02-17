try {
    if (document.getElementById('web-navigation-search-box') && !document.querySelector('.web-nav-window-controls')) {

        document.getElementById('web-navigation-search-box').insertAdjacentHTML('beforebegin', `
        <div class="web-nav-window-controls-outer macos" ondblclick="ipcRenderer.send('maximize')" style="width: 100%; height: 55px; -webkit-app-region: no-drag; background-color: transparent !important; -webkit-user-select: none; padding-left: 2px; padding-top: 2px;">
            <div class="web-nav-window-controls" style="-webkit-app-region: drag; position: relative; height: 100%; width: 100%; display: flex; padding: 10px 0 0 10px;">
                <span id="close""></span>
                <span id="minimize"></span>
                <span id="maximize"></span>
            </div>
        </div>
        `);

        if (document.getElementById('web-navigation-search-box')) {
            document.getElementById('web-navigation-search-box').style.gridArea = "auto !important";
            document.getElementById('web-navigation-search-box').style.marginTop = '0px !important';
        }

        if (document.getElementById('web-navigation-container')) {
            document.getElementById('web-navigation-container').style.gridTemplateRows = '55px auto 1fr auto !important';
        }

        if (document.querySelector('.web-chrome')) {
            document.querySelector('.web-chrome').style.width = "calc(100vw - var(--web-navigation-width))";
        }

        /* listen to click events */
        const minimizedButtonPressed = document.getElementById('minimize');
        minimizedButtonPressed.addEventListener("click", () => {
            ipcRenderer.send('minimize');
        });

        const maximizeButtonPressed = document.getElementById('maximize');
        maximizeButtonPressed.addEventListener("click", () => {
            ipcRenderer.send('maximize');
        });
        
        const closeButtonPressed = document.getElementById('close');
        closeButtonPressed.addEventListener("click", () => {
            ipcRenderer.send('close');
        });

    }
} catch (e) {
    console.error("[JS] Error while trying to apply frame_macOS.js", e);
}