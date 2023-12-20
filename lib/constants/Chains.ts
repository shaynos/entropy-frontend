import { Chain } from "viem";

export const Pegasus: Chain = {
    id: 1891,
    name: "Lightlink Pegasus Testnet",
    network: "Lightlink Pegasus Testnet",
    blockExplorers: {
        default: {
            name: "Pegasus Explorer",
            url: "https://pegasus.lightlink.io",
        },
    },
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://replicator-01.pegasus.lightlink.io/rpc/v1'],
        },
        public: {
            http: ['https://replicator-01.pegasus.lightlink.io/rpc/v1'],
        }
    }
}