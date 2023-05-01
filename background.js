const switchHue = async (settings, isOn) => {
  var url = `http://${settings.hue}/api/${settings.hueToken}/lights/${settings.lightID}/state`;
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ on: isOn }),
  });
  const data = await response.json();
  return response.status == 200;
};

const switchElgato = async (settings, isOn) => {
  var url = `http://${settings.elgatoAddr}:9123/elgato/lights`;
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({
      lights: [{ on: isOn ? 1 : 0 }, { on: isOn ? 1 : 0 }],
    }),
  });
  const data = await response.json();
  return response.status == 200;
};

const turnOnLight = async () => {
  var logStr = "";
  const storage = await chrome.storage.sync.get("settings");
  if (storage.settings == undefined) return "not executed";

  if (storage.settings.enableHue) {
    var res = await switchHue(storage.settings, true);
    logStr = "hue switch on " + res ? "success" : "failed";
  }
  if (storage.settings.enableElgato) {
    var res = await switchElgato(storage.settings, true);
    logStr += "\nelgato switch on " + res ? "success" : "failed";
  }
  return logStr;
};

const turnOffLight = async () => {
  var logStr = "";
  const storage = await chrome.storage.sync.get("settings");
  if (storage.settings == undefined) return;

  if (storage.settings.enableHue) {
    var res = await switchHue(storage.settings, false);
    logStr = "hue switch off " + res ? "success" : "failed";
  }
  if (storage.settings.enableElgato) {
    var res = await switchElgato(storage.settings, false);
    logStr += "\nelgato switch off " + res ? "success" : "failed";
  }
};

var tabToUrl = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("https://meet.google.com/")
  ) {
    tabToUrl[tabId] = tab.url;
    try {
      var log = await turnOnLight();
      console.log(log);
    } catch (error) {
      console.error(log, error);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (
    tabToUrl[tabId] &&
    tabToUrl[tabId].startsWith("https://meet.google.com/")
  ) {
    try {
      turnOffLight();
    } catch (error) {
      console.error(error);
    }
  }
});
