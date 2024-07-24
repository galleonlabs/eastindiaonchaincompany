const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("EIOCToken", function () {

  async function deployToken() {
    const [ owner ] = await ethers.getSigners();

    const EIOCToken = await ethers.getContractFactory("EIOCToken");
    const eioc = await EIOCToken.deploy();

    return { eioc };
  }

  describe("Deployment", function () {
    it("", async function () {
      //  const { eiocToken  } = await loadFixture(deployToken);

      // expect();
    });
  });


});
