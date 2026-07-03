// AUTO-GENERATED from contracts/artifacts — do not edit. Recompile + re-export instead.
export const tipJarAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    "inputs": [],
    "name": "NothingToWithdraw",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Reentrancy",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WithdrawFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroTip",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "Tipped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
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
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "tip",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalReceived",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "totalTippedBy",
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
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;

export const tipJarBytecode = "0x60a06040526001600255348015610014575f5ffd5b5060405161059d38038061059d83398101604081905261003391610044565b6001600160a01b0316608052610071565b5f60208284031215610054575f5ffd5b81516001600160a01b038116811461006a575f5ffd5b9392505050565b6080516104ff61009e5f395f8181610141015281816101ae0152818161023d01526102a101526104ff5ff3fe60806040526004361061004c575f3560e01c80633ccfd60b146100dc5780634145b976146100f25780638da5cb5b14610130578063a3c2c4621461017b578063cb56393c14610190575f5ffd5b366100d857335f908152602081905260408120805434929061006f9084906103d4565b925050819055503460015f82825461008791906103d4565b909155505060405133907f4f629a5f1c8e7fc616770a8d34896b447f3457037c40a23347478746309d73c2906100ce903481526040602082018190525f9082015260600190565b60405180910390a2005b5f5ffd5b3480156100e7575f5ffd5b506100f06101a3565b005b3480156100fd575f5ffd5b5061011d61010c3660046103f9565b5f6020819052908152604090205481565b6040519081526020015b60405180910390f35b34801561013b575f5ffd5b506101637f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b039091168152602001610127565b348015610186575f5ffd5b5061011d60015481565b6100f061019e366004610426565b610337565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146101f25760405163245aecd360e01b815233600482015260240160405180910390fd5b6002546002036102155760405163558a1e0360e11b815260040160405180910390fd5b60028055475f81900361023b57604051630686827b60e51b815260040160405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03167f7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d58260405161029691815260200190565b60405180910390a25f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316826040515f6040518083038185875af1925050503d805f8114610307576040519150601f19603f3d011682016040523d82523d5f602084013e61030c565b606091505b505090508061032e57604051631d42c86760e21b815260040160405180910390fd5b50506001600255565b345f036103575760405163659d0bd560e01b815260040160405180910390fd5b335f90815260208190526040812080543492906103759084906103d4565b925050819055503460015f82825461038d91906103d4565b909155505060405133907f4f629a5f1c8e7fc616770a8d34896b447f3457037c40a23347478746309d73c2906103c890349086908690610494565b60405180910390a25050565b808201808211156103f357634e487b7160e01b5f52601160045260245ffd5b92915050565b5f60208284031215610409575f5ffd5b81356001600160a01b038116811461041f575f5ffd5b9392505050565b5f5f60208385031215610437575f5ffd5b823567ffffffffffffffff81111561044d575f5ffd5b8301601f8101851361045d575f5ffd5b803567ffffffffffffffff811115610473575f5ffd5b856020828401011115610484575f5ffd5b6020919091019590945092505050565b83815260406020820152816040820152818360608301375f818301606090810191909152601f909201601f191601019291505056fea26469706673582212205ddcb45e6c797c9beb8959dd7f70469bb2ee009532eb71ba760161f2772ccd2764736f6c634300081c0033" as const;
