import React, { useState } from 'react';
import './MlBased.css'; // Import the CSS file

//D:\Waste Management\Pakistan-Forest-Observatory\Pakistan-Forest-Observatory-main\Pakistan-Forest-Observatory-main\src\components\MlBased.css
const FilePicker = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleFileRemove = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  return (
    <div className="file-picker-container">
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="file-input"
      />
      <div className="file-list">
        {selectedFiles.length > 0 && <h3>Selected Files:</h3>}
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index} className="file-item">
              {file.name}
              <button className="remove-button" onClick={() => handleFileRemove(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FilePicker;
