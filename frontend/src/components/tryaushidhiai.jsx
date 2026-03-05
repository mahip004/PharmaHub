import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
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
        <h2 className="section-title">Try PharmaHub</h2>
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
export default TryAushadhiAI;
