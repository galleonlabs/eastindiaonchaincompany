const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("EIOCTokenModule", (m) => {
  const eioc = m.contract("EIOCToken");
  return { eioc };
});
