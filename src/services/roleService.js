const Role = require("../models/Role");

class RoleService {
  async createRole(data) {
    const role = new Role(data);
    return await role.save();
  }

  async getAllRoles() {
    return await Role.find();
  }

  async getRoleById(id) {
    return await Role.findById(id);
  }

  async updateRole(id, data) {
    return await Role.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRole(id) {
    return await Role.findByIdAndDelete(id);
  }
}

module.exports = new RoleService();