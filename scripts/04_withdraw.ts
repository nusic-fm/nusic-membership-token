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


  const txt = await nusicAliveCollectivePass.withdraw()
  console.log("nusicAliveCollectivePass.withdraw txt.hash = ",txt.hash);
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
