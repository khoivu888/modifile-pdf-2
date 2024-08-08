document.addEventListener(
  "click",
  function (event) {
    let target = event.target;
    console.log(event, "event data");

    // Tìm phần tử cha là thẻ tr từ phần tử con được nhấp vào
    while (target && target !== document) {
      if (target.tagName === "TR") {
        // Lấy thẻ td thứ 3 (index 2) trong thẻ tr
        let thirdTd = target.querySelectorAll("td")[2];

        if (thirdTd) {
          let infoMessage = thirdTd.getAttribute("data-info-message");

          if (infoMessage) {
            event.preventDefault(); // Ngăn chặn hành động mặc định
            console.log(infoMessage, "Third td data-info-message");
            let divInfo = {
              id: infoMessage, // Sử dụng giá trị data-info-message làm id
              classList: Array.from(target.classList),
              innerHTML: target.innerHTML,
              dataUrl: target.getAttribute("data-url"), // Lấy giá trị của thuộc tính data-url nếu có
            };
            chrome.runtime.sendMessage({
              action: "divClicked",
              divInfo: divInfo,
            });
          }
        }
        break;
      }
      target = target.parentNode;
    }
  },
  true
);
