const axios = require("axios");
const { DOMParser } = require("xmldom");
const { store_id } = require("./store_Id");

// 解析店家 HTML 資料
const parseStoreHtml = (htmlString) => {
  if (htmlString.includes("無符合條件的門市資料")) {
    return [];
  }
  // 1. 建立 DOMParser 實體
  const parser = new DOMParser();
  // 2. 將 HTML 字串解析成文件物件
  const doc = parser.parseFromString(htmlString, "text/html");

  // 3. 取得所有的 <tr> 節點
  const rows = doc.getElementsByTagName("tr");

  // 4. 遍歷 <tr> 節點 (跳過第一個 header)，轉換成物件
  const stores = Array.from(rows)
    .slice(1)
    .map((row) => {
      const cells = row.getElementsByTagName("td");
      return {
        storeId: cells[0]?.textContent.trim() || "",
        storeName: cells[1]?.textContent.trim() || "",
        address: cells[2]?.textContent.trim() || "",
      };
    });
  return stores;
};

const fetchStoreData = async (item) => {
  // 使用 http://www.ibon.com.tw/retail_inquiry.aspx#gsc.tab=0 網站資料
  const url = "https://www.ibon.com.tw/retail_inquiry_ajax.aspx";
  const params = new URLSearchParams();
  params.append("strTargetField", "COUNTY");
  params.append("strKeyWords", item.area);
  const xmlString = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const stores = parseStoreHtml(xmlString.data);

  const cityData = {
    city: item.area,
    cityID: item.areaID,
    stores,
  };

  return cityData;
};

const handleGetElShop = async () => {
  const allStoreData = await Promise.all(
    store_id.map((item) => {
      return fetchStoreData(item);
    }),
  );
  saveToJson(allStoreData, "parsed_store_data.json");
};

handleGetElShop();
