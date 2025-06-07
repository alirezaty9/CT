import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const FormDataContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    initialParameters: {
      power: "",
      tubeVoltage: "",
      anodeCurrent: "",
      anodeCurrentUnit: "mA",
      filtrationMaterial: "Al",
      filtrationThickness: "",
      bitDepth: "8-bit",
      tubeStatus: false,
      tubeVoltageDisplay: "0",
      tubeCurrentDisplay: "0",
      exposureTime: "0",
      manipulatorX: "",
      manipulatorY: "",
      manipulatorZ: "",
      manipulatorTheta: "",
      manipulatorGamma: "",
      joystickSpeed: "Medium",
      cabinCameraStatus: false,
    },
    positionAndOptimization: {},
    postProcessing: {},
    reconstruction: {},
    projectionAcquisition: {},
  });

  // Store scroll position before updates
  const scrollPositionRef = useRef(0);
  const updateTimeoutRef = useRef(null);

  const updateFormData = useCallback((page, data) => {
    // Save current scroll position
    scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Update immediately for UI responsiveness
    setFormData((prev) => ({
      ...prev,
      [page]: data,
    }));
    
    // Restore scroll position after state update
    updateTimeoutRef.current = setTimeout(() => {
      const targetScroll = scrollPositionRef.current;
      if (Math.abs(window.pageYOffset - targetScroll) > 10) {
        window.scrollTo({
          top: targetScroll,
          behavior: 'auto'
        });
      }
    }, 0);
  }, []);

  const getAllFormData = useCallback(() => {
    const nonEmptyData = {};
    Object.entries(formData).forEach(([page, data]) => {
      if (Object.keys(data).length > 0) {
        nonEmptyData[page] = data;
      }
    });
    return nonEmptyData;
  }, [formData]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FormDataContext.Provider value={{ formData, updateFormData, getAllFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);