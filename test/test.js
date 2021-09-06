const TronWeb = require('tronweb');
const { default: axios } = require('axios');

var NetIX = artifacts.require('./NetIx.sol');

var NetIXInstance;

const tronweb = new TronWeb({
    fullHost: 'http://127.0.0.1:9090',
    privateKey: "cb415a4e2661572604277318156d3c427d44a75be71602867c8b956867e2c8ad"
})

var votedYes = 0;
var votedNo = 0;

function saveVote (balance, vote) {
    switch (vote){
        case true:
            votedYes += balance;
            break;
        case false:
            votedNo += balance;
            break;
    }
}

function now () {
   return Math.floor(new Date().getTime() / 1000.0)
}

function parseTime(time) {
    return Math.floor(time / 1000.0)
}

function sleep(ms) {
    // console.warn(`sleeping for ${ms} miliseconds...`)
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveTransaction(TXHash) {
    let result = {};
    do {
        // console.warn('resolving transaction...')
        await sleep(3000);
        result = await axios.get(`http://127.0.0.1:9090/walletsolidity/gettransactioninfobyid`, {
            params: {
                value: TXHash
            },
        }).then(result => result.data);
    } while (JSON.stringify(result) === JSON.stringify({}));
    console.warn(`transaction resolved`)
    const resultString = result.receipt.result;
    const resultLog = result.log;
    const resultMessage = result.contractResult[0];
    return [resultString, resultLog, resultMessage, result];
}

contract('Token', function (accounts) {
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    const [
        contractOwnerAddress,
        foundersAddress,
        teamsAddress,
        consultorsAddress,
        partnersAddress,
        customer1Address,
        customer2Address,
        customer3Address,
        customer4Address
    ] = accounts
    const name = 'NetIx'
    const symbol = 'NTX'
    const decimals = 6
    const totalSupply = 15000000 * (10 ** decimals)
    const remainingTokenAfterConstructor = 12000000 * (10 ** decimals)
    const tokenDistribution1 = 4500000 * (10 ** decimals)
    const testTransferAmountFromFounderToCustomer1 = 100000 * (10 ** decimals)
    const testAllowanceAmountFromFounderToCustomer2 = 200000 * (10 ** decimals)
    const customer4TokenToBuy = 100000 * (10 ** decimals)
    const tokenDistribution2Max = 3600000 * (10 ** decimals)
    const tokenDistribution3Max = 2565000 * (10 ** decimals)
    const tokenDistribution4Max = 1215000 * (10 ** decimals)
    const tokenLeftOverMin = 120000 * (10 ** decimals)
    var remainingTokens = remainingTokenAfterConstructor;
    var currentRedistributionEndTime = 0;
    var currentRedistributionStartTime = 0;
    var currentRedistributionTokensLeft = 0;
    const contractOwner = {
        address: contractOwnerAddress,
        balance: remainingTokenAfterConstructor,
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: false,
        hasVoted: false
    }
    const founder = {
        address: foundersAddress,
        balance: 1500000 * (10 ** decimals),
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: true,
        hasVoted: false
    }
    const team = {
        address: teamsAddress,
        balance: 750000 * (10 ** decimals),
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: true,
        hasVoted: false
    }
    const consultor = {
        address: consultorsAddress,
        balance: 300000 * (10 ** decimals),
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: true,
        hasVoted: false
    }
    const partner = {
        address: partnersAddress,
        balance: 450000 * (10 ** decimals),
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: true,
        hasVoted: false
    }
    const customer1 = {
        address: customer1Address,
        balance: 0,
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: false,
        hasVoted: false
    }
    const customer2 = {
        address: customer2Address,
        balance: 0,
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: false,
        hasVoted: false
    }
    const customer3 = {
        address: customer3Address,
        balance: 0,
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: false,
        hasVoted: false
    }
    const customer4 = {
        address: customer4Address,
        balance: 0,
        lockedBalance: {
            amount: 0,
            endTime: 0
        },
        allowance: {
            given: [],
            taken: []
        },
        vote: false,
        hasVoted: false
    }

    it('Contract deployment', function () {
        return NetIX.deployed().then(function (instance) {
            NetIXInstance = instance;
            assert(NetIXInstance !== undefined, 'Net-IX contract should be defined');
        })
    });

    it('Initial values', function () {
        return NetIXInstance.call('name')
            .then(function (result) {
                assert.equal(result, name, 'The name hase not been set correctly')
            }).then(function () {
                return NetIXInstance.symbol()
            }).then(function (result) {
                assert.equal(result, symbol, 'The symbol has not been set correctly')
            }).then(function () {
                return NetIXInstance.decimals()
            }).then(function (result) {
                assert.equal(result, decimals, 'The decimals has not been set correctly')
            }).then(function () {
                return NetIXInstance.totalSupply()
            }).then(function (result) {
                assert.equal(result.toNumber(), totalSupply, 'The total supply has not been set correctly')
            }).then(function () {
                return NetIXInstance.currentDistribution()
            }).then(function({amount, startTime, endTime}) {
                assert.equal(amount, 0, 'initial amount on current distribution is not set correctly')
                assert.equal(startTime, 0, 'initial start time on current distribution is not set correctly')
                assert.equal(endTime, 0, 'initial end time on current distribution is not set correctly')
            })
    });

    it('transfered tokens in constructor', function () {
        return NetIXInstance.balanceOf(founder.address)
            .then(function (result) {
                assert.equal(result.toNumber(), founder.balance, 'founders balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(team.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), team.balance, 'teams balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(consultor.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), consultor.balance, 'consultors balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(partner.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), partner.balance, 'partners balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(contractOwner.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), contractOwner.balance, 'contract owner balance is incorrect')
            })
    });

    it('zero address negative tests', function () {
        return NetIXInstance.increaseAllowance(zeroAddress, 0, {from: founder.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'increase allowance is accepting zero address')
            })
            .then(function () {
                return NetIXInstance.decreaseAllowance(zeroAddress, 0, { from: founder.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'decrease allowance is accepting zero address')
            })
            .then(function () {
                return NetIXInstance.approve(zeroAddress, 0, { from: founder.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'approve is accepting zero address')
            })
            .then(function () {
                return NetIXInstance.transfer(zeroAddress, 0, { from: founder.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'transfer is accepting zero address')
            })
    });

    it('approve negative test', function () {
        return NetIXInstance.approve(customer1.address, 0, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'approve function is letting contract owner to have allowance')
            })
            .then(function () {
                return NetIXInstance.increaseAllowance(customer1.address, 0, { from: contractOwner.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'increase allowance function is letting contract owner to have allowance')
            })
            .then(function () {
                return NetIXInstance.decreaseAllowance(customer1.address, 0, { from: contractOwner.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'decrease allowance function is letting contract owner to have allowance')
            })
    });

    it('Before redistribution transfre negative test', function () {
        return NetIXInstance.transfer(customer1.address, 0, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'tokens are being transfered from contract owner account withot redistribution')
            })
    });

    it('Before redistribution transfre positive test', function () {
        return NetIXInstance.transfer(customer1.address, testTransferAmountFromFounderToCustomer1, {from: founder.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([resultString, resultLog, resultMessage, result]) {
                assert.equal(resultString, 'SUCCESS', `The function is not behaving right on customer 1 with the right inputs. result: ${JSON.stringify(result)}`)
                founder.balance -= testTransferAmountFromFounderToCustomer1
                customer1.balance = testTransferAmountFromFounderToCustomer1;
            })
            .then(function () {
                return NetIXInstance.transfer(customer2.address, customer1.balance / 2, {from: customer1.address})
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([resultString, resultLog, resultMessage, result]) {
                assert.equal(resultString, 'SUCCESS', `The function is not behaving right on customer 2 with the right inputs. result: ${JSON.stringify(result)}`)
                customer1.balance = customer1.balance / 2;
                customer2.balance = customer1.balance;
            })
    });

    it('Before redistribution allowance positive test', function () {
        return NetIXInstance.increaseAllowance(customer2.address, testAllowanceAmountFromFounderToCustomer2, {from: founder.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'SUCCESS', 'The function is not behaving right with the right inputs')
                customer2.allowance.taken.push({
                    account: founder,
                    from: founder.address,
                    amount: testAllowanceAmountFromFounderToCustomer2
                })
            })
    });

    it('Before redistribution transfer-from positive test', function () {
        return NetIXInstance.transferFrom(customer2.allowance.taken[0].from, customer3.address, customer2.allowance.taken[0].amount / 2, {from: customer2.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([resultString, resultLog, resultMessage, result]) {
                assert.equal(resultString, 'SUCCESS', `The function is not behaving right on customer 3 with the right inputs. result: ${JSON.stringify(result)}`)
                customer2.allowance.taken[0].account.balance -= customer2.allowance.taken[0].amount / 2
                customer2.allowance.taken[0].amount = customer2.allowance.taken[0].amount / 2
                customer3.balance = customer2.allowance.taken[0].amount
            })
            .then(function () {
                return NetIXInstance.transferFrom(customer2.allowance.taken[0].from, customer2.address, customer2.allowance.taken[0].amount / 2, { from: customer2.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([resultString, resultLog, resultMessage, result]) {
                assert.equal(resultString, 'SUCCESS', `The function is not behaving right on customer 2 with the right inputs. result: ${JSON.stringify(result)}`)
                customer2.allowance.taken[0].account.balance -= customer2.allowance.taken[0].amount / 2
                customer2.balance += customer2.allowance.taken[0].amount / 2;
                customer2.allowance.taken[0].amount = customer2.allowance.taken[0].amount / 2
            })
    });

    it('Before redistribution allowance positive test 2', function () {
        return NetIXInstance.decreaseAllowance(customer2.address, customer2.allowance.taken[0].amount, { from: founder.address })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'SUCCESS', 'The function is not behaving right with the right inputs')
                customer2.allowance.taken.splice(0, 1)
            })
    });

    it('Before redistribution redistribute Negative test', function () {
        return NetIXInstance.redistribute(1 , now() + 123456, {from: customer1.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'isOwner modifier is not working correctly')
            })
            .then(function () {
                return NetIXInstance.redistribute(remainingTokens + 1, now() + 123456, {from: contractOwner.address})
            })
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'The function is accepting amount, more than contract owner balance')
            })
            .then(function () {
                return NetIXInstance.redistribute(1, now() - 123456, {from: contractOwner.address})
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'The function is accepting time in the past')
            })
    })

    it('locked balance of users', function () {
        return NetIXInstance.lockedBalanceOf(contractOwner.address)
            .then(function({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of contract owner is not correct')
                assert(endTime, 0, 'locked balance end time of contract owner is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(founder.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of founder is not correct')
                assert(endTime, 0, 'locked balance end time of founder is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(team.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of team is not correct')
                assert(endTime, 0, 'locked balance end time of team is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(consultor.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of consultor is not correct')
                assert(endTime, 0, 'locked balance end time of consultor is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(partner.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of partner is not correct')
                assert(endTime, 0, 'locked balance end time of partner is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer1.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of customer1 is not correct')
                assert(endTime, 0, 'locked balance end time of customer1 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer2.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of customer2 is not correct')
                assert(endTime, 0, 'locked balance end time of customer2 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer3.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of customer3 is not correct')
                assert(endTime, 0, 'locked balance end time of customer3 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer4.address)
            })
            .then(function ({amount, endTime}) {
                assert(amount, 0, 'locked balance amount of customer4 is not correct')
                assert(endTime, 0, 'locked balance end time of customer4 is not correct')
            })
    });

    it('Redistribution positive test', function () {
        currentRedistributionEndTime = now() + 123456
        return NetIXInstance.redistribute(tokenDistribution1, currentRedistributionEndTime, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'The function is not behaving right with the right inputs')
                currentRedistributionStartTime = parseTime(fullResult.blockTimeStamp)
                currentRedistributionTokensLeft = tokenDistribution1
            })
    });

    it('Current Redistribution getter test', function () {
        return NetIXInstance.currentDistribution()
        .then(function ({ amount, startTime, endTime }) {
            assert.equal(amount, currentRedistributionTokensLeft, 'amount on current distribution is not set correctly')
            assert.equal(startTime.toNumber(), currentRedistributionStartTime, 'start time on current distribution is not set correctly')
            assert.equal(endTime.toNumber(), currentRedistributionEndTime, 'end time on current distribution is not set correctly')
        })
    });

    it('Purchase token on first redistribution', function () {
        return NetIXInstance.transfer(customer4.address, customer4TokenToBuy, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'SUCCESS', 'The function is not behaving right with the right inputs')
                contractOwner.balance -= customer4TokenToBuy
                customer4.balance += customer4TokenToBuy;
                customer4.lockedBalance = {
                    amount: customer4.balance,
                    endTime: currentRedistributionStartTime + 10368000
                }
                currentRedistributionTokensLeft -= customer4TokenToBuy
            })
    });

    it('check balance and locked balance of token bought on first redistribution', function () {
        return NetIXInstance.lockedBalanceOf(customer4.address)
            .then(function({amount, endTime}) {
                assert.equal(amount.toNumber(), customer4.lockedBalance.amount, 'locked balance amount of customer 4 is not set correctly')
                assert.equal(endTime.toNumber(), customer4.lockedBalance.endTime, 'locked balance end time of customer 4 is not set correctly')
            })
            .then(function () {
                return NetIXInstance.balanceOf(customer4.address)
            })
            .then(function (result) {
                assert.equal(result, customer4.balance, 'balance of customer 4 is not set correctly')
            })
    });

    it('Redistribute while there is an active redistribution available negative test', function () {
        return NetIXInstance.redistribute(100, now() + 123456, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'redistribute function is not stopping double redistributing')
            })
    });

    it('zeroing available tokens on redistribution', function () {
        return NetIXInstance.transfer(customer3.address, currentRedistributionTokensLeft, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'SUCCESS', 'transfer function is not zeroing leftover tokens of distribution 1')
                contractOwner.balance -= currentRedistributionTokensLeft
                customer3.balance += currentRedistributionTokensLeft
                customer3.lockedBalance = {
                    amount: currentRedistributionTokensLeft,
                    endTime: currentRedistributionEndTime + 10368000
                }
                currentRedistributionTokensLeft = 0
            })
    });

    it('transfer test of balance and locked balance', function () {
        return NetIXInstance.transfer(customer1.address, (customer3.balance - customer3.lockedBalance.amount) + 1, {from: customer3.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'REVERT', 'transfer function is allowing to transfer more than locked balance')
            })
            .then(function () {
                return NetIXInstance.transfer(customer1.address, (customer3.balance - customer3.lockedBalance.amount) - 100, {from: customer3.address})
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result]) {
                assert.equal(result, 'SUCCESS', 'transfer function is not transfering less than blocked balance')
                const transferedAmount = ((customer3.balance - customer3.lockedBalance.amount) - 100)
                customer1.balance += transferedAmount
                customer3.balance -= transferedAmount
            })
    });

    it('redistribute positive test after zeroing tokens on redistribtion', function () {
        currentRedistributionEndTime = now() + 10
        return NetIXInstance.redistribute(tokenDistribution2Max, currentRedistributionEndTime, { from: contractOwner.address })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'The function is not behaving right with the right inputs')
                currentRedistributionStartTime = parseTime(fullResult.blockTimeStamp)
                currentRedistributionTokensLeft = tokenDistribution2Max
            })
    });

    it('redistribute positive test after end time', async function () {
        await sleep(21000)
        currentRedistributionEndTime = now() + 123456
        return NetIXInstance.redistribute(tokenDistribution2Max, currentRedistributionEndTime, { from: contractOwner.address })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', `The function is not behaving right with the right inputs. result: ${JSON.stringify(fullResult)}`)
                currentRedistributionStartTime = parseTime(fullResult.blockTimeStamp)
                currentRedistributionTokensLeft = tokenDistribution2Max
            })
    });

    it('re test transfres', function () {
        const transferedAmount = 400 * (10 ** decimals)
        return NetIXInstance.transfer(customer4.address, transferedAmount, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'The transfer after redistribution is not done')
                contractOwner.balance -= transferedAmount
                customer4.balance += transferedAmount
                customer4.lockedBalance = {
                    amount: transferedAmount,
                    endTime: currentRedistributionStartTime + 10368000
                }
                currentRedistributionTokensLeft -= transferedAmount
            })
    });

    it('negative test - vote before voting has started', function () {
        return NetIXInstance.vote(true)
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'contract is accepting votes before starting voting')
            })
    });

    it('negative test - call start voting from other than owner', function () {
        return NetIXInstance.startVoting({from: founder.address})
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'contract is starting voting with the call of other than contract owner')
            })
    });

    it('negative test - call reveal before voting has started', function () {
        return NetIXInstance.reveal()
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'contract is revealing the voting result before starting to vote')
            })
    });

    it('positive test - call voting state getter', function() {
        return NetIXInstance.votingState()
            .then(function(result) {
                assert.equal(result, 0, 'the voting state is not on the 0 state')
            })
    });

    it('positive test - call start voting', function() {
        return NetIXInstance.startVoting()
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'voting is not starting with right inputs')
            })
    });

    it('negative test - re call start voting', function() {
        return NetIXInstance.startVoting()
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'voting is starting while there is an ongoing voting')
            })
    });

    it('negative test - call reveal from other than owner', function() {
        return NetIXInstance.reveal({from: founder.address})
            .then(function(TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'reveal function is being called from other than contract owner')
            })
    });

    it('positive test - vote from multiple accounts', function () {
        return NetIXInstance.vote(contractOwner.vote, {from: contractOwner.address})
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'contract owner vote is not submitted')
                contractOwner.hasVoted = true;
                saveVote(contractOwner.balance, contractOwner.vote)
            })
            .then(function () {
                return NetIXInstance.vote(founder.vote, { from: founder.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'founder vote is not submitted')
                founder.hasVoted = true;
                saveVote(founder.balance, founder.vote)
            })
            .then(function () {
                return NetIXInstance.vote(team.vote, { from: team.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'team vote is not submitted')
                team.hasVoted = true;
                saveVote(team.balance, team.vote)
            })
            .then(function () {
                return NetIXInstance.vote(consultor.vote, { from: consultor.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'consultor vote is not submitted')
                consultor.hasVoted = true;
                saveVote(consultor.balance, consultor.vote)
            })
            .then(function () {
                return NetIXInstance.vote(partner.vote, { from: partner.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'partner vote is not submitted')
                partner.hasVoted = true;
                saveVote(partner.balance, partner.vote)
            })
    });

    it('negative test - revote with some accounts', function () {
        return NetIXInstance.vote(true, { from: consultor.address })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'REVERT', 'consultor revoted')
            })
    });

    it('positive test - check voting state before reveal', function () {
        return NetIXInstance.votingState()
            .then(function (result) {
                assert.equal(result, 1, 'the voting state is not on the 1 state')
            })
    });

    it('positive test - call reveal', function () {
        return NetIXInstance.reveal()
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                const voteTestResult = votedYes > votedNo ? 1 : 0;
                assert.equal(result, 'SUCCESS', 'reveal function did not end in success state')
                assert.equal(fullResult.contractResult[0].slice(-1), voteTestResult)
            })
    });

    

    it('positive test - check voting state after reveal', function () {
        return NetIXInstance.votingState()
            .then(function (result) {
                assert.equal(result, 0, 'the voting state is not on the 0 state')
                contractOwner.hasVoted = false
                founder.hasVoted = false
                team.hasVoted = false
                consultor.hasVoted = false
                partner.hasVoted = false
            })
    });

    it('positive test - call start voting after reveal', function () {
        return NetIXInstance.startVoting()
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'voting is not starting with right inputs')
                votedYes = 0;
                votedNo = 0
            })
    });

    it('positive test - vote from multiple accounts', function () {
        contractOwner.vote = !contractOwner.vote
        return NetIXInstance.vote(contractOwner.vote, { from: contractOwner.address })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'contract owner vote is not submitted')
                contractOwner.hasVoted = true
                saveVote(contractOwner.balance, contractOwner.vote)
            })
            .then(function () {
                founder.vote = !founder.vote
                return NetIXInstance.vote(founder.vote, { from: founder.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'founder vote is not submitted')
                founder.hasVoted = true
                saveVote(founder.balance, founder.vote)
            })
            .then(function () {
                team.vote = !team.vote
                return NetIXInstance.vote(team.vote, { from: team.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'team vote is not submitted')
                team.hasVoted = true
                saveVote(team.balance, team.vote)
            })
            .then(function () {
                consultor.vote = !consultor.vote
                return NetIXInstance.vote(consultor.vote, { from: consultor.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'consultor vote is not submitted')
                consultor.hasVoted = false
                saveVote(consultor.balance, consultor.vote)
            })
            .then(function () {
                partner.vote = !partner.vote
                return NetIXInstance.vote(partner.vote, { from: partner.address })
            })
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                assert.equal(result, 'SUCCESS', 'partner vote is not submitted')
                partner.hasVoted = false
                saveVote(partner.balance, partner.vote)
            })
    });

    it('positive test - call reveal 2', function () {
        return NetIXInstance.reveal()
            .then(function (TXHash) {
                return resolveTransaction(TXHash)
            })
            .then(function ([result, log, msg, fullResult]) {
                const voteTestResult = votedYes > votedNo ? 1 : 0;
                assert.equal(result, 'SUCCESS', 'reveal function did not end in success state')
                assert.equal(fullResult.contractResult[0].slice(-1), voteTestResult, `voting result is not correct. full result: ${JSON.stringify(fullResult)}`)
            })
    });

    it('contract final states', function () {
        return NetIXInstance.balanceOf(founder.address)
            .then(function (result) {
                assert.equal(result.toNumber(), founder.balance, 'founders balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(team.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), team.balance, 'teams balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(consultor.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), consultor.balance, 'consultors balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(partner.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), partner.balance, 'partners balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(contractOwner.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), contractOwner.balance, 'contract owner balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(customer1.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), customer1.balance, 'contract owner balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(customer2.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), customer2.balance, 'contract owner balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(customer3.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), customer3.balance, 'contract owner balance is incorrect')
            }).then(function () {
                return NetIXInstance.balanceOf(customer4.address)
            }).then(function (result) {
                assert.equal(result.toNumber(), customer4.balance, 'contract owner balance is incorrect')
            })
            .then(function () {
                return NetIXInstance.currentDistribution()
            })
            .then(function ({ amount, startTime, endTime }) {
                assert.equal(amount.toNumber(), currentRedistributionTokensLeft, 'amount on current distribution is not set correctly')
                assert.equal(startTime.toNumber(), currentRedistributionStartTime, 'start time on current distribution is not set correctly')
                assert.equal(endTime.toNumber(), currentRedistributionEndTime, 'end time on current distribution is not set correctly')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(contractOwner.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, contractOwner.lockedBalance.amount, 'locked balance amount of contract owner is not correct')
                assert(endTime, contractOwner.lockedBalance.endTime, 'locked balance end time of contract owner is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(founder.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, founder.lockedBalance.amount, 'locked balance amount of founder is not correct')
                assert(endTime, founder.lockedBalance.endTime, 'locked balance end time of founder is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(team.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, team.lockedBalance.amount, 'locked balance amount of team is not correct')
                assert(endTime, team.lockedBalance.endTime, 'locked balance end time of team is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(consultor.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, consultor.lockedBalance.amount, 'locked balance amount of consultor is not correct')
                assert(endTime, consultor.lockedBalance.endTime, 'locked balance end time of consultor is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(partner.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, partner.lockedBalance.amount, 'locked balance amount of partner is not correct')
                assert(endTime, partner.lockedBalance.endTime, 'locked balance end time of partner is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer1.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, customer1.lockedBalance.amount, 'locked balance amount of customer1 is not correct')
                assert(endTime, customer1.lockedBalance.endTime, 'locked balance end time of customer1 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer2.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, customer2.lockedBalance.amount, 'locked balance amount of customer2 is not correct')
                assert(endTime, customer2.lockedBalance.endTime, 'locked balance end time of customer2 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer3.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, customer3.lockedBalance.amount, 'locked balance amount of customer3 is not correct')
                assert(endTime, customer3.lockedBalance.endTime, 'locked balance end time of customer3 is not correct')
            })
            .then(function () {
                return NetIXInstance.lockedBalanceOf(customer4.address)
            })
            .then(function ({ amount, endTime }) {
                assert(amount, customer4.lockedBalance.amount, 'locked balance amount of customer4 is not correct')
                assert(endTime, customer4.lockedBalance.endTime, 'locked balance end time of customer4 is not correct')
            })

    })
})