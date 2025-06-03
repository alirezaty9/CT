import React from "react";
import { useTranslation } from "react-i18next";
import { useFormData } from "../contexts/FormDataContext";
import { useWebSocket } from "../contexts/WebSocketContext";

const PostProcessing = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected } = useWebSocket();
  const pageData = formData.postProcessing || { filter: false };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    updateFormData("postProcessing", {
      ...pageData,
      [name]: type === "checkbox" ? checked : e.target.value,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("postProcessing")}</h1>
      <div className="flex flex-col gap-4">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="filter"
              checked={pageData.filter || false}
              onChange={handleChange}
              className="h-4 w-4"
            />
            {t("enableFilter")}
          </label>
        </div>
        {!isConnected && <p className="text-red-500">{t("websocketConnecting")}</p>}
      </div>
    </div>
  );
};

export default PostProcessing;