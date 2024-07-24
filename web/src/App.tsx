import logo from "./assets/logo.png";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [metaData, setMetaData] = useState({
    name: "",
    symbol: "",
    decimals: "",
    logoURI: "",
    contract: "",
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  async function fetchMetadata() {
    const response = await fetch(
      "https://turquoise-important-monkey-585.mypinata.cloud/ipfs/QmTXavXN3c6UUnnVJ8ADC1rwRgnojGz8SjsQRooEvs9Smj"
    );
    const metadata = await response.json();
    setMetaData(metadata);
    console.log(metaData);
  }

  return (
    <div className="mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-72 justify-center mb-32">
      <div className="border border-theme-pan-navy rounded-sm py-8 m-auto text-center w-1/2">
        <div className="justify-center flex">
          <img src={logo} className="h-32 w-32" alt="logo" />
        </div>
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold">East India Onchain Company</h1>
          <p className="text-lg">A Crypto Guild</p>
           <div className="pt-2 mt-2 border-t border-theme-pan-navy w-1/2 justify-center text-center m-auto">   
            <p>Token: <span className="font-semibold">${metaData.symbol}</span></p>
            <a target="_blank" className="text-theme-pan-sky font-semibold hover:opacity-80" href={"https://basescan.org/token/" + metaData.contract}>
              Contract
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
