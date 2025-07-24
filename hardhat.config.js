require("@nomicfoundation/hardhat-toolbox");
const PRIVATE_KEY1 = '0xab3473e7d3b9b90ba0b88f601e78497dacc5971f6e6908ef9579a989812ae1a1';
const PRIVATE_KEY2 = '0x817bb369530e838f56e9acee63a3987700bb88e3b1e3ada082d86e85756d553b';
const PRIVATE_KEY3 = '0x6d70eedc6e598beae134b9109ea86eea0fdf5ea4a7b7a8ac7de1118e27ea4445';
const PRIVATE_KEY4 = '0xc5ea6c38f33eba0f5d26176f62abfb4f2dfd587c752d1bf6a70146e699d553a2';

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: `http://127.0.0.1:9545`,
      chainId: 1337,
      accounts: [`${PRIVATE_KEY1}`,`${PRIVATE_KEY2}`,`${PRIVATE_KEY3}`,`${PRIVATE_KEY4}`]
    },
  }
};
