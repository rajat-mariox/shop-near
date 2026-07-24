const Brands = require("../models/Brands");

module.exports = () => {
  const addBrands = (data) => {
    return new Promise(function (resolve, reject) {
      Brands.create(data).then(resolve).catch(reject);
    });
  };

  const fetch = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Brands.findById(id).select("-__v");
      orm.then(resolve).catch(reject);
    });
  };

  const fetchByQuery = (query) => {
    console.log("BrandsService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Brands.findOne(query).select("").sort({ _id: -1 });
      orm.then(resolve).catch(reject);
    });
  };

  const updateBrands = (BrandsId, data) => {
    console.log("BrandsService => resetPassword");
    return new Promise(async function (resolve, reject) {
      await Brands.findByIdAndUpdate({ _id: BrandsId }, data)
        .then(resolve)
        .catch(reject);
    });
  };

  const fetchByQueryToEdit = (query) => {
    console.log("BrandsService => fetchByQuery");
    return new Promise(function (resolve, reject) {
      let orm = Brands.findOne(query).select("");

      orm.then(resolve).catch(reject);
    });
  };

  const getBrands = (query, page, limit) => {
    if (page) {
      page -= 1;
    }
    return new Promise(function (resolve, reject) {
      let orm = Brands.find(query)
        .select(" -__v")
        .sort({ _id: -1 })
        .skip(page * limit)
        .limit(limit);
      orm.then(resolve).catch(reject);
    });
  };

  const countBrands = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Brands.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const deleteBrands = (id) => {
    return new Promise(function (resolve, reject) {
      let orm = Brands.deleteOne({ _id: id });
      orm.then(resolve).catch(reject);
    });
  };

  return {
    addBrands,
    fetch,
    fetchByQuery,
    fetchByQueryToEdit,
    updateBrands,
    getBrands,
    countBrands,
    deleteBrands,
  };
};
