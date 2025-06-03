import React from "react";
import { useTranslation } from "react-i18next";
import { useFormData } from "../contexts/FormDataContext";
import { useWebSocket } from "../contexts/WebSocketContext";

const PositionAndOptimization = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected } = useWebSocket();
  const pageData = formData.positionAndOptimization || { x: "", y: "" };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData("positionAndOptimization", {
      ...pageData,
      [name]: value,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("position")}</h1>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1">{t("xPosition")}</label>
          <input
            type="number"
            name="x"
            value={pageData.x || ""}
            onChange={handleChange}
            placeholder={t("xPosition")}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("yPosition")}</label>
          <input
            type="number"
            name="y"
            value={pageData.y || ""}
            onChange={handleChange}
            placeholder={t("yPosition")}
            className="w-full p-2 border rounded"
          />
        </div>
        {!isConnected && <p className="text-red-500">{t("websocketConnecting")}</p>}
      </div>
    </div>
  );
};

export default PositionAndOptimization;