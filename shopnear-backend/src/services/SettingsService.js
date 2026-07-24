const Settings = require("../models/Settings");

module.exports = () => {
  const fetchByQuery = (query) => {
    return new Promise(function (resolve, reject) {
      Settings.findOne(query).then(resolve).catch(reject);
    });
  };

  const addSettings = (data) => {
    return new Promise(function (resolve, reject) {
      Settings.create(data).then(resolve).catch(reject);
    });
  };

  const updateSettings = (id, data) => {
    return new Promise(function (resolve, reject) {
      Settings.findByIdAndUpdate(id, data, { new: true })
        .then(resolve)
        .catch(reject);
    });
  };

  return {
    fetchByQuery,
    addSettings,
    updateSettings,
  };
};
