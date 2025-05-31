import React from "react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import Header from "./Header";
import { DataContext } from "./data-context";

const CreateShortPath = () => {
     const [newURL, setNewURL] = useState("");
     const [newExpiration, setNewExpiration] = useState(-1);
     const [newShortyShortURL, setShortyShortURL] = useState("");
     const [newShortyShortQRCode, setShortyShortQRCode] = useState("");

     const {
          apiURL,
          setIsError
     } = useContext(DataContext);

     const navigate = useNavigate();

     const shortCodeExpirationOptions = {
          "1 day": 1,
          "3 days": 3,
          "1 week": 7,
          "2 weeks": 14,
          "1 month": 30,
          "6 months": 180
     }

     const createShortPath = async () => {
          if (newURL === "") {
               alert("Please enter the URL");
               return;
          }

          if (newExpiration === -1) {
               alert("Please select the expiration");
               return;
          }

          if (!isValidURL(newURL)) {
               alert(`${newURL} does not appear to be a valid URL!`);
               return;
          }

          await fetch(`${apiURL}CreateShortyShort?URL=${newURL}&Expiration=${newExpiration}`, {
               method: 'GET'
          }).then((response) => {
               if (response.ok !== true) {
                    alert(`HTTP error! status: ${response.status}`);
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] !== "OK") {
                    alert(response[1]);
               } else {
                    setShortyShortURL(response[1]);
                    setShortyShortQRCode(response[2]);
               }
          }).catch(() => {
               alert("An error occurred calling /CreateShortyShort");
          });
     }

     const isValidURL = str => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(str);

     const navigateFunction = () => {
          navigate("/admin");
     }

     const startOver = () => {
          setIsError(false);
          setNewURL("");
          setNewExpiration(-1);
          setShortyShortURL("");
          setShortyShortQRCode("");
     }

     const containerStyle = {
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
          boxSizing: 'border-box',
     };

     const formContainerStyle = {
          backgroundColor: 'white',
          maxWidth: '600px',
          margin: '2rem auto',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
     };

     const labelStyle = {
          display: 'block',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#444',
     };

     const inputStyle = {
          width: '100%',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
     };

     const buttonStyle = {
          backgroundColor: '#2980b9',
          color: 'white',
          padding: '0.75rem 1.5rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'block',
          margin: '0 auto',
          width: 'fit-content'
     };

     return (
          <div style={containerStyle}>
               <Header currentRoute="/" onNavigate={navigateFunction} />

               <form
                    style={formContainerStyle}
                    onSubmit={(e) => {
                         e.preventDefault();
                         createShortPath();
                    }}
               >
                    <h2 style={{ marginBottom: '1rem', color: '#333' }}>Create Shorty Short</h2>

                    <label htmlFor="newUrlInput" style={labelStyle}>
                         URL
                    </label>
                    <input
                         id="newUrlInput"
                         style={inputStyle}
                         value={newURL}
                         disabled={newShortyShortURL !== ''}
                         onChange={(e) => setNewURL(e.target.value)}
                         placeholder="Enter URL to shorten"
                    />

                    <label htmlFor="expirationSelect" style={labelStyle}>
                         Expires In
                    </label>
                    <select
                         id="expirationSelect"
                         style={{ ...inputStyle, padding: '0.5rem' }}
                         value={newExpiration}
                         onChange={(e) => setNewExpiration(e.target.value)}
                    >
                         <option value={-1}>Please select</option>
                         {Object.keys(shortCodeExpirationOptions).map((option, idx) => (
                              <option key={idx} value={shortCodeExpirationOptions[option]}>
                                   {option}
                              </option>
                         ))}
                    </select>

                    {newShortyShortURL === '' ? (
                         <button type="submit" style={buttonStyle}>
                              Submit
                         </button>
                    ) : (
                         <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                              <strong>Your new Shorty Short URL is</strong>
                              <br />
                              <br />
                              <a href={newShortyShortURL} target="_blank" rel="noopener noreferrer" style={{ color: '#2980b9' }}>
                                   {newShortyShortURL}
                              </a>

                              {newShortyShortQRCode !== '' && (
                                   <>
                                        <br />
                                        <br />
                                        <img src={newShortyShortQRCode} alt="QR Code" style={{ margin: '0 auto', display: 'block' }} />
                                   </>
                              )}

                              <div style={{ textAlign: 'center' }}>
                                   <button style={{ ...buttonStyle, marginTop: '1rem' }} onClick={startOver}>
                                        Start Over
                                   </button>
                              </div>
                         </div>
                    )}
               </form>
          </div>
     );
}

export default CreateShortPath;