# KRWIN Cross-Chain Token

An upgradeable cross-chain token project powered by LayerZero.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

## 🏗️ Key Features

- Cross-chain Transfers: Send tokens across multiple chains using LayerZero
- Upgradeable: Uses OpenZeppelin's upgradeable contract pattern
- Fee Management: Flexible fee configuration via FeeManager
- Security Controls: Includes blacklist, freeze, and transfer limit modules

## 📁 Project Structure

```bash
├── contracts/         # Smart contracts
│   ├── KRWIN.sol      # Main token contract
│   ├── FeeManager.sol # Fee manager contract
│   ├── interfaces/    # Contract interfaces
│   ├── modules/       # Feature modules
│   └── types/         # Type definitions
├── tasks/             # Custom Hardhat tasks
│   ├── deploy/        # Deployment scripts
│   ├── ...
├── testOnChain/       # On-chain test files
└── utils/             # Helper utilities
```

## 🚀 Deployment

### Deploy

```bash
npm run deploy {networkName}
e.g. sepolia-testnet, ethereum-mainnet, etc...
```

### Layerzero peering

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```

## 📚 Documentation

- [LayerZero Docs](https://docs.layerzero.network/)
- [OFT Standard](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
- [OApp Standard](https://docs.layerzero.network/v2/concepts/applications/oapp-standard)

## 📄 License

MIT
