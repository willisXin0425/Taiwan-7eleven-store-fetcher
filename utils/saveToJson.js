const fs = require("fs");

// 儲存 JSON 文件
const saveToJson = (data, fileName) => {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`已成功將資料儲存為 ${fileName}`);
};

module.exports = {
  saveToJson,
};
