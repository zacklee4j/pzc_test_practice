const { expect } = require('chai');
const { ethers } = require('hardhat');
const { 
  loadFixture, 
  time 
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { bigint } = require('hardhat/internal/core/params/argumentTypes');


describe("MyToken", function () {
    // 部署合约的fixture
    async function deployTokenFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      
      const Token = await ethers.getContractFactory("MyToken");
      const token = await Token.deploy(100); // 100万初始供应
      
      return { token, owner, addr1, addr2 };
    }
  
    it("应该正确设置初始供应量", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      // console.log(await token.totalSupply());
      const exp_value= 100n * 10n ** 18n;
      expect(BigInt(await token.totalSupply())).to.equal(exp_value);
      expect(await token.balanceOf(owner.address)).to.equal(exp_value);
    });
  
    it("应该允许代币转账", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const trans_balance = 1n * 10n ** 18n;
      const total_balance = 100n * 10n ** 18n;
      // 转账100代币
      await token.transfer(addr1.address, trans_balance );
      
      expect(await token.balanceOf(owner.address)).to.equal(
        total_balance - trans_balance
      );
      expect(await token.balanceOf(addr1.address)).to.equal(trans_balance);
    });
  
    it("应该拒绝超过余额的转账", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const over_balance = 1000n * 10n ** 18n;
      // 尝试转超过余额的代币
      await expect(
        token.connect(addr1).transfer(addr1.address, over_balance)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  
    it("只有所有者可以铸造新代币", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const total_balance = 100n * 10n ** 18n;
      // 所有者可以铸造
      await token.mint(owner.address, total_balance);
      expect(await token.totalSupply()).to.equal(total_balance * 2n);
      
      // 非所有者尝试铸造
      await expect(
        token.connect(addr1).mint(addr1.address, total_balance)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  
    it("应该正确触发Transfer事件", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const total_balance = 100n * 10n ** 18n;
      await expect(token.transfer(addr1.address, total_balance))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, total_balance);
    });
    it('应返回正确的元数据',async function (){
      const {token} = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal('MyToken');
      expect(await token.symbol()).to.equal("MTK");
      expect(await token.decimals()).to.equal(18);
    });
    it("非owner账户转账给另一非owner账户成功", async function(){
      const {token,owner,addr1,addr2} = await loadFixture(deployTokenFixture);
      const trans_balance = 1n * 10n ** 18n;
      const total_balance = 100n * 10n ** 18n;
      await token.transfer(addr1.address,trans_balance);
      expect(await token.balanceOf(owner.address)).to.equal(total_balance - trans_balance);
      expect(await token.balanceOf(addr1.address)).to.equal(trans_balance);
      await token.connect(addr1).transfer(addr2.address,trans_balance);
      expect(await token.balanceOf(addr1.address)).to.equal(0n);
      expect(await token.balanceOf(addr2.address)).to.equal(trans_balance);
    })
    it("授权账户使用指定数量的代币成功", async function(){
      const {token,owner,addr1,addr2} = await loadFixture(deployTokenFixture);
      const trans_balance = 1n * 10n ** 18n;
      const approve_balance = 10n * 10n ** 18n;
      const total_balance = 100n * 10n ** 18n;
      //console.log(0);
      const init_appro_balance = await token.allowance(owner.address,addr1.address);
      expect(init_appro_balance).to.equal(0n);
      //console.log(1);
      await token.connect(owner).approve(addr1.address, approve_balance);
      expect(await token.balanceOf(owner.address)).to.equal(total_balance);
      expect(await token.allowance(owner.address,addr1.address)).to.equal(approve_balance);
      //console.log(2);
      await token.connect(addr1).transferFrom(owner.address,addr2.address,trans_balance);
      expect(await token.allowance(owner.address,addr1.address)).to.equal(approve_balance -trans_balance );
      expect(await token.balanceOf(addr2.address)).to.equal(trans_balance);
    })
    it("授权交易额度不足时，回滚交易",async function (){
      const {token,owner,addr1,addr2} = await loadFixture(deployTokenFixture);
      const smallAmount = 50n * 10n ** 18n;
      const largeAmount = 1000n * 10n ** 18n;
       // 授权小额额度
      await token.connect(owner).approve(addr1.address, smallAmount);
      // 尝试转账超过授权额度
      await expect(
        token.connect(addr1).transferFrom(
          owner.address,
          addr2.address,
          largeAmount
        )
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");

    });
  });
  