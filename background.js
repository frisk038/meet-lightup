chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    chrome.storage.sync.get("name", (data) => {
      const name = data.name;
      console.log("User's name:", name);
    });
    if (
      changeInfo.status === "complete" &&
      tab.url &&
      tab.url.startsWith("https://meet.google.com/")
    ) {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos/1"
        );
        const data = await response.json();
        const title = data.title;
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
    chrome.tabs.get(tabId, (tab) => {
      if (tab.url && tab.url.startsWith("https://meet.google.com/")) {
        // User has exited the Google Meet page, do something here
        console.log("User has exited the Google Meet page");
      }
    });
  });
});
