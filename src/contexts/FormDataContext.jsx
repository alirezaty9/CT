
import React, { createContext, useContext, useState } from "react";

const FormDataContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    initialParameters: {},
    positionAndOptimization: {},
    postProcessing: {},
    reconstruction: {},
    projectionAcquisition: {},
  });

  const updateFormData = (page, data) => {
    setFormData((prev) => ({
      ...prev,
      [page]: data,
    }));
  };

  const getAllFormData = () => {
    const nonEmptyData = {};
    Object.entries(formData).forEach(([page, data]) => {
      if (Object.keys(data).length > 0) {
        nonEmptyData[page] = data;
      }
    });
    return nonEmptyData;
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData, getAllFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => useContext(FormDataContext);
