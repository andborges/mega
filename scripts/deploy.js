const hre = require("hardhat");

async function main() {
  const Mega = await hre.ethers.getContractFactory("Mega");
  const mega = await Mega.deploy("Mega!");

  await mega.deployed();

  console.log("Mega deployed to:", mega.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });