document.addEventListener("DOMContentLoaded", function () {
  const nameInput = document.getElementById("name");
  const saveButton = document.getElementById("save");

  // Load the saved name
  chrome.storage.sync.get("name", function (data) {
    if (data.name) {
      nameInput.value = data.name;
    }
  });

  // Save the name when the button is clicked
  saveButton.addEventListener("click", function () {
    const name = nameInput.value;
    chrome.storage.sync.set({ name: name }, function () {
      alert("Your name has been saved.");
    });
  });
});
