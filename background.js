importScripts("libs/pdf-lib.min.js", "libs/fontkit.umd.min.js");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "divClicked" && message.divInfo.dataUrl) {
    let pdfUrl = `https://payments.google.com${message.divInfo.dataUrl}`;
    console.log(message.divInfo, "div info");

    try {
      let response = await fetch(pdfUrl);
      let arrayBuffer = await response.arrayBuffer();
      let pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

      // Register fontkit instance with PDFDocument
      pdfDoc.registerFontkit(fontkit);

      // Fetch Arial font files
      const arialFontBytes = await fetch(
        chrome.runtime.getURL("fonts/Arial.ttf")
      ).then((res) => res.arrayBuffer());
      const arialBoldFontBytes = await fetch(
        chrome.runtime.getURL("fonts/ArialMdm.ttf")
      ).then((res) => res.arrayBuffer());

      // Embed the Arial fonts into the PDF document
      const arialFont = await pdfDoc.embedFont(arialFontBytes);
      const arialBoldFont = await pdfDoc.embedFont(arialBoldFontBytes);

      chrome.storage.sync.get("selectedLanguage", async (result) => {
        let language = result.selectedLanguage || "en"; // Default to English if no language is selected

        // Data to add to the PDF
        let dataToAdd;
        if (language === "en") {
          dataToAdd = [
            { text: "Bill to", size: 9, font: arialBoldFont },
            {
              text: "GOD GROUP COMPANY LIMITED",
              size: 8.3,
              font: arialFont,
            },
            {
              text: "2nd Floor, Viet Long Complex Building, No. 30 Ly Thai To",
              size: 8.3,
              font: arialFont,
            },
            { text: "Ninh Xa Ward", size: 8.3, font: arialFont },
            { text: "Bac Ninh", size: 8.3, font: arialFont },
            { text: "Bac Ninh Province 22000", size: 8.3, font: arialFont },
            { text: "Vietnam", size: 8.3, font: arialFont },
            { text: "Tax ID: 2301141907", size: 8.3, font: arialFont },
            { text: "", size: 8.3, font: arialFont },
          ];
        } else if (language === "vi") {
          dataToAdd = [
            { text: "Thanh toán", size: 9, font: arialBoldFont },
            { text: "CÔNG TY TNHH GOD GROUP", size: 8.3, font: arialFont },
            {
              text: "Tầng 2, Tòa nhà Việt Long Complex, số 30 Lý Thái Tổ",
              size: 8.3,
              font: arialFont,
            },
            { text: "Ninh Xá", size: 8.3, font: arialFont },
            { text: "Bắc Ninh", size: 8.3, font: arialFont },
            { text: "Bac Ninh Province 22000", size: 8.3, font: arialFont },
            { text: "Vietnam", size: 8.3, font: arialFont },
            { text: "Mã số thuế: 2301141907", size: 8.3, font: arialFont },
            { text: "", size: 8.3, font: arialFont },
          ];
        }

        // Modify the PDF: overwrite old text with a white box and add new text
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        let currentY = 698;
        dataToAdd.forEach((item) => {
          // Draw white background
          const textWidth = item.font.widthOfTextAtSize(item.text, item.size);
          const textHeight = item.font.heightAtSize(item.size);
          firstPage.drawRectangle({
            x: 48,
            y: currentY - textHeight, // Adjust y to match text
            width: 300,
            height: textHeight + 8,
            color: PDFLib.rgb(1, 1, 1), // White color
          });

          // Draw text
          firstPage.drawText(item.text, {
            x: 48,
            y: currentY,
            size: item.size,
            font: item.font,
            color: PDFLib.rgb(0, 0, 0),
          });
          currentY -= 15; // Adjust spacing between lines
        });

        // Create the modified PDF file
        const pdfBytes = await pdfDoc.save();
        const modifiedBlob = new Blob([pdfBytes], {
          type: "application/pdf",
        });
        const reader = new FileReader();

        // Read blob as a data URL
        reader.onloadend = function () {
          const url = reader.result;

          // Use the filename from the message or default to 'default-pdf.pdf'
          const filename = message.divInfo.filename || "invoice-export.pdf";
          console.log(filename, "filename");

          chrome.downloads.download(
            {
              url: url,
              filename: filename,
            },
            (downloadId) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error downloading PDF:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log("PDF download initiated with ID:", downloadId);
              }
            }
          );
        };

        reader.readAsDataURL(modifiedBlob);
      });
    } catch (error) {
      console.error("Error editing PDF:", error);
    }
  }
});

// Prevent the original file from downloading by canceling the download event
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (item.url.includes("payments.google.com")) {
    chrome.downloads.cancel(item.id, () => {
      chrome.downloads.erase({ id: item.id }, () => {
        chrome.storage.local.set({ filename: item.filename }, () => {
          console.log("Original filename stored:", item.filename);

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              chrome.scripting.executeScript(
                {
                  target: { tabId: tabs[0].id },
                  func: (url) => {
                    chrome.runtime.sendMessage({
                      action: "divClicked",
                      divInfo: {
                        dataUrl: url.replace("https://payments.google.com", ""),
                        filename: "invoice-export.pdf", // Pass a custom filename if needed
                      },
                    });
                  },
                  args: [item.url],
                },
                () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Error sending divClicked message:",
                      chrome.runtime.lastError.message
                    );
                  } else {
                    console.log("divClicked message sent successfully");
                  }
                }
              );
            } else {
              console.error("No active tab found to send the message to.");
            }
          });
        });
      });
    });

    // Suggest cancelling the download
    suggest({ cancel: true });
  }
});
