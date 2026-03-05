import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
const Header = () => {
  const scrollToAppSection = () => {
    document
      .getElementById("app-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="logo">
            <span className="devanagari">PharmaHub</span>
          </h1>
          <h2 className="tagline">
          Prescription Clarity, Patient Power!
          </h2>
          <button className="cta-button" onClick={scrollToAppSection}>
            Try PharmaHub Now
          </button>
        </div>
        <div className="hero-image">
          <img
            src="/hero-image.svg"
            alt="Prescription being scanned"
            className="hero-img"
          />
        </div>
      </div>
    </header>
  );
};
export default Header;
