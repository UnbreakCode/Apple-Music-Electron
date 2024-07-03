const { Client } = require("@xhayper/discord-rpc");

const {app} = require('electron'),
    {initAnalytics} = require('../utils');

initAnalytics();

module.exports = {
    connect: function (clientId) {
        app.discord = {isConnected: false};
        if (!app.cfg.get('general.discordRPC')) return;

        const client = new Client({
            clientId: "123456789012345678"
        });

        client.on("ready", () => {
            client.user?.setActivity({
                state: "Hello, world!"
            });
        });

        client.login();

        app.discord = Object.assign(client,{error: false, activityCache: null});

        // Login to Discord
        /*
                app.discord.login()
            .then(() => {
                app.discord.isConnected = true;
            })
            .catch((e) => console.error(`[DiscordRPC][connect] ${e}`));
         */


        app.discord.on('ready', () => {
            console.log(`[DiscordRPC][connect] Successfully Connected to Discord. Authed for user: ${client.user.username} (${client.user.id})`);

            if (app.discord.activityCache) {
                client.setActivity(app.discord.activityCache).catch((e) => console.error(e));
                app.discord.activityCache = null;
            }
        })

        // Handles Errors
        app.discord.on('error', err => {
            console.error(`[DiscordRPC] ${err}`);
            this.disconnect()
            //app.discord.isConnected = false;
        });
    },

    disconnect: function () {

    },

    updateActivity: function (attributes) {
        if (!app.cfg.get('general.discordRPC') || app.cfg.get('general.incognitoMode')) return;

        //if (!app.discord.isConnected) {
            //this.connect()
       // }

        //if (!app.discord.isConnected) return;

        console.verbose('[DiscordRPC][updateActivity] Updating Discord Activity.')

        const listenURL = `https://applemusicelectron.com/p?id=${attributes.playParams.id}`

        let ActivityObject = {
            details: attributes.name,
            state: `by ${attributes.artistName}`,
            startTimestamp: attributes.startTime,
            endTimestamp: attributes.endTime,
            largeImageKey: attributes.artwork.url.replace('{w}', '512').replace('{h}', '512') ?? ((app.cfg.get('general.discordRPC') === 'am-title') ? 'apple' : 'logo'),
            largeImageText: attributes.albumName,
            smallImageKey: (attributes.status ? 'play' : 'pause'),
            smallImageText: (attributes.status ? 'Playing': 'Paused'),
            instance: true,
            buttons: [
                {label: "Listen on AME", url: listenURL},
            ]
        };
        console.verbose(`[LinkHandler] Listening URL has been set to: ${listenURL}`);

        if (app.cfg.get('general.discordClearActivityOnPause')) {
            delete ActivityObject.smallImageKey
            delete ActivityObject.smallImageText
        }

        // Check all the values work
        if (!((new Date(attributes.endTime)).getTime() > 0)) {
            delete ActivityObject.startTimestamp
            delete ActivityObject.endTimestamp
        }
        if (!attributes.artistName) {
            delete ActivityObject.state
        }
        if (!ActivityObject.largeImageText || ActivityObject.largeImageText.length < 2) {
            delete ActivityObject.largeImageText
        }
        if (ActivityObject.details.length > 128) {
            AcitivityObject.details = ActivityObject.details.substring(0, 125) + '...'
        }

        // Clear if if needed
        if (!attributes.status) {
            if (app.cfg.get('general.discordClearActivityOnPause')) {
                app.discord.clearActivity().catch((e) => console.error(`[DiscordRPC][clearActivity] ${e}`));
                ActivityObject = null
            } else {
                delete ActivityObject.startTimestamp
                delete ActivityObject.endTimestamp
                ActivityObject.smallImageKey = 'pause'
                ActivityObject.smallImageText = 'Paused'
            }
        }

        if (ActivityObject) {
            try {
                console.verbose(`[DiscordRPC][setActivity] Setting activity to ${JSON.stringify(ActivityObject)}`);
                app.discord.setActivity(ActivityObject)
            } catch (err) {
                console.error(`[DiscordRPC][setActivity] ${err}`)
            }

        }
    },
}
