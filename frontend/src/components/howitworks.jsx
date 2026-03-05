import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
const HowItWorks = () => {
  const steps = [
    {
      icon: "fa-upload",
      title: "See the timetable, book an appointment.",
      text: "Timetable of the doctor and option to prebook your appointment.",
    },
    {
      icon: "fa-brain",
      title: "Upload the prescription, get the info!",
      text: "Get information about the medicines on your prescription. Patient Power.",
    },
    {
      icon: "fa-check-circle",
      title: "Auto book the medicines.",
      text: "Medicines will get auto booked vis your prescription.",
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
export default HowItWorks;
