document.addEventListener(
  "click",
  function (event) {
    let target = event.target;

    // Kiểm tra nếu phần tử được click là một thẻ div
    while (target && target !== document) {
      if (target.tagName === "DIV") {
        let dataUrl = target.getAttribute("data-url");
        if (dataUrl) {
          event.preventDefault(); // Ngăn chặn hành động mặc định
          let divInfo = {
            id: target.id,
            classList: Array.from(target.classList),
            innerHTML: target.innerHTML,
            dataUrl: dataUrl, // Lấy giá trị của thuộc tính data-url
          };
          chrome.runtime.sendMessage({
            action: "divClicked",
            divInfo: divInfo,
          });
        }
        break;
      }
      target = target.parentNode;
    }
  },
  true
);
