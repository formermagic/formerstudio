import { AppProps } from "next/app";
import "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/themes/prism.css";
import "../styles/global.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
