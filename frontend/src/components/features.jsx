import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: "fa-clipboard-list",
      title: "Precise Medication Identification",
      text: "Our AI accurately recognizes medications from handwritten prescriptions.",
      link: "/precise-medication",
    },
    {
      icon: "fa-pills",
      title: "Complete Information",
      text: "Get details about uses, side effects, dosage, and interactions.",
      link: "/complete-info",
    },
    {
      icon: "fa-bolt",
      title: "Instant Results",
      text: "Receive comprehensive prescription details within seconds.",
      link: "/instant-results",
    },
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">Features</h2>
        <div className="features-container">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index} className="feature-card">
              <div className="feature-icon">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
