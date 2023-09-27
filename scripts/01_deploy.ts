import { ethers, network } from 'hardhat';
import { NUSICAliveCollectivePass, NUSICAliveCollectivePass__factory } from '../typechain';

/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();
  console.log("Network = ",network.name);

  const NUSICAliveCollectivePass:NUSICAliveCollectivePass__factory =  await ethers.getContractFactory("NUSICAliveCollectivePass");
  const nusicAliveCollectivePass:NUSICAliveCollectivePass = await NUSICAliveCollectivePass.deploy("NM Pass C", "NMPC");
  //const nusicAliveCollectivePass:NUSICAliveCollectivePass = await NUSICAliveCollectivePass.deploy("NUSIC Alive Pass", "NAC",{gasPrice: 50000000000});
  await nusicAliveCollectivePass.deployed(); 
  console.log("NUSICAliveCollectivePass deployed to:", nusicAliveCollectivePass.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
