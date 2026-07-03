// AUTO-GENERATED from contracts/artifacts — do not edit. Recompile + re-export instead.
export const delegateLogicAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "writer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "NumberSet",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "lastWriter",
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
    "inputs": [],
    "name": "number",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newNumber",
        "type": "uint256"
      }
    ],
    "name": "setNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const delegateLogicBytecode = "0x6080604052348015600e575f5ffd5b5061012d8061001c5f395ff3fe6080604052348015600e575f5ffd5b5060043610603a575f3560e01c80633fb5c1cb14603e578063670d586414604f5780638381f58a14607e575b5f5ffd5b604d604936600460e1565b6092565b005b6001546061906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b60855f5481565b6040519081526020016075565b5f819055600180546001600160a01b031916339081179091556040518281527fdf1b3bea69f5a320d08715bed3eaa0ac393a2ecb2b5dca3f8c3c5f8ec8f575e49060200160405180910390a250565b5f6020828403121560f0575f5ffd5b503591905056fea26469706673582212207a06be0cbd210e8a17f0333e500fdba2be576f6b076c3dd5fb61191b6bd22d9c64736f6c634300081c0033" as const;
