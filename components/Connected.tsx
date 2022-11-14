import {
  Button,
  Container,
  Heading,
  VStack,
  Text,
  HStack,
  Image,
} from "@chakra-ui/react";
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  walletAdapterIdentity,
  CandyMachine,
} from "@metaplex-foundation/js";
import { useRouter } from "next/router";
import styles from "../styles/custom.module.css";

const Connected: FC = () => {
  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();
  const [isMinting, setIsMinting] = useState(false);

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter));
  }, [connection, walletAdapter]);

  const [getNftData, setNftData] = useState([]);
  const [page, setPage] = useState(1);

  const [pageItems, setPageItems] = useState<any>();
  // useEffect(() => {
  //   if (!metaplex) return

  //   metaplex
  //     .candyMachines()
  //     .findByAddress({
  //       address: new PublicKey("ELgav1kTkmmu58rq33SfVYCD3YJGCU5TobwQRivtukie"),
  //     })
  //     .run()
  //     .then((candyMachine) => {
  //       console.log(candyMachine)
  //       setCandyMachine(candyMachine)
  //     })
  //     .catch((error) => {
  //       alert(error)
  //     })
  // }, [metaplex])

  console.log(candyMachine?.items.length);

  const fetchCandyMachine = async () => {
    setPage(1);
    // fetch candymachine data
    try {
      const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({
          address: new PublicKey(
            "ELgav1kTkmmu58rq33SfVYCD3YJGCU5TobwQRivtukie"
          ),
        })
        .run();

      // let nftData = []
      // for (let i=0; i < candyMachine.items.length; i++){
      //     let fetchResult = await fetch(candyMachine.items[i].uri)
      //     let json = await fetchResult.json()
      //     nftData.push(json)
      // }

      //console.log("FALAN FİLAN İNTER MİLAN", nftData)
      setCandyMachine(candyMachine);
      //setNftData(nftData)
    } catch (e) {
      alert("Please submit a valid CMv2 address.");
    }
  };

  const getPage = async (page: number, perPage: number) => {
    const pageItems = candyMachine?.items.slice(
      (page - 1) * perPage,
      page * perPage
    );

    let nftData = [];
    for (let i = 0; i < pageItems.length; i++) {
      let fetchResult = await fetch(pageItems[i].uri);
      let json = await fetchResult.json();
      nftData.push(json);
    }
    setPageItems(nftData);
  };

  // previous page
  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1);
    } else {
      setPage(page - 1);
    }
  };

  // next page
  const next = async () => {
    setPage(page + 1);
  };

  useEffect(() => {
    fetchCandyMachine();
  }, []);

  // fetch metadata for NFTs when page or candy machine changes
  useEffect(() => {
    if (!candyMachine) {
      return;
    }
    getPage(page, 9);
  }, [candyMachine, page]);

  const router = useRouter();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (event.defaultPrevented) return;

      if (!walletAdapter.connected || !candyMachine) {
        return;
      }

      try {
        setIsMinting(true);
        const nft = await metaplex.candyMachines().mint({ candyMachine }).run();

        console.log(nft);
        router.push(`/newMint?mint=${nft.nft.address.toBase58()}`);
      } catch (error) {
        alert(error);
      } finally {
        setIsMinting(false);
      }
    },
    [metaplex, walletAdapter, candyMachine]
  );

  return (
    <VStack spacing={20}>
      <Container>
        <VStack spacing={8}>
          <Heading
            color="white"
            as="h1"
            size="2xl"
            noOfLines={1}
            textAlign="center"
          >
            Welcome Buildoor.
          </Heading>

          <Text color="bodyText" textAlign="center">
            Each buildoor is randomly generated and can be staked to receive
            <b> $EEMCS Token</b>. Use your <b> $EEMCS Token</b> to upgrade your
            buildoor and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      {pageItems && (
        <div>
          <div className={styles.gridNFT}>
            {pageItems.map((nft) => (
              <div key={nft.name}>
                <ul>{nft.name}</ul>
                <Image src={nft.image} height="100px" width="100px" alt="" />
              </div>
            ))}
          </div>
          <div>
            <Button colorScheme="teal" size="sm" onClick={prev}>
              Prev
            </Button>
            <Button colorScheme="teal" size="sm" onClick={next}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Button
        bgColor="accent"
        color="white"
        maxW="380px"
        onClick={handleClick}
        isLoading={isMinting}
      >
        <Text>mint buildoor</Text>
      </Button>
    </VStack>
  );
};

export default Connected;
