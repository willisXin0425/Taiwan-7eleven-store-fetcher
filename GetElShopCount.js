const axios = require("axios");
const { DOMParser } = require("xmldom");

const { TownData } = require("./Town_data");
const { store_id } = require("./Store_Id");

const formatXml = (xmlString) => {
  // 1. 建立一個 DOMParser 實體
  const parser = new DOMParser();
  // 2. 將 XML 字串解析成一個 XML 文件物件
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // 3. 取得所有的 <GeoPosition> 節點
  const geoPositions = xmlDoc.getElementsByTagName("GeoPosition");

  // 4. 遍歷所有 <GeoPosition> 節點，並將其轉換成物件
  const townData = Array.from(geoPositions).map((position) => {
    return {
      townId: position.getElementsByTagName("TownID")[0]?.textContent || "",
      townName: position.getElementsByTagName("TownName")[0]?.textContent || "",
      x: position.getElementsByTagName("X")[0]?.textContent || "",
      y: position.getElementsByTagName("Y")[0]?.textContent || "",
    };
  });
  return townData;
};

const fetchTownData = async (item) => {
  const url = "http://emap.pcsc.com.tw/EMapSDK.aspx";
  const params = new URLSearchParams();
  params.append("commandid", "GetTown");
  params.append("cityid", item.areaID);
  const xmlString = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const townData = formatXml(xmlString.data);

  const cityData = {
    city: item.area,
    cityID: item.areaID,
    townData,
  };

  return cityData;
};

const handleGetElShop = async () => {
  const allCityData = await Promise.all(
    store_id.map((item) => {
      return fetchTownData(item);
    }),
  );
};

// handleGetElShop();

formatXml(TownData);
