import { useState } from "react";
import { Link } from "react-router-dom";
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
            <span className="devanagari">औषधि</span>AI
          </h1>
          <h2 className="tagline">
            Decoding Prescriptions. Empowering Patients.
          </h2>
          <button className="cta-button" onClick={scrollToAppSection}>
            Try AushadhiAI Now
          </button>
        </div>
        <div className="hero-image">
          <img
            src="assets/hero-image.svg"
            alt="Prescription being scanned"
            className="hero-img"
          />
        </div>
      </div>
    </header>
  );
};

const Navigation = () => {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <Link to="/timetable">Timetable</Link>
        </li>
        <li>
          <Link to="/feedbackform">Feedback</Link>
        </li>
      </ul>
    </nav>
  );
};

const Features = () => {
  const features = [
    {
      icon: "fa-clipboard-list",
      title: "Precise Medication Identification",
      text: "Our AI accurately recognizes medications from handwritten prescriptions.",
    },
    {
      icon: "fa-pills",
      title: "Complete Information",
      text: "Get details about uses, side effects, dosage, and interactions.",
    },
    {
      icon: "fa-bolt",
      title: "Instant Results",
      text: "Receive comprehensive prescription details within seconds.",
    },
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">Features</h2>
        <div className="features-container">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: "fa-upload",
      title: "Upload Your Prescription",
      text: "Take a photo or upload an image of your prescription.",
    },
    {
      icon: "fa-brain",
      title: "AI Analysis",
      text: "Our AI processes and decodes the handwriting using neural networks.",
    },
    {
      icon: "fa-check-circle",
      title: "Receive Clear Information",
      text: "Get detailed, easy-to-understand medication information.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TryAushadhiAI = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <section id="app-section" className="app-section">
      <div className="container">
        <h2 className="section-title">Try AushadhiAI</h2>
        <div className="app-container">
          <div className="upload-container">
            <h3>Upload Your Prescription</h3>
            <div
              className="upload-area"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {!file ? (
                <div className="upload-prompt">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>
                    Drag and drop your prescription image here or click to
                    upload
                  </p>
                  <p className="small-text">
                    Supports JPG, PNG, and HEIC formats
                  </p>
                </div>
              ) : (
                <div className="preview-container">
                  <img src={file} alt="Prescription Preview" />
                  <button className="remove-button" onClick={removeFile}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className="upload-actions">
              <button className="upload-button">Analyze Prescription</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Ready to decode your prescription?</h2>
          <p>
            Our AI-powered tool helps you understand your medication details.
          </p>
          <button
            className="cta-button"
            onClick={() =>
              document
                .getElementById("app-section")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Try AushadhiAI Now
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          "Bringing the ancient wisdom of Aushadhi (medicine) together with
          modern artificial intelligence"
        </p>
      </div>
    </footer>
  );
};
const Home = () => {
  return (
    <div>
      <Header />
      <Navigation />
      <Features />
      <HowItWorks />
      <TryAushadhiAI />
      <CTASection />
      <Footer />
    </div>
  );
};
export default Home;
