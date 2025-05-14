import React, { useEffect, useRef } from 'react';

// Simple colored box component to replace SVG cards
const SimpleCardBox = ({ color = "#0ea5e9", label = "" }) => (
  <div 
    style={{
      width: "100px",
      height: "150px",
      backgroundColor: color,
      borderRadius: "8px",
      border: "2px solid #333",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
    }}
  >
    {label}
  </div>
);

export function DisplayCaseImageTest() {
  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-4">Enhanced Sports Cards</h2>
      
      {/* Simple Colored Boxes replacing SVG */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Simple Card Representations</h3>
        <div className="flex gap-4">
          <div>
            <p className="text-xs mb-1 text-center">Baseball Card</p>
            <SimpleCardBox color="#0ea5e9" label="Baseball" />
          </div>
          
          <div>
            <p className="text-xs mb-1 text-center">Football Card</p>
            <SimpleCardBox color="#dc2626" label="Football" />
          </div>
          
          <div>
            <p className="text-xs mb-1 text-center">Basketball Card</p>
            <SimpleCardBox color="#16a34a" label="Basketball" />
          </div>
        </div>
      </div>
      
      {/* CSS-only Cards */}
      <div>
        <h3 className="text-md font-semibold mb-2">CSS-only Cards</h3>
        <div className="flex gap-4">
          <div className="w-[100px] h-[150px] rounded-lg border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-semibold">Card 1</span>
          </div>
          
          <div className="w-[100px] h-[150px] rounded-lg border-2 border-red-500 bg-red-100 flex items-center justify-center">
            <span className="text-red-700 font-semibold">Card 2</span>
          </div>
          
          <div className="w-[100px] h-[150px] rounded-lg border-2 border-green-500 bg-green-100 flex items-center justify-center">
            <span className="text-green-700 font-semibold">Card 3</span>
          </div>
        </div>
      </div>
    </div>
  );
} 