import { ethers, network } from 'hardhat';
import { NUSICAliveCollectivePass, NUSICAliveCollectivePass__factory } from '../typechain';
const addresses = require("./address.json");

/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  console.log("Network = ",network.name);

  
  const NUSICAliveCollectivePass:NUSICAliveCollectivePass__factory =  await ethers.getContractFactory("NUSICAliveCollectivePass");
  const nusicAliveCollectivePass:NUSICAliveCollectivePass = await NUSICAliveCollectivePass.attach(addresses[network.name].nusicAliveCollectivePass);
  console.log("NUSICAliveCollectivePass address:", nusicAliveCollectivePass.address);


  //const price = ethers.utils.parseEther("0.16");
  const price = await nusicAliveCollectivePass.price();
  const quantity = 2;
  const txt = await nusicAliveCollectivePass.connect(owner).mintTo("0xA0cb079D354b66188f533A919d1c58cd67aFe398",quantity, {value: (price.mul(quantity))} );
  //const txt = await nusicAliveCollectivePass.connect(owner).mint(quantity, {value: (price.mul(quantity))} );
  console.log("txt.hash nusicMembership.mint = ",txt.hash);
  const txtReceipt = await txt.wait();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
