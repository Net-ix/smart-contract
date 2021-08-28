var NetIx = artifacts.require("NetIx");

const { parseAndCreate } = require('../initialInfo/utils/token')

module.exports = function(deployer) {
  deployer.deploy(NetIx).then(instance => parseAndCreate(instance));
};
