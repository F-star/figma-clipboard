const btn = document.querySelector("button");

btn.addEventListener("click", () => {
  navigator.clipboard.read().then((pastedData) => {
    console.log(pastedData);
    const data = pastedData[0];
    data.getType("text/html").then((htmlBlob) => {
      var reader = new FileReader();
      reader.onload = function (event) {
        var pastedHTML = event.target.result;
        console.log("Pasted HTML:", pastedHTML);
        // 这里可以对 pastedHTML 进行进一步处理
      };
      reader.readAsText(htmlBlob);
    });
  });
});
