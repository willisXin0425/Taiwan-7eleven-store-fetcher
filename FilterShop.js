const fs = require("fs");

// 儲存 JSON 文件
const saveToJson = (data, fileName) => {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`已成功將資料儲存為 ${fileName}`);
};

const FilterShop = () => {
  try {
    const rawData = fs.readFileSync("parsed_store_data.json", "utf8");
    const allStoreData = JSON.parse(rawData);

    const result = allStoreData.map((cityData) => {
      const storesGrouped = {};
      if (cityData.stores) {
        cityData.stores.forEach((store) => {
          const nameLength = store.storeName.length;
          const key = `nameCount_${nameLength}`;
          if (!storesGrouped[key]) {
            storesGrouped[key] = [];
          }
          storesGrouped[key].push(store.storeName);
        });
      }
      return {
        city: cityData.city,
        stores: storesGrouped,
      };
    });
    saveToJson(result, "store_names_by_length.json");
  } catch (error) {
    console.error("FilterShop error:", error);
  }
};

FilterShop();
