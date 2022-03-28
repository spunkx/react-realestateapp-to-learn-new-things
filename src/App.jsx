import React from "react";
import {Routes, Route, BrowserRouter} from "react-router-dom";
import Dashboard from './dashboard';

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />}>
        </Route>
      </Routes>
    </BrowserRouter>

  );
}