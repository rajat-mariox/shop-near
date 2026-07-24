const messages = require("../util/messages");

module.exports = (req, res, next, customMsg = "") => {
  console.log("ResponseMiddleware => exports");

  const data = req.rData ? req.rData : {};

  // Services set req.error on failure (not found, out of stock, unauthorized, etc.)
  // without always setting req.rCode - surface it as a real failure instead of a 200.
  if (req.error && req.rCode == undefined) {
    return res.status(400).send({ code: 0, message: req.error, data });
  }

  const code = req.rCode != undefined ? req.rCode : 1;
  const message = customMsg
    ? customMsg
    : req.msg
    ? messages()[req.msg]
    : req.error
    ? req.error
    : "success";

  if (code == 3) {
    res.status(401).send({ code, message, data });
  } else if (code == 4) {
    res.status(403).send({ code, message, data });
  } else if (code == 0) {
    res.status(400).send({ code, message, data });
  } else if (code == 5) {
    res.status(404).send({ code, message, data });
  } else {
    res.send({ code, message, data });
  }
};
