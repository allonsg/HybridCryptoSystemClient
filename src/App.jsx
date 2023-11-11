import CryptoJS from "crypto-js";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { JSEncrypt } from "jsencrypt";

const BASE_URL = "https://hybridcryptosystemapi.azurewebsites.net/api/main/";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    void fetchAndSetPublicKey();
  }, []);

  const fetchAndSetPublicKey = async () => {
    try {

      const { data } = await axios.get(BASE_URL + "key");

      setPublicKey(data);
    } catch (e) {

      if (e instanceof AxiosError) {
        console.error(e.response?.data.message);
        return;
      }
      console.error(e);
    }
  };


  const asymmetricEncrypt = (symmetricKey) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(symmetricKey);
  };

  function encryptText(key, iv, plainText) {
    let keyBytes = CryptoJS.enc.Utf8.parse(key);
    let ivBytes = CryptoJS.enc.Utf8.parse(iv);

    let encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  }

  const postData = async (args) => {
    try {
      const { data } = await axios.post(BASE_URL + "decrypt", args);

      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.error(e.response?.data.message);
        return;
      }
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const iv = CryptoJS.lib.WordArray.random(8).toString();
    const symmetricKey = CryptoJS.lib.WordArray.random(16).toString();
    const encryptedMessage = encryptText(symmetricKey, iv, inputValue);
    const encryptedSymmetricKey = asymmetricEncrypt(symmetricKey);
    const encryptedIv = asymmetricEncrypt(iv);

    setInputValue("");

    const jsonData = `
    \`\`\`
    ${JSON.stringify({ iv: encryptedIv, key: encryptedSymmetricKey, text: encryptedMessage }, null, 2)}
    \`\`\`
    `;


    const data = await postData({ iv: encryptedIv, key: encryptedSymmetricKey, text: encryptedMessage });

    console.log({ data });
    setData(jsonData);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">

      <form className="flex flex-col gap-4 w-full min-h-screen bg-blue-200 p-5" onSubmit={handleSubmit}>
        <label htmlFor="message">Input message</label>
        <textarea id="message" placeholder="Enter your message to encrypt" className="border-2 border-black"
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      if (event.shiftKey) {
                        return;
                      }
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  value={inputValue} onChange={e => setInputValue(e.target.value)} />


        <label htmlFor="publicKey">Public Key</label>
        <input type="text" id="publicKey" value={publicKey} disabled onChange={e => setPublicKey(e.target.value)} />

        <button type="submit">Submit</button>

        {data.length > 0 && <pre className="whitespace-pre-line break-all">
        <code>
          {data}
        </code>
      </pre>}

        <button onClick={() => setData("")} className="rounded-[4px] border border-black p-2" type="button">Reset
        </button>
      </form>

    </div>
  );
}

export default App;
