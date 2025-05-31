import React, { createContext, useEffect, useState } from "react";

const DataContext = createContext({});

const DataProvider = ({
     children
}) => {
     const [adminEnabled, setAdminEnabled] = useState(false);
     const [adminEnabledCheckComplete, setAdminEnabledCheckComplete] = useState(false);
     const [apiURL, setAPIURL] = useState("");
     const [isError, setIsError] = useState(false);

     const routes = [
          {
               Name: "Create",
               DisplayName: "Create",
               Path: "/",
               BackgroundColor: "#2980b9",
          },
          {
               Name: "Admin",
               DisplayName: "Admin",
               Path: "/admin",
               BackgroundColor: "#2980b9",
          }
     ];

     useEffect(() => {
          let newApiURL = process.env.REACT_APP_APIURL;

          if (typeof newApiURL === "undefined" || newApiURL === null || newApiURL === "") {

          }

          if (newApiURL.slice(-1) !== "/") {
               newApiURL += "/";
          }

          setAPIURL(newApiURL);

          fetch(`${newApiURL}Test`, {
               method: 'GET'
          }).then((response) => {
               if (response.ok !== true) {
                    alert(`HTTP error! status: ${response.status}`);
               } else {
                    return response.json();
               }
          }).then(response => {
               if (response[0] === "OK") {
                    setAdminEnabled(true);
               }

               setAdminEnabledCheckComplete(true);
          }).catch(() => {
               alert("An error occurred calling /Test");
          });
     }, []);

     const dataContextProps = {
          adminEnabled,
          adminEnabledCheckComplete,
          apiURL,
          isError,
          routes,
          setIsError
     }

     return (
          <DataContext.Provider value={dataContextProps}>{children}</DataContext.Provider>
     )
}

export { DataContext, DataProvider };