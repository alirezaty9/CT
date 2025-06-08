import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFormData } from "../contexts/FormDataContext";
import { Move3D, Sliders, Upload } from "lucide-react";

const PositionAndOptimization = () => {
  const { t, i18n } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected } = useWebSocket();

  // ✅ تشخیص زبان و تنظیم جهت
  const isRtl = i18n.language === "fa";
  const flexDir = isRtl ? "flex-row-reverse" : "flex-row";
  const textAlign = isRtl ? "text-right" : "text-left";

  // ✅ بهینه‌سازی: useMemo برای defaultData
  const defaultData = useMemo(
    () => ({
      manipulatorX: "",
      manipulatorY: "",
      manipulatorZ: "",
      manipulatorTheta: "",
      manipulatorGamma: "",
      joystickSpeed: "Medium",
      uploadedFile: null,
    }),
    []
  );

  // ✅ بهینه‌سازی: useMemo برای ترکیب داده‌ها
  const initialData = useMemo(() => {
    const pageData = formData.positionAndOptimization || {};
    return { ...defaultData, ...pageData };
  }, [defaultData, formData.positionAndOptimization]);

  // ✅ بهینه‌سازی: useCallback برای handleChange
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      updateFormData("positionAndOptimization", {
        ...initialData,
        [name]: value,
      });
    },
    [initialData, updateFormData]
  );

  // ✅ بهینه‌سازی: useCallback برای آپلود فایل
  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      updateFormData("positionAndOptimization", {
        ...initialData,
        uploadedFile: file ? file.name : null,
      });
    },
    [initialData, updateFormData]
  );

  // ✅ بهینه‌سازی: useMemo برای manipulator fields
  const manipulatorFields = useMemo(
    () => [
      { name: "manipulatorX", label: t("manipulatorX") },
      { name: "manipulatorY", label: t("manipulatorY") },
      { name: "manipulatorZ", label: t("manipulatorZ") },
      { name: "manipulatorTheta", label: t("manipulatorTheta") },
      { name: "manipulatorGamma", label: t("manipulatorGamma") },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background font-vazir p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        {!isConnected && (
          <div className="panel variant-highlight border border-border rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3 text-white dark:text-white">
              <div className="relative">
                <Move3D className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-highlight rounded-full animate-ping"></div>
              </div>
              <span className={`font-medium font-vazir ${textAlign}`}>
                {t("websocketConnecting")}
              </span>
            </div>
          </div>
        )}
        {isConnected && (
          <div className="panel bg-background-white dark:bg-background-secondary border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 text-primary dark:text-primary">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className={`font-medium font-vazir ${textAlign}`}>
                {t("websocketConnected")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
        {/* Manipulator */}
        <div className="card p-6 lg:col-span-2">
          <div className={`flex items-center gap-2 mb-4 ${flexDir}`}>
            <Move3D className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("manipulator")}
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {manipulatorFields.map((field) => (
              <div key={field.name}>
                <div
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {field.label}
                </div>
                <input
                  type="number"
                  name={field.name}
                  value={initialData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={t("enterManipulatorPosition", {
                    label: field.label,
                  })}
                  step="0.1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Joystick Speed */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Sliders className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("joystickSpeed")}
            </label>
          </div>
          <select
            name="joystickSpeed"
            value={initialData.joystickSpeed}
            onChange={handleChange}
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
          >
            <option value="Low">{t("joystickSpeedLow")}</option>
            <option value="Medium">{t("joystickSpeedMedium")}</option>
            <option value="High">{t("joystickSpeedHigh")}</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Upload className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("uploadFile")}
            </label>
          </div>
          <input
            type="file"
            name="uploadedFile"
            onChange={handleFileUpload}
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
          />
          {initialData.uploadedFile && (
            <span
              className={`text-sm text-primary dark:text-primary font-medium font-vazir mt-2 ${textAlign}`}
            >
              {t("selectedFile")}: {initialData.uploadedFile}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionAndOptimization;