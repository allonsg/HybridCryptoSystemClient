import CryptoJS from "crypto-js";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { JSEncrypt } from "jsencrypt";
import { copyToClipboard } from "./lib/copyToClipboars.js";


const PUBLIC_KEY = "MIIBCgKCAQEAvdjfVGRo6qK5Ybr92av6xgIsf26aagpGKtRxJN+iS/077l6iJl2Jpz5T+jXrZbtdNNz73oQD/0FoQsFf9gfbxenVpFYMS02TZpqhg6ibdMMC7bORv9SMVaAEfrm3BotoEV9B5LOLl4WnAf9/kMepA1RpMl2NQRjaiqtvhPQTIfedWqaZoYzOyHVEUGuYJEuw0CDabMAON7YMU1wyA2miXpMGt84qsH1i58uJQdNDfho2B9J+yZ06A/N9qkHFTz5ADRxNGjT29krMLEGJ6bajR8e6XB6+8bsmznUL9V5hFQbyznKo3E9FWmvKRre0yS/hV078XA6PLqvUnL4e+GrinQIDAQAB"

function App() {
  const [inputValue, setInputValue] = useState("");
  // const [publicKey, setPublicKey] = useState(TOTAL_PUBLIC_KEY)

  // useEffect(() => {
  //   void fetchAndSetPublicKey();
  // }, []);
  //
  // const fetchAndSetPublicKey = async () => {
  //   try {
  //
  //     const { data } = await axios.get("https://vladKRASAVA.com/api/public-key");
  //
  //     setPublicKey(data.key);
  //   } catch (e) {
  //
  //     if(e instanceof AxiosError){
  //       console.error(e.response?.data.message);
  //       return
  //     }
  //     console.error(e);
  //   }
  // };


  const asymmetricEncrypt = (symmetricKey) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(PUBLIC_KEY);
    return encrypt.encrypt(symmetricKey);
  };

  function encryptText(key, iv, plainText) {
    let keyBytes = CryptoJS.enc.Utf8.parse(key);
    let ivBytes = CryptoJS.enc.Utf8.parse(iv);

    let encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  const handleSubmit = async (e) => {

    e.preventDefault();

    const iv = CryptoJS.lib.WordArray.random(8).toString();
    const symmetricKey = CryptoJS.lib.WordArray.random(16).toString();
    const encryptedMessage = encryptText(symmetricKey, iv, inputValue);
    const encryptedSymmetricKey = asymmetricEncrypt(symmetricKey);
    const encryptedIv = asymmetricEncrypt(iv);

    setInputValue("")

    const jsonData = `
    \`\`\`
    ${JSON.stringify({ iv:encryptedIv, key:encryptedSymmetricKey, text:encryptedMessage }, null, 2)}
    \`\`\`
    `;

    copyToClipboard(jsonData);
    console.log(symmetricKey, iv);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">

      <form className="flex flex-col gap-[10px]  w-[500px] min-h-[500px] bg-teal-300" onSubmit={handleSubmit}>
        <label htmlFor="message">Input message</label>
        <textarea id="message" className="border-2 outline-none border-black" value={inputValue}
                  onChange={e => setInputValue(e.target.value)} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
