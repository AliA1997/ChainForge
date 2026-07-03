// AUTO-GENERATED from contracts/artifacts — do not edit. Recompile + re-export instead.
export const counterAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CannotGoNegative",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "NotOwner",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "previousValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "CounterChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "decrement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
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
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "setValue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "value",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const counterBytecode = "0x6080604052348015600e575f5ffd5b506040516102d33803806102d3833981016040819052602b91604f565b600180546001600160a01b0319166001600160a01b0392909216919091179055607a565b5f60208284031215605e575f5ffd5b81516001600160a01b03811681146073575f5ffd5b9392505050565b61024c806100875f395ff3fe608060405234801561000f575f5ffd5b5060043610610055575f3560e01c80632baeceb7146100595780633fa4f24514610063578063552410771461007e5780638da5cb5b14610091578063d09de08a146100bc575b5f5ffd5b6100616100c4565b005b61006b5f5481565b6040519081526020015b60405180910390f35b61006161008c3660046101bf565b61013b565b6001546100a4906001600160a01b031681565b6040516001600160a01b039091168152602001610075565b6100616101b2565b5f8054908190036100e857604051639bec8c8360e01b815260040160405180910390fd5b6100f36001826101ea565b5f81905560405133917f1ace75152d2bb24606b8f7d9368e1c8dbb04aa0cd6ff2860bc0f2eb5ead9a4639161013091858252602082015260400190565b60405180910390a250565b6001546001600160a01b0316331461016c5760405163245aecd360e01b815233600482015260240160405180910390fd5b5f805490829055604080518281526020810184905233917f1ace75152d2bb24606b8f7d9368e1c8dbb04aa0cd6ff2860bc0f2eb5ead9a463910160405180910390a25050565b5f546100f3816001610203565b5f602082840312156101cf575f5ffd5b5035919050565b634e487b7160e01b5f52601160045260245ffd5b818103818111156101fd576101fd6101d6565b92915050565b808201808211156101fd576101fd6101d656fea2646970667358221220b8e41a3bfe4b4c206b708077c9354958d64fd5439cc1c5f9d4f0a29d1355ff4964736f6c634300081c0033" as const;
