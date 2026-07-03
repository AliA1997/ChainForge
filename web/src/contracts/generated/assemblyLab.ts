// AUTO-GENERATED from contracts/artifacts — do not edit. Recompile + re-export instead.
export const assemblyLabAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "codeSizeOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentChainId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "measureSloadGas",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gasUsed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "slot",
        "type": "uint256"
      }
    ],
    "name": "readSlot",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "result",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "readTransient",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "slot0Value",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "slot1Value",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transientRoundTrip",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "readBack",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const assemblyLabBytecode = "0x6080604052602a5f55600180546001600160a01b031916301790553480156024575f5ffd5b506101c0806100325f395ff3fe608060405234801561000f575f5ffd5b5060043610610085575f3560e01c80638fa35a4f116100585780638fa35a4f146100ce57806398a28780146100d6578063dd20b44c146100e9578063ee41230014610114575f5ffd5b806302ce8af31461008957806321434186146100ae5780636cbadbfa146100b657806377a4de76146100bc575b5f5ffd5b61009b610097366004610146565b5490565b6040519081526020015b60405180910390f35b61009b61011b565b4661009b565b61009b6100ca36600461015d565b3b90565b61009b5f5481565b61009b6100e4366004610146565b61013b565b6001546100fc906001600160a01b031681565b6040516001600160a01b0390911681526020016100a5565b5f5c61009b565b5f5f5f5a91505f5490505a820392505f198103610136575f92505b505090565b5f815f5d50505f5c90565b5f60208284031215610156575f5ffd5b5035919050565b5f6020828403121561016d575f5ffd5b81356001600160a01b0381168114610183575f5ffd5b939250505056fea264697066735822122053abac78b41f25455c6d05ae9ef729c114f3ccba87a38e321b5c546ab4a426fa64736f6c634300081c0033" as const;
