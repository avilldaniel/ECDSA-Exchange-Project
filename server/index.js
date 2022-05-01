const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

// digital signage imports
const EC = require("elliptic").ec;
const SHA256 = require("crypto-js/sha256");
const ec = new EC("secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// public keys; generated using ec.genKeyPair()
const balances = {
  "04a6ed9564348a4944c8fdb796f48aad05ac35bb3768466df5b89de23cd96063b7c37226bfe79d5716aceaec0803805ed48c29cbb4c506d7ac3b47af6d66405e77": 100,
  "0460e724900fb4a3b19da891da386ad398583323266e263c980111b364f168b2e6b64f9b6a7b9fc9111ea94662e5ea0420292f7862d7a81094654b481af417f636": 50,
  "04099a51a520636de38a9aa24769efdd06051d75a5066110ecac71a0d475b7a98b6634e53a4b1a8b33b2d4a460e7e149b12a38ad2c182bde5ceb0807a316f992c6": 75,
};

/*
private keys paired with public keys from above, respectively:
  9cd1224577a39c47b5a1a112d1c8ac2b0fa2c0293627f45996e74ab6bd796ca3
  af0ddcc7342f9a4e9a07bb0ad71f6b0a1e83d623064f8ddbd3b4ee958d7e795d
  5c5754db122b172a44e2526a43188867df65380f7db937575b32fe10aa2fb73c
*/

// postman: http://localhost:3042/balance/:balances[i]
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

// postman: http://localhost:3042/send //body: { "sender": privateKey, "recipient": publicKey, "amount": n }
app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

// SIGN DIGITAL SIGNATURE HERE

  const privateKey = ec.keyFromPrivate(sender);

  const message = "I'm a valid private addy!";
  const msgHash = SHA256(message).toString();
  const signature = privateKey.sign(msgHash); // use private key to generate signature

  const sig = {
    r: signature.r.toString(16),
    s: signature.s.toString(16),
  };

// VERIFY DIGITAL SIGNATURE HERE
  
  // iterate thru balances object, verify digital signature on each iteration
  for (const key in balances) {
    const publicKey = ec.keyFromPublic(key, "hex");

    // if digital signature is valid, proceed with transaction
    if (publicKey.verify(msgHash, sig)) {
      balances[publicKey.getPublic().encode("hex")] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[publicKey.getPublic().encode("hex")] });
      console.log("payment transfer is successful!")
      break; // out of For Loop
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});