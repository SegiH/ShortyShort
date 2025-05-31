import React, { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { DataContext } from "./data-context";

const ShortPath = () => {
     const params = useParams();
     const navigate = useNavigate();

     const {
          apiURL
     } = useContext(DataContext);

     useEffect(() => {
          if (typeof params.shortcode === "undefined") {
               navigate('/');
          } else {
               fetch(`${apiURL}GetShortyShort?ShortCode=${params.shortcode}`, {
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
                         if (response[1] === null || response[1] === "") {
                              alert("The URL is not set!");
                              return;
                         } else {
                              window.location.href = response[1];
                         }
                    }
               }).catch(() => {
                    alert("An error occurred calling /CreateShortyShort");
               });
          }
     }, []);

     return (
          <></>
     );
}

export default ShortPath;