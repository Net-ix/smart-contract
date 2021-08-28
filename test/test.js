var NetIX = artifacts.require('./contracts/Net-IX.sol');

var NetIXInstance;

contract('Net-IX', function (accounts) {
    const name = 'Net-IX Token'
    const symbol = 'NTX'
    const totalSupply = 15000000
    const foundersShare = 1500000
    const teamsShare = 750000
    const consultorsShare = 300000
    const partnersShare = 450000
    const tokenDistribution1 = 4500000
    const tokenDistribution2Max = 3600000
    const tokenDistribution3Max = 2565000
    const tokenDistribution4Max = 1215000
    const tokenLeftOverMin = 120000
    it('Contract deployment', function () {
        return NetIX.deployed().then(function (instance) {
            NetIXInstance = instance;
            assert(NetIXInstance !== undefined, 'Net-IX contract should be defined');
        })
    })
    it('Initial values', function () {
        return NetIXInstance.name().then(function (result) {
            assert.equal(result, name, 'The name hase not been set correctly')
        }).then(function () {
            return NetIXInstance.symbol()
        }).then(function (result) {
            assert.equal(result, symbol, 'The symbol has not been set correctly')
        }).then(function () {
            return NetIXInstance.totalSupply()
        }).then(function (result) {
            assert.equal(result, totalSupply, 'The total supply has not been set correctly')
        })
    })
})