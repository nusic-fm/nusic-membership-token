import { Wallet } from 'ethers';
import { ethers, waffle } from 'hardhat';
var crypto = require('crypto');
import { expect } from 'chai';
import { NUSICAliveCollectivePass, NUSICAliveCollectivePass__factory } from '../typechain';

describe("NusicMembership: Intial Sale", function () {
  let nusicAliveCollectivePass:NUSICAliveCollectivePass;
  let _accountListPublicSale:Wallet[] = [];
  let _accountListReserveSale:Wallet[] = [];
  before(async()=>{
    const [owner, addr1, addr2] = await ethers.getSigners();

    const addressToBeGeneratedForPublicSale = 10;
    console.log("Public-Sale Accounts Needs to Generate = ",addressToBeGeneratedForPublicSale);
    for(let i=0;i<addressToBeGeneratedForPublicSale;i++) {

        var id = crypto.randomBytes(32).toString('hex');
        var privateKey = "0x"+id;
        var wallet = new ethers.Wallet(privateKey,ethers.provider);
        _accountListPublicSale.push(wallet);
        // Transfering funds to new account as they will not have balance
        await addr1.sendTransaction({
            to:wallet.address,
            value: ethers.utils.parseEther("1")
        })
    }
    console.log("Public Accounts Generated = ",addressToBeGeneratedForPublicSale);

    const addressToBeGeneratedForReserve = 10;
    console.log("Reserve Accounts Needs to Generate = ",addressToBeGeneratedForReserve);
    for(let i=0;i<addressToBeGeneratedForReserve;i++) {

        var id = crypto.randomBytes(32).toString('hex');
        var privateKey = "0x"+id;
        var wallet = new ethers.Wallet(privateKey,ethers.provider);
        _accountListReserveSale.push(wallet);
        // Transfering funds to new account as they will not have balance
        await addr1.sendTransaction({
            to:wallet.address,
            value: ethers.utils.parseEther("1")
        })
    }
    console.log("Reserve Accounts Generated = ",addressToBeGeneratedForReserve);

    // Deployed Game NFT
    const NUSICAliveCollectivePass:NUSICAliveCollectivePass__factory =  await ethers.getContractFactory("NUSICAliveCollectivePass");
    nusicAliveCollectivePass = await NUSICAliveCollectivePass.deploy("NM Pass", "NMP");
    await nusicAliveCollectivePass.deployed(); 

    const txt1 = await nusicAliveCollectivePass.setTreasuryAddress(addr2.address);
    txt1.wait();
  });


  it("All Constant parameters are properly set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusicAliveCollectivePass.connect(addr1).MAX_SUPPLY())).to.be.equal(1000);
    expect((await nusicAliveCollectivePass.connect(addr1).PUBLIC_MAX())).to.be.equal(950);
    expect((await nusicAliveCollectivePass.connect(addr1).RESERVE_MAX())).to.be.equal(50);
    expect((await nusicAliveCollectivePass.connect(addr1).MINT_PER_ADDR())).to.be.equal(99);
  });

  it("Public-Sale should be true", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(addr1).saleLive()).to.be.true;
  });

  it("TotalMinted, publicTokenMinted should be zero", async function () {
    const [owner,addr1] = await ethers.getSigners();
    
    expect(await nusicAliveCollectivePass.connect(addr1).totalSupply()).to.be.equal(0);
    expect(await nusicAliveCollectivePass.connect(addr1).publicTokenMinted()).to.be.equal(0);
  });

  it("Price of each token is properly set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusicAliveCollectivePass.connect(addr1).price())).to.be.equal(ethers.utils.parseEther("0.0008"));
  });

  it("Public Sale mint should fail because mint per wallet limit exceed", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect(nusicAliveCollectivePass.connect(_accountListPublicSale[0]).mint(100)).to.be.revertedWith("Exceed Per Address limit");
  });

  it("public Sale mint should fail because funds not sent", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const price = await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).price();
    const amount = price.mul(99);
    await  expect(nusicAliveCollectivePass.connect(_accountListPublicSale[0]).mint(99)).to.be.revertedWith("Incorrect Funds Sent");
  });

  it("public Sale mint for 9 address should be successful", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const price = await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).price();
    const amount = price.mul(99);
    for (let index = 0; index < 9; index++) {
      //console.log(`index: ${index} -- _accountListPinkSale[index]: ${_accountListPinkSale[index].address}`);
      expect(await nusicAliveCollectivePass.connect(_accountListPublicSale[index]).mint(99, {value: amount})).to.be.ok;
    }
  });

  it("TotalMinted = 891, publiSaleMinted=891", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(addr1).totalSupply()).to.be.equal(891);
    expect(await nusicAliveCollectivePass.connect(addr1).publicTokenMinted()).to.be.equal(891);
    expect(await nusicAliveCollectivePass.connect(addr1).reserveTokenMinted()).to.be.equal(0);
  });

  it("public Sale mint for last address should be successful", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const price = await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).price();
    const amount = price.mul(59);
    expect(await nusicAliveCollectivePass.connect(_accountListPublicSale[9]).mint(59, {value: amount})).to.be.ok;
  });

  it("TotalMinted = 950, publiSaleMinted=950", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(addr1).totalSupply()).to.be.equal(950);
    expect(await nusicAliveCollectivePass.connect(addr1).publicTokenMinted()).to.be.equal(950);
    expect(await nusicAliveCollectivePass.connect(addr1).reserveTokenMinted()).to.be.equal(0);
  });

  
  it("public Sale mint should fail because Sale Quota Exceed", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const price = await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).price();
    const amount = price.mul(1);
    await expect(nusicAliveCollectivePass.connect(_accountListPublicSale[9]).mint(1, {value: amount})).to.be.revertedWith("Minting would exceed max public supply");
  });

  it("Airdrop for 10 address should be successful", async function () {
    const [owner,addr1] = await ethers.getSigners();
    let quantityList:number[] = [];
    let reserveAddressesList:string[] = [];
    for (let j = 0; j < _accountListReserveSale.length; j++) {
      reserveAddressesList[j] = _accountListReserveSale[j].address;
      quantityList[j] = 5;
    }
    expect(await nusicAliveCollectivePass.connect(owner).airdrop(reserveAddressesList, quantityList)).to.be.ok;
  });

  it("TotalMinted = 1000, publiSaleMinted=950,reserveTokenMinted=50", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(addr1).totalSupply()).to.be.equal(1000);
    expect(await nusicAliveCollectivePass.connect(addr1).publicTokenMinted()).to.be.equal(950);
    expect(await nusicAliveCollectivePass.connect(addr1).reserveTokenMinted()).to.be.equal(50);
  });

  it("Airdrop should fail ", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect(nusicAliveCollectivePass.connect(owner).airdrop([addr1.address], [5])).to.be.revertedWith("Minting would exceed max reserve supply");
  });

  it("Withdrawal should be successful", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    const addr2BalanceBefore = await ethers.provider.getBalance(addr2.address);
    const contractBalanceBefore = await ethers.provider.getBalance(nusicAliveCollectivePass.address);
    //console.log("addr2BalanceBefore = ",addr2BalanceBefore.toString());
    //console.log("contractBalanceBefore = ",contractBalanceBefore.toString());
    expect(await nusicAliveCollectivePass.connect(owner).withdraw()).to.be.ok;
    const contractBalanceAfter = await ethers.provider.getBalance(nusicAliveCollectivePass.address);
    //console.log("contractBalanceAfter = ",contractBalanceAfter.toString());
    expect(contractBalanceAfter).to.be.equal(0);
    const addr2BalanceAfter = await ethers.provider.getBalance(addr2.address);
    //console.log("addr2BalanceAfter = ",addr2BalanceAfter.toString());
    expect(addr2BalanceAfter).to.be.equal(addr2BalanceBefore.add(contractBalanceBefore));
  });

  it("Token URI should be empty", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(1)).to.be.equal("");
  });

  it("Default URI should be empty", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(owner).defaultURI()).to.be.equal("");
  });

  it("Update Token URI should fail because call is not token owner", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect(nusicAliveCollectivePass.connect(owner).setTokenURI(1,"http://thisis1")).to.be.revertedWith("Caller is not owner of token");
  });

  it("Update Token URI should successfull", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).setTokenURI(1,"http://thisis1")).to.be.ok;
  });

  it("Token URI should be set properly", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(1)).to.be.equal("http://thisis1");
    expect(await nusicAliveCollectivePass.connect(_accountListPublicSale[0]).tokenURI(1)).to.be.equal("http://thisis1");
  });

  it("Token URI for other tokens should be empty", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(2)).to.be.equal("");
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(25)).to.be.equal("");
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(567)).to.be.equal("");
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(754)).to.be.equal("");
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(943)).to.be.equal("");
    expect(await nusicAliveCollectivePass.connect(owner).tokenURI(999)).to.be.equal("");
  });
});
