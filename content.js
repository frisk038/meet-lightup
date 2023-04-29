const url = window.location.href;
if (url.startsWith("https://meet.google.com/")) {
  chrome.runtime.sendMessage({ url });
}
