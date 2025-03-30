import "./index.css";

import Header from "./components/Header";
import BentoGrids from "./components/BentoGrid";
import Footer from "./components/Footer";
import AboutMe from "./components/AboutMe";
import SocialNetworks from "./components/SocialNetworks";


export function App() {
  return (
    <div className="absolute inset-x-0 top-0 bg-white">
      <Header />
      <BentoGrids />
      <AboutMe />
      {/* <SocialNetworks /> */}
      <Footer />
    </div>
  );
}

export default App;
