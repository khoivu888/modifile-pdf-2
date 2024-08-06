importScripts("libs/pdf-lib.min.js");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "divClicked" && message.divInfo.dataUrl) {
    let pdfUrl = `https://payments.google.com${message.divInfo.dataUrl}`;
    try {
      let response = await fetch(pdfUrl);
      let arrayBuffer = await response.arrayBuffer();
      let pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

      // Chỉnh sửa file PDF: ghi đè văn bản cũ bằng hộp trắng và thêm văn bản mới
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Tạo một hộp trắng để che văn bản cũ
      firstPage.drawRectangle({
        x: 50,
        y: 750,
        width: 200, // Điều chỉnh kích thước theo nhu cầu
        height: 20,
        color: PDFLib.rgb(1, 1, 1),
      });

      // Thêm văn bản mới
      firstPage.drawText("Text added to PDF!", {
        x: 50,
        y: 750,
        size: 12,
        color: PDFLib.rgb(0, 0, 0),
      });

      // Tạo file PDF mới đã chỉnh sửa
      const pdfBytes = await pdfDoc.save();
      const modifiedBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const reader = new FileReader();

      // Đọc blob như một URL data
      reader.onloadend = function () {
        const url = reader.result;
        chrome.downloads.download({
          url: url,
          filename: "modified_file.pdf",
        });
      };

      reader.readAsDataURL(modifiedBlob);
    } catch (error) {
      console.error("Error editing PDF:", error);
    }
  }
});

// Ngăn việc tải file gốc bằng cách hủy sự kiện tải xuống
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (item.url.includes("payments.google.com")) {
    suggest({ filename: "cancelled", conflictAction: "uniquify" });
    chrome.downloads.cancel(item.id);
  }
});
