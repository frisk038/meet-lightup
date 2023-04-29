document.addEventListener("DOMContentLoaded", function () {
  const hueInput = document.getElementById("hue");
  const hueTokenInput = document.getElementById("hueToken");
  const lightIDInput = document.getElementById("lightID");
  const saveButton = document.getElementById("save");

  // Load the saved data
  chrome.storage.sync.get("settings", function (data) {
    if (data.hue) {
      hueInput.value = data.hue;
    }
    if (data.hueToken) {
      hueTokenInput.value = data.hueToken;
    }
    if (data.lightID) {
      lightIDInput.value = data.lightID;
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
        },
      },
      function () {
        alert("Your name has been saved.");
      }
    );
  });
});
