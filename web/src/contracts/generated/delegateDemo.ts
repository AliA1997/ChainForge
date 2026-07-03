// AUTO-GENERATED from contracts/artifacts — do not edit. Recompile + re-export instead.
export const delegateDemoAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "logic_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DelegatecallFailed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "DelegatedWrite",
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
    "name": "logic",
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
    "name": "setNumberViaCall",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "setNumberViaDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const delegateDemoBytecode = "0x60a0604052348015600e575f5ffd5b5060405161035e38038061035e833981016040819052602b91603b565b6001600160a01b03166080526066565b5f60208284031215604a575f5ffd5b81516001600160a01b0381168114605f575f5ffd5b9392505050565b6080516102d461008a5f395f818160cc0152818160f1015261020f01526102d45ff3fe608060405234801561000f575f5ffd5b5060043610610055575f3560e01c806356e525ed14610059578063670d58641461006e5780638381f58a1461009e578063b842ba67146100b4578063d7dfa0dd146100c7575b5f5ffd5b61006c610067366004610271565b6100ee565b005b600154610081906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100a65f5481565b604051908152602001610095565b61006c6100c2366004610271565b6101f9565b6100817f000000000000000000000000000000000000000000000000000000000000000081565b5f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168260405160240161012c91815260200190565b60408051601f198184030181529181526020820180516001600160e01b0316633fb5c1cb60e01b179052516101619190610288565b5f60405180830381855af49150503d805f8114610199576040519150601f19603f3d011682016040523d82523d5f602084013e61019e565b606091505b50509050806101c0576040516341af4c7f60e11b815260040160405180910390fd5b60405182815233907fcaa38e1837259e65baee864be2b22ffc6d148610e74709ca42e8cb5e50025bf59060200160405180910390a25050565b604051633fb5c1cb60e01b8152600481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690633fb5c1cb906024015f604051808303815f87803b158015610258575f5ffd5b505af115801561026a573d5f5f3e3d5ffd5b5050505050565b5f60208284031215610281575f5ffd5b5035919050565b5f82518060208501845e5f92019182525091905056fea26469706673582212206e84b05cb97af96d0e225e65289ac90929948c1ac9f56a1e385964c44ef4577c64736f6c634300081c0033" as const;
