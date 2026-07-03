import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import {
  arbitrumSepolia,
  baseSepolia,
  hardhat,
  optimismSepolia,
  polygonAmoy,
  sepolia,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";

// One config factory shared by server (cookieToInitialState) and client
// (WagmiProvider). Cookie storage + ssr:true is wagmi's official Next.js
// App Router setup: connection state hydrates without a flash.
export function getConfig() {
  return createConfig({
    chains: [sepolia, polygonAmoy, baseSepolia, arbitrumSepolia, optimismSepolia, hardhat],
    connectors: [injected()],
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
    transports: {
      [sepolia.id]: http(),
      [polygonAmoy.id]: http(),
      [baseSepolia.id]: http(),
      [arbitrumSepolia.id]: http(),
      [optimismSepolia.id]: http(),
      [hardhat.id]: http(),
    },
  });
}

export type AppConfig = ReturnType<typeof getConfig>;

declare module "wagmi" {
  interface Register {
    config: AppConfig;
  }
}
