import React from 'react';
import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';

function RootLayout() {
  return (
    <div >
      <NavBar />
      <div style={{minHeight: "100vh"}}>
        <Outlet />
      </div>
      <div>
      <Footer/>
      </div>
      
    </div>
  );
}

export default RootLayout;
