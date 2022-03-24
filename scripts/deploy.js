async function main() {
    const Mega = await ethers.getContractFactory("Mega");
 
    // Start deployment, returning a promise that resolves to a contract object
    const mega = await Mega.deploy("Mega!");
    console.log("Contract deployed to address:", mega.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });