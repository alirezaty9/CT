import React from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFormData } from "../contexts/FormDataContext";

const InitialParameters = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected } = useWebSocket();
  const pageData = formData.initialParameters || { name: "", email: "" };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData("initialParameters", {
      ...pageData,
      [name]: value,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("initialParameters")}</h1>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1">{t("name")}</label>
          <input
            type="text"
            name="name"
            value={pageData.name || ""}
            onChange={handleChange}
            placeholder={t("enterName")}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">{t("email")}</label>
          <input
            type="email"
            name="email"
            value={pageData.email || ""}
            onChange={handleChange}
            placeholder={t("enterEmail")}
            className="w-full p-2 border rounded"
          />
        </div>
        {!isConnected && <p className="text-red-500">{t("websocketConnecting")}</p>}
      </div>
    </div>
  );
};

export default InitialParameters;