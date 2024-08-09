// contentScript.js

// Function to send message to background script
function sendDivClickedMessage(dataUrl, filename) {
  chrome.runtime.sendMessage({
    action: "divClicked",
    divInfo: {
      dataUrl: dataUrl,
      filename: filename, // Pass the filename along
    },
  });
}

// Example usage: Replace with actual logic to get the data URL and filename
document.addEventListener("click", () => {
  const dataUrl = "yourDataUrl"; // Replace with actual data URL
  const filename = "default-file.pdf"; // Replace with logic to determine filename
  sendDivClickedMessage(dataUrl, filename);
});
