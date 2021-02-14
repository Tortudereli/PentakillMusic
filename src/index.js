const {
    ipcRenderer
} = require("electron");
const $ = require("jquery");

try {
    if (ipcRenderer.sendSync("getCurrentVersion") < ipcRenderer.sendSync("get", "https://raw.githubusercontent.com/Tortudereli/PentakillMusic/main/version.json")['body']['version']) {
        alert("There is a new version");
    }
} catch (error) {
    console.log(error);
}

var currentSummonerName = null;
var lastEvent = 0;
$(document).ready(() => {
    setInterval(() => {
        try {
            var champCheck = false;
            var champName = null;
            var pentaSound = null;
            if ($("#checkBoxPentakillMusic").prop("checked") == true) {
                var currentSummonerNameData = ipcRenderer.sendSync("get", "https://127.0.0.1:2999/liveclientdata/activeplayername");
                if (currentSummonerNameData['status'] == 200) {
                    currentSummonerName = currentSummonerNameData['body'];
                    currentSummonerNameData = null;
                    var playerlistData = ipcRenderer.sendSync("get", "https://127.0.0.1:2999/liveclientdata/playerlist");
                    if (playerlistData['status'] == 200) {
                        playerlistData['body'].forEach(element => {
                            if (element['summonerName'] == currentSummonerName) {
                                if (champName != element['championName'] || champName == null || pentaSound == null) {
                                    ipcRenderer.sendSync("get", "https://raw.githubusercontent.com/Tortudereli/PentakillMusic/main/champions.json")['body'].forEach(element1 => {
                                        if (element1['champion'] == element['championName']) {
                                            champCheck = true;
                                            champName = element['championName'];
                                            pentaSound = new Audio(element1['audioPath']);
                                        }
                                    });
                                }
                            }
                        });
                        playerlistData = null;
                        var eventData = ipcRenderer.sendSync("get", "https://127.0.0.1:2999/liveclientdata/eventdata");
                        if (eventData['status'] == 200) {
                            if (champCheck == true) {
                                eventData['body']['Events'].forEach(element => {
                                    if (element['EventID'] > lastEvent && element['KillStreak'] == 5 && element['KillerName'] == currentSummonerName) {
                                        if (champName != null && pentaSound != null) {
                                            lastEvent = element['EventID'];
                                            pentaSound.play();
                                        }
                                    }
                                });
                            }
                            eventData = null;
                        } else {
                            lastEvent = 0;
                            champCheck = false;
                            champName = null;
                            pentaSound = null;
                        }
                    } else {
                        lastEvent = 0;
                        champCheck = false;
                        champName = null;
                        pentaSound = null;
                    }
                } else {
                    lastEvent = 0;
                    champCheck = false;
                    champName = null;
                    pentaSound = null;
                }
            }
        } catch (error) {
            console.log(error)
        }
    }, 2000);
})