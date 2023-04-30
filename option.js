document.addEventListener("DOMContentLoaded", function () {
  const hueInput = document.getElementById("hue");
  const hueTokenInput = document.getElementById("hueToken");
  const lightIDInput = document.getElementById("lightID");
  const elgatoAddrInput = document.getElementById("elgatoAddr");
  const saveButton = document.getElementById("save");
  const hueEnabledCBox = document.getElementById("enableHue");
  const elgatoEnabledCBox = document.getElementById("enableElgato");

  // Load the saved data
  chrome.storage.sync.get("settings", function (data) {
    if (data.settings.hue) {
      hueInput.value = data.settings.hue;
    }
    if (data.settings.hueToken) {
      hueTokenInput.value = data.settings.hueToken;
    }
    if (data.settings.lightID) {
      lightIDInput.value = data.settings.lightID;
    }
    if (data.settings.enableHue) {
      hueEnabledCBox.checked = data.settings.enableHue;
    }
    if (data.settings.enableElgato) {
      elgatoEnabledCBox.checked = data.settings.enableElgato;
    }
    if (data.settings.elgatoAddr) {
      elgatoAddrInput.value = data.settings.elgatoAddr;
    }
  });

  // Save the name when the button is clicked
  saveButton.addEventListener("click", function () {
    chrome.storage.sync.set(
      {
        settings: {
          hue: hueInput.value,
          hueToken: hueTokenInput.value,
          lightID: lightIDInput.value,
          enableHue: hueEnabledCBox.checked,
          enableElgato: elgatoEnabledCBox.checked,
          elgatoAddr: elgatoAddrInput.value,
        },
      },
      function () {
        alert("Your configuration has been saved.");
      }
    );
  });
});
