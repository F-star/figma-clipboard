
figmeta 解码结果：

```json

{"fileKey":"vaz5OCe0ecc3KGbm3Fg71A","pasteID":981262107,"dataType":"scene"}


```

figdata 解析发现是 kiwi 格式，需要改造一下 figma-parser。

1. base64 转为 uint8Array
2. 再调用 Fig.parse()