import React, { useContext } from "react";
import { Navigate } from 'react-router-dom';
import Admin from "./Admin";
import ShortPath from "./ShortPath";
import CreateShortPath from "./CreateShortPath";
import { DataContext } from "./data-context";

import {
     BrowserRouter,
     Routes,
     Route
} from "react-router-dom";

import './App.css';

const App = () => {
     const {
          adminEnabled,
          adminEnabledCheckComplete,
          isError
     } = useContext(DataContext);

     return (
          <>
               {adminEnabledCheckComplete && !isError &&
                    <BrowserRouter>
                         <Routes>
                              <Route path="/" element={<CreateShortPath />} />

                              <Route path="/short/:shortcode?" element={<ShortPath />} />

                              <Route path="/admin" element={adminEnabled ? <Admin /> : <Navigate to="/" replace />} />
                         </Routes>
                    </BrowserRouter>
               }

               {isError &&
                    <>An error occurred</>
               }
          </>
     );
}

export default App;