document.getElementById("replaceButton").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: replaceIframeContent,
  });
});

async function replaceIframeContent() {
  const iframe = document.querySelector("iframe");
  if (iframe) {
    const src = iframe.src;
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const bodyContent = doc.body.innerHTML;
      iframe.srcdoc = bodyContent;
    } catch (error) {
      console.error("Error fetching and replacing iframe content:", error);
    }
  } else {
    console.error("No iframe found on the page");
  }
}
