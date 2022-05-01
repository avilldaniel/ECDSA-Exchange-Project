const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

const key = ec.genKeyPair();

const publicKey = key.getPublic().encode('hex');

console.log({
  privateKey: key.getPrivate().toString(16),
  publicKey: publicKey
});