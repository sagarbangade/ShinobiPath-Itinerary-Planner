// src/contexts/ItineraryDataContext.js
import React, { createContext, useState, useContext } from 'react';

const ItineraryDataContext = createContext();

export const useItineraryData = () => useContext(ItineraryDataContext);

export const ItineraryDataProvider = ({ children }) => {
    const [currentTravelPlans, setCurrentTravelPlans] = useState(null); // Or initialize with default value if needed

    const contextValue = {
        currentTravelPlans,
        setCurrentTravelPlans,
    };

    return (
        <ItineraryDataContext.Provider value={contextValue}>
            {children}
        </ItineraryDataContext.Provider>
    );
};