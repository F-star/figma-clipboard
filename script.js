// 解析完整的复制数据
document.getElementById("parse-btn").addEventListener("click", () => {
  navigator.clipboard.read().then((pastedData) => {
    console.log("pastedData", pastedData);
    const data = pastedData[0];
    data.getType("text/html").then((htmlBlob) => {
      var reader = new FileReader();
      reader.onload = function (event) {
        var pastedHTML = event.target.result;
        console.log("-------------- HTML 字符串内容 --------------");
        console.log(pastedHTML);
        // 解析
        resolveHTMLStr(pastedHTML);
      };
      reader.readAsText(htmlBlob);
    });
  });
});

/**
 *
 * @param {string} htmlStr
 */
const resolveHTMLStr = (htmlStr) => {
  const head = '<meta charset="utf-8"><meta charset="utf-8">';
  if (!htmlStr.startsWith(head)) {
    console.warn("不是 Figma 格式");
    return;
  }

  const metaLeft = htmlStr.indexOf("(figmeta)") + "(figmeta)".length;
  const metaRight = htmlStr.indexOf("(/figmeta)-->", metaLeft);
  const metaBase64 = htmlStr.slice(metaLeft, metaRight);
  console.log(
    "---------------------------- figmeta -----------------------------"
  );
  console.log(atob(metaBase64));

  const contentLeft = htmlStr.indexOf("(figma)", metaRight) + "(figma)".length;
  const contentRight = htmlStr.lastIndexOf("(/figma)");
  const contentBase64 = htmlStr.slice(contentLeft, contentRight);
  console.log(
    "-------------------------- figma content -------------------------"
  );
  console.log(parseFigBase64(contentBase64));
};

/***** 解析 base64 字符串 *****/
function parseFigBase64(base64String) {
  // 解码 base64 字符串为二进制字符串
  const binaryString = atob(base64String);

  // 将二进制字符串转换为 Uint8Array
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  // 解析文件
  return Fig.parse({ bytes: uint8Array, pako, kiwi });
}
