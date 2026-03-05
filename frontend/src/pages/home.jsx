import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Features from "../components/features";
import HowItWorks from "../components/howitworks";
import TryAushadhiAI from "../components/tryaushidhiai";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
const Home = () => {
  return (
    <div className="home-page">
      <Sidebar />
      <main className="home-main">
        <Header />
        <Features />
        <HowItWorks />
      </main>
    </div>
  );
};

export default Home;
