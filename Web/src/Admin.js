import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "./Header";
import { DataContext } from "./data-context";

const Admin = () => {
     const navigate = useNavigate();

     const [authenticated, setAuthenticated] = useState(true); // TODO: change me!!
     const [data, setData] = useState([]);
     const [editingShortCode, setEditingShortCode] = useState(null);
     const [newExpirationDate, setNewExpirationDate] = useState("");
     const [password, setPassword] = useState("qweqweqwe"); // TODO: change me!!
     const [searchTerm, setSearchTerm] = useState("");

     const {
          adminEnabled,
          apiURL
     } = useContext(DataContext);

     const editIconDataUri = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
</svg>`;

     const saveIconDataUri = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
  <polyline points="17 21 17 13 7 13 7 21" />
  <polyline points="7 3 7 8 15 8" />
</svg>`;

     const cancelIconDataUri = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>`;

     const cancelEdit = () => {
          setNewExpirationDate("");
          setEditingShortCode(null);
     }

     const editShortCodeExpiration = (shortCode) => {
          setEditingShortCode(shortCode);
     }

     const fetchShortyShorts = () => {
          fetch(`${apiURL}GetShortyShorts`, {
               method: 'GET',
               headers: {
                    'Content-Type': 'application/json',
                    'SS_AUTH': password
               },
          }).then((response) => {
               if (response.ok !== true) {
                    navigate('/');
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] !== "OK") {
                    alert(response[1]);
               } else {
                    setData(response[1]);
               }
          }).catch(() => {
               navigate('/');
          });
     }

     const formatDate = (unixSeconds) => {
          const date = new Date(Number(unixSeconds));

          return date.toLocaleString('en-US', {
               month: '2-digit',
               day: '2-digit',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
               hour12: false,
          });
     };

     const formatToLocalDateTime = (input) => {
          const ms = Number(input);

          if (isNaN(ms)) {
               return "Invalid timestamp";
          }

          const date = new Date(ms);

          if (isNaN(date.getTime())) {
               return "Invalid date";
          }

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');

          return `${year}-${month}-${day}T${hours}:${minutes}`;
     }

     const handleSubmit = (e) => {
          e.preventDefault();

          if (password === "") {
               alert("Please enter the password");
               return;
          }

          // Check if password is correct
          fetch(`${apiURL}AdminPasswordIsValid?Password=${password}`, {
               method: 'GET'
          }).then((response) => {
               if (response.ok !== true) {
                    navigate('/');
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] === "OK") {
                    setAuthenticated(true);
               } else if (typeof response[1] !== "undefined") {
                    alert(response[1]);
               } else {
                    alert("The password is not correct");
               }
          }).catch(() => {
               navigate('/');
          });
     };

     const navigateFunction = () => {
          navigate("/");
     }

     const saveEdit = (shortCode) => {
          const date = new Date(newExpirationDate);

          const epochTime = date.getTime();

          fetch(`${apiURL}UpdateShortyShort?ShortCode=${shortCode}&ExpirationMS=${epochTime}`, {
               method: 'GET',
               headers: {
                    'Content-Type': 'application/json',
                    'SS_AUTH': password
               },
          }).then((response) => {
               if (response.ok !== true) {
                    navigate('/');
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] !== "OK") {
                    alert(response[1]);
               } else {
                    setNewExpirationDate("");
                    setEditingShortCode(null);
                    fetchShortyShorts();
               }
          }).catch(() => {
               navigate('/');
          });
     }

     const toggleStatus = (shortCode, active) => {
          const confirmMessage = `Are you sure you want to ${active ? "active" : "deactivate"} this ShortyShort code ?`;

          const response = confirm(confirmMessage);

          if (!response) {
               return;
          }

          fetch(`${apiURL}UpdateShortyShort?ShortCode=${shortCode}&ActiveStatus=${active ? "true" : "false"}`, {
               method: 'GET',
               headers: {
                    'Content-Type': 'application/json',
                    'SS_AUTH': password
               },
          }).then((response) => {
               if (response.ok !== true) {
                    navigate('/');
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] !== "OK") {
                    alert(response[1]);
               } else {
                    fetchShortyShorts();
               }
          }).catch(() => {
               navigate('/');
          });
     }

     // Make sure user is allowed to access the admin
     useEffect(() => {
          if (!adminEnabled && process.env.NODE_ENV !== 'development') {
               navigate('/');
          }
     }, []);

     useEffect(() => {
          if (authenticated) {
               fetchShortyShorts();
          } else if (process.env.NODE_ENV === 'development') {
               setAuthenticated(true);
          }
     }, [authenticated]);

     if (!authenticated) {
          return (
               <>
                    <Header currentRoute="/admin" onNavigate={navigateFunction} />

                    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Admin Panel</h1>

                    <div
                         style={{
                              height: '80vh',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: '#e9ecef',
                              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                         }}
                    >
                         <div
                              style={{
                                   backgroundColor: '#fff',
                                   padding: '2.5rem 3rem',
                                   borderRadius: '12px',
                                   boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                   textAlign: 'center',
                                   width: '320px',
                              }}
                         >
                              <h2 style={{ marginBottom: '1.5rem', color: '#212529' }}>
                                   Enter the password to access the admin area
                              </h2>
                              <form onSubmit={handleSubmit}>
                                   <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        style={{
                                             width: '100%',
                                             padding: '0.6rem 0.8rem',
                                             fontSize: '1rem',
                                             borderRadius: '6px',
                                             border: '1.5px solid #ced4da',
                                             marginBottom: '1.5rem',
                                             outlineColor: '#495057',
                                             boxSizing: 'border-box',
                                        }}
                                        autoFocus
                                   />
                                   <button
                                        type="submit"
                                        style={{
                                             width: '100%',
                                             padding: '0.6rem 0',
                                             fontSize: '1.1rem',
                                             borderRadius: '6px',
                                             border: 'none',
                                             backgroundColor: '#007bff',
                                             color: '#fff',
                                             fontWeight: '600',
                                             cursor: 'pointer',
                                             transition: 'background-color 0.3s ease',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#007bff')}
                                   >
                                        Enter
                                   </button>
                              </form>
                         </div>
                    </div>
               </>
          );
     }

     const inputStyle = {
          width: '50%',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
     };

     const filteredData = data.filter(item => {
          const term = searchTerm.toLowerCase();
          const isActive = item.Active ? 'yes' : 'no';

          return (
               item.ShortCode.toLowerCase().includes(term) ||
               item.URL.toLowerCase().includes(term) ||
               isActive.includes(term)
          );
     });

     return (
          <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', boxSizing: 'border-box' }}>
               <Header currentRoute="/admin" onNavigate={navigateFunction} />

               {/* Search filter container */}
               <div style={{ maxWidth: '600px', margin: '1rem auto', padding: '0 1rem' }}>
                    <input
                         type="text"
                         placeholder="Search by shortcode, URL, or status (yes/no)"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              border: '1px solid #ccc',
                              fontSize: '1rem',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                         }}
                    />
               </div>

               <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Admin Panel</h1>

               <div
                    style={{
                         overflowY: 'auto',
                         display: 'flex',
                         flexDirection: 'column',
                         gap: '1.5rem',
                         alignItems: 'center',
                    }}
               >
                    {filteredData.map((item, index) => (
                         <div
                              key={index}
                              style={{
                                   position: 'relative',
                                   width: '100%',
                                   maxWidth: '600px',
                                   padding: '1.5rem',
                                   borderRadius: '12px',
                                   backgroundColor: '#ffffff',
                                   boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                   border: item.Active ? '5px solid #28a745' : '5px solid #dc3545',
                                   paddingBottom: '3rem',
                                   display: 'grid',
                                   gridTemplateColumns: '150px 1fr',
                                   rowGap: '1rem',
                                   columnGap: '1rem',
                                   alignItems: 'center',
                              }}
                         >
                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>Shortcode:</div>
                              <div>{item.ShortCode}</div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>Created On:</div>
                              <div>{formatDate(item.CreatedOn)}</div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>URL:</div>
                              <div style={{ maxWidth: '400px', overflowX: 'auto' }}>
                                   <a href={item.URL} style={{ color: '#007bff', whiteSpace: "nowrap", overflow: "scroll" }} target="_blank" rel="noopener noreferrer">
                                        {item.URL}
                                   </a>
                              </div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>Short URL:</div>
                              <div>
                                   <a href={item.ShortURL} style={{ color: '#007bff' }} target="_blank">
                                        {item.ShortURL}
                                   </a>
                              </div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>Expiration:</div>
                              <div>
                                   {item.ShortCode !== editingShortCode ? (
                                        <>
                                             {formatDate(item.Expiration)}
                                             <img
                                                  className="editIcon"
                                                  src={editIconDataUri}
                                                  alt="Edit"
                                                  onClick={() => editShortCodeExpiration(item.ShortCode)}
                                                  style={{ height: '19px', width: '19px', cursor: 'pointer', marginLeft: '9px', position: 'relative', top: '-3px', verticalAlign: 'middle' }}
                                             />
                                        </>
                                   ) : (
                                        <>
                                             <input
                                                  style={inputStyle}
                                                  type="datetime-local"
                                                  value={newExpirationDate !== "" ? newExpirationDate : formatToLocalDateTime(parseInt(item.Expiration, 10))}
                                                  onChange={(e) => setNewExpirationDate(e.target.value)}
                                                  placeholder=""
                                             />
                                             <img
                                                  src={saveIconDataUri}
                                                  alt="Save"
                                                  onClick={() => saveEdit(item.ShortCode)}
                                                  style={{ height: '25px', width: '25px', cursor: 'pointer', marginLeft: '10px', position: 'relative', top: '7px' }}
                                             />
                                             <img
                                                  src={cancelIconDataUri}
                                                  alt="Cancel"
                                                  onClick={cancelEdit}
                                                  style={{ height: '25px', width: '25px', cursor: 'pointer', marginLeft: '10px', position: 'relative', top: '7px' }}
                                             />
                                        </>
                                   )}
                              </div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>QR Code:</div>
                              <div>
                                   <img
                                        src={item.QRCode}
                                        alt="QR Code"
                                        style={{ width: '80px', height: '80px', marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                   />
                              </div>

                              <div style={{ textAlign: 'right', color: '#555', fontWeight: '600' }}>Active:</div>
                              <div>
                                   <span style={{ color: item.Active ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                        {item.Active ? 'Yes' : 'No'}
                                   </span>
                              </div>

                              {/* The button spans full width on the bottom right */}
                              <div style={{ gridColumn: '2 / 3', justifySelf: 'end' }}>
                                   {item.Active ? (
                                        <button
                                             style={{
                                                  backgroundColor: '#dc3545',
                                                  color: '#fff',
                                                  border: 'none',
                                                  padding: '0.5rem 1rem',
                                                  borderRadius: '6px',
                                                  cursor: 'pointer',
                                                  fontWeight: 'bold',
                                                  fontSize: '0.9rem',
                                                  boxShadow: '0 2px 6px rgba(220, 53, 69, 0.4)',
                                             }}
                                             onClick={() => toggleStatus(item.ShortCode, false)}
                                        >
                                             Deactivate
                                        </button>
                                   ) : (
                                        <button
                                             style={{
                                                  backgroundColor: '#27ae60',
                                                  color: '#fff',
                                                  border: 'none',
                                                  padding: '0.5rem 1rem',
                                                  borderRadius: '6px',
                                                  cursor: 'pointer',
                                                  fontWeight: 'bold',
                                                  fontSize: '0.9rem',
                                                  boxShadow: '0 2px 6px rgba(220, 53, 69, 0.4)',
                                             }}
                                             onClick={() => toggleStatus(item.ShortCode, true)}
                                        >
                                             Activate
                                        </button>
                                   )}
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     );
}

export default Admin;