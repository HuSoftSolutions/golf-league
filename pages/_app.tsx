import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React, { useEffect } from "react";
import Modal from "react-modal";
import { ProvideAuth } from "../hooks/useAuth";
// import Navbar from "../components/navbar";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Find the main content element, in this case, the element with id '__next'
    const appElement = document.getElementById("__next");

    // Set the app element for react-modal
    if (appElement) {
      Modal.setAppElement(appElement);
    }
  }, []);
  return (
    <ProvideAuth>

        <Component {...pageProps} />
    </ProvideAuth>
  );
}

export default App;
