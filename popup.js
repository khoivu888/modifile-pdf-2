document.addEventListener("DOMContentLoaded", function () {
  const languageSelect = document.getElementById("languageSelect");
  const saveButton = document.getElementById("saveButton");

  // Load the saved language selection
  chrome.storage.sync.get("selectedLanguage", function (data) {
    if (data.selectedLanguage) {
      languageSelect.value = data.selectedLanguage;
    }
  });

  // Save the selected language when the button is clicked
  saveButton.addEventListener("click", function () {
    const selectedLanguage = languageSelect.value;
    chrome.storage.sync.set(
      { selectedLanguage: selectedLanguage },
      function () {
        console.log("Language saved:", selectedLanguage);
      }
    );
  });
});
