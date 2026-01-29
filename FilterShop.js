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
