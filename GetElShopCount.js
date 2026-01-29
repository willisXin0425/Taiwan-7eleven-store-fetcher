const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs");

// content
const city_id = require("./city_id");

// 使用 https://emap.pcsc.com.tw/ 網站資料
const url = "https://emap.pcsc.com.tw/EMapSDK.aspx";

// 儲存 JSON 文件
const saveToJson = (data, fileName) => {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`已成功將資料儲存為 ${fileName}`);
};

const parseTownXml = (xmlString) => {
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlString);
  if (jsonObj.iMapSDKOutput && jsonObj.iMapSDKOutput.GeoPosition) {
    const geoPositions = Array.isArray(jsonObj.iMapSDKOutput.GeoPosition)
      ? jsonObj.iMapSDKOutput.GeoPosition
      : [jsonObj.iMapSDKOutput.GeoPosition];

    return geoPositions.map((pos) => ({
      TownID: pos.TownID,
      TownName: pos.TownName,
    }));
  }
  return [];
};

const parseStoreXml = (xmlString) => {
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlString);
  if (jsonObj.iMapSDKOutput && jsonObj.iMapSDKOutput.GeoPosition) {
    const geoPositions = Array.isArray(jsonObj.iMapSDKOutput.GeoPosition)
      ? jsonObj.iMapSDKOutput.GeoPosition
      : [jsonObj.iMapSDKOutput.GeoPosition];
    return geoPositions.map((pos) => ({
      storeID: pos.POIID ? String(pos.POIID).trim() : "",
      storeName: pos.POIName,
    }));
  }
  return [];
};

const fetchCityAreaData = async (city) => {
  const params = new URLSearchParams();
  params.append("commandid", "GetTown");
  params.append("cityid", city?.areaID);
  const xmlString = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const townData = parseTownXml(xmlString.data);
  return {
    ...city,
    towns: townData,
  };
};

const fetchStoreData = async (area, townName) => {
  const params = new URLSearchParams();
  params.append("commandid", "SearchStore");
  params.append("city", area);
  params.append("town", townName);
  const xmlString = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const storeData = parseStoreXml(xmlString.data);
  return {
    townName,
    storeData,
  };
};

const handleGetShop = async () => {
  const CityAreaData = await Promise.all(
    city_id.map((item) => {
      return fetchCityAreaData(item);
    }),
  );
  for (const city of CityAreaData) {
    const storeData = await Promise.all(
      city.towns.map((town) => fetchStoreData(city.area, town.TownName)),
    );
    const data = {
      city: city.area,
      storeData,
    };
    saveToJson(data, `${city.area}.json`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

// handleGetShop();
