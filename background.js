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
  if (storage.settings.enableHue) {
    var res = await switchHue(storage.settings, false);
    logStr = "hue switch off " + res ? "success" : "failed";
  }
  if (storage.settings.enableElgato) {
    var res = await switchElgato(storage.settings, false);
    logStr += "\nelgato switch off " + res ? "success" : "failed";
  }
};

const showPopUp = async (tabId, title) => {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["popup.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    function: (title) => {
      const popup = document.createElement("div");
      popup.id = "popup";
      popup.innerHTML = `<h1>Title: ${title}</h1>`;
      document.body.appendChild(popup);
      setTimeout(() => {
        popup.remove();
      }, 5000);
    },
    args: [title],
  });
};

var tabToUrl = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      tab.url.startsWith("https://meet.google.com/")
    ) {
      tabToUrl[tabId] = tab.url;
      try {
        var log = await turnOnLight();
      } catch (error) {
        console.error(log, error);
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.url.startsWith("https://meet.google.com/")) {
      chrome.tabs.executeScript({
        target: { tabId: sender.tab.id },
        file: "content.js",
      });
    }
  });

  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log("User has exited the Google Meet page");
    if (
      tabToUrl[tabId] &&
      tabToUrl[tabId].startsWith("https://meet.google.com/")
    ) {
      try {
        var log = turnOffLight();
      } catch (error) {
        console.error(log, error);
      }
    }
  });
});
