const turnOnLight = async () => {
  const storage = await chrome.storage.sync.get("settings");
  var url =
    "http://" +
    storage.settings.hue +
    "/api/" +
    storage.settings.hueToken +
    "/lights/" +
    storage.settings.lightID +
    "/state";
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ on: true }),
  });
  const data = await response.json();
  return response.status == 200 ? "Lighs On !" : "Failed !";
};

const turnOffLight = async () => {
  const storage = await chrome.storage.sync.get("settings");
  var url =
    "http://" +
    storage.settings.hue +
    "/api/" +
    storage.settings.hueToken +
    "/lights/" +
    storage.settings.lightID +
    "/state";
  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ on: false }),
  });
  const data = await response.json();
  return response.status == 200 ? "Lighs Off !" : "Failed !";
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
        var title = await turnOnLight();
        await showPopUp(tabId, title);
      } catch (error) {
        console.error(error);
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
      var title = turnOffLight();
      showPopUp(tabId, title);
      delete tabToUrl[tabId];
    }
  });
});
