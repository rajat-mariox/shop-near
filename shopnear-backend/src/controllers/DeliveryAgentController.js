const DeliveryAgent = require("../models/DeliveryAgent");
var ObjectId = require("mongoose").Types.ObjectId;

/**
 * Seller ke delivery agents (shop servants) ka CRUD —
 * seller panel se manage hota hai, shipped order par assign hote hain
 */
module.exports = () => {
  /**
   * List agents of logged-in seller
   */
  const listAgents = async (req, res, next) => {
    try {
      console.log("DeliveryAgentController => listAgents");
      const { sellerId } = req.body;

      const agents = await DeliveryAgent.find({
        sellerId: new ObjectId(sellerId),
      }).sort({ createdAt: -1 });

      req.msg = "success";
      req.rData = { agents };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Create agent
   */
  const createAgent = async (req, res, next) => {
    try {
      console.log("DeliveryAgentController => createAgent");
      const { sellerId, name, mobile, vehicleNumber, notes } = req.body;

      const existing = await DeliveryAgent.findOne({
        sellerId: new ObjectId(sellerId),
        mobile: String(mobile).trim(),
      });
      if (existing) {
        req.rCode = 5;
        req.msg = "agent_mobile_already_exists";
        req.rData = {};
        return next();
      }

      const agent = await DeliveryAgent.create({
        sellerId: new ObjectId(sellerId),
        name,
        mobile: String(mobile).trim(),
        vehicleNumber,
        notes,
      });

      req.msg = "agent_created";
      req.rData = agent;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Update agent (name/mobile/vehicle/notes/isActive)
   */
  const updateAgent = async (req, res, next) => {
    try {
      console.log("DeliveryAgentController => updateAgent");
      const { sellerId, name, mobile, vehicleNumber, notes, isActive } =
        req.body;
      const { id } = req.params;

      const update = {};
      if (name !== undefined) update.name = name;
      if (mobile !== undefined) update.mobile = String(mobile).trim();
      if (vehicleNumber !== undefined) update.vehicleNumber = vehicleNumber;
      if (notes !== undefined) update.notes = notes;
      if (isActive !== undefined) update.isActive = isActive;

      const agent = await DeliveryAgent.findOneAndUpdate(
        { _id: new ObjectId(id), sellerId: new ObjectId(sellerId) },
        update,
        { new: true }
      );

      if (!agent) {
        req.rCode = 5;
        req.msg = "agent_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "agent_updated";
      req.rData = agent;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Delete agent
   */
  const deleteAgent = async (req, res, next) => {
    try {
      console.log("DeliveryAgentController => deleteAgent");
      const { sellerId } = req.body;
      const { id } = req.params;

      const agent = await DeliveryAgent.findOneAndDelete({
        _id: new ObjectId(id),
        sellerId: new ObjectId(sellerId),
      });

      if (!agent) {
        req.rCode = 5;
        req.msg = "agent_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "agent_deleted";
      req.rData = {};
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  return {
    listAgents,
    createAgent,
    updateAgent,
    deleteAgent,
  };
};
