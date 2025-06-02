"use client"
import React, { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.title = "ParkMaster - Smart Parking & Vehicle Management";
  }, []);
  
  return (
    <div className="min-h-screen">
     Landing
    </div>
  );
};

export default Index;