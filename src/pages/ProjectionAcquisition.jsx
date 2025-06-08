import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFormData } from "../contexts/FormDataContext";
import { Camera, Image, Sparkles,Settings } from "lucide-react";

const ProjectionAcquisition = () => {
  const { t, i18n } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected, send } = useWebSocket();

  // ✅ تشخیص زبان و تنظیم جهت
  const isRtl = i18n.language === "fa";
  const flexDir = isRtl ? "flex-row-reverse" : "flex-row";
  const textAlign = isRtl ? "text-right" : "text-left";

  // ✅ بهینه‌سازی: useMemo برای defaultData
  const defaultData = useMemo(
    () => ({
      imagingMode: "180°",
      multiSegmentSize: "",
      hdrStatus: false,
      energyLevel1: "80",
      energyLevel2: "120",
      imageCount: "2",
    }),
    []
  );

  // ✅ بهینه‌سازی: useMemo برای ترکیب داده‌ها
  const initialData = useMemo(() => {
    const pageData = formData.projectionAcquisition || {};
    return { ...defaultData, ...pageData };
  }, [defaultData, formData.projectionAcquisition]);

  // حالت محلی برای HDR
  const [hdrStatus, setHdrStatus] = useState(initialData.hdrStatus);

  // ✅ بهینه‌سازی: useCallback برای handleChange
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      updateFormData("projectionAcquisition", {
        ...initialData,
        [name]: value,
      });
    },
    [initialData, updateFormData]
  );

  // ✅ بهینه‌سازی: useCallback برای toggle HDR
  const toggleHdrStatus = useCallback(() => {
    const newStatus = !hdrStatus;
    setHdrStatus(newStatus);
    updateFormData("projectionAcquisition", {
      ...initialData,
      hdrStatus: newStatus,
    });
  }, [hdrStatus, initialData, updateFormData]);

  // ✅ بهینه‌سازی: useCallback برای دکمه‌های WebSocket
  const handleAction = useCallback(
    (action) => {
      if (isConnected) {
        const message = `Action:${action}`;
        if (send(message)) {
          console.log(`✅ Action ${action} sent via WebSocket`);
        } else {
          console.error(`❌ Failed to send Action ${action}`);
        }
      }
    },
    [isConnected, send]
  );

  // ✅ بهینه‌سازی: useMemo برای class names
  const hdrClasses = useMemo(
    () =>
      `px-6 py-3 rounded-lg font-medium font-vazir transition-colors ${
        hdrStatus
          ? "bg-primary hover:bg-primary-dark text-white"
          : "bg-background-secondary hover:bg-accent text-text-muted"
      } disabled:opacity-50 disabled:cursor-not-allowed`,
    [hdrStatus]
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background font-vazir p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        {!isConnected && (
          <div className="panel variant-highlight border border-border rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3 text-white dark:text-white">
              <div className="relative">
                <Camera className="w-5 h-5" />
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
        {/* Imaging Mode */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Camera className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("imagingMode")}
            </label>
          </div>
          <select
            name="imagingMode"
            value={initialData.imagingMode}
            onChange={handleChange}
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
          >
            <option value="180°">{t("180degree")}</option>
            <option value="360°">{t("360degree")}</option>
          </select>
        </div>

        {/* Multi-Segment Size */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-3 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Image className="w-5 h-5 text-primary" />
              <label
                className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
              >
                {t("multiSegmentSize")}
              </label>
            </div>
            {initialData.multiSegmentSize && (
              <span
                className={`text-sm text-primary dark:text-primary font-medium font-vazir ${textAlign}`}
              >
                {initialData.multiSegmentSize} mm
              </span>
            )}
          </div>
          <input
            type="number"
            name="multiSegmentSize"
            value={initialData.multiSegmentSize || ""}
            onChange={handleChange}
            placeholder={t("enterMultiSegmentSize")}
            min="0"
            step="0.1"
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
          />
        </div>

        {/* Gain and Offset Actions */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Settings className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("imageAdjustments")}
            </label>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAction("Gain")}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("gain")}
            </button>
            <button
              type="button"
              onClick={() => handleAction("Offset")}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("offset")}
            </button>
          </div>
        </div>

        {/* Preprocess Images */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Sparkles className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("preprocessImages")}
            </label>
          </div>
          <button
            type="button"
            onClick={() => handleAction("Preprocess")}
            disabled={!isConnected}
            className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t("preprocess")}
          </button>
        </div>

        {/* HDR */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md lg:col-span-2">
          <div className={`flex items-center justify-between mb-4 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Image className="w-5 h-5 text-primary" />
              <label
                className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
              >
                {t("hdr")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  hdrStatus ? "bg-primary" : "bg-text-muted"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  hdrStatus
                    ? "text-primary dark:text-primary"
                    : "text-text-muted dark:text-text-muted"
                } font-vazir ${textAlign}`}
              >
                {hdrStatus ? t("active") : t("inactive")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={toggleHdrStatus}
              disabled={!isConnected}
              className={hdrClasses}
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>{hdrStatus ? t("active") : t("inactive")}</span>
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("energyLevel1")}
                </label>
                <input
                  type="number"
                  name="energyLevel1"
                  value={initialData.energyLevel1 || ""}
                  onChange={handleChange}
                  placeholder={t("enterEnergyLevel1")}
                  min="0"
                  step="1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("energyLevel2")}
                </label>
                <input
                  type="number"
                  name="energyLevel2"
                  value={initialData.energyLevel2 || ""}
                  onChange={handleChange}
                  placeholder={t("enterEnergyLevel2")}
                  min="0"
                  step="1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("imageCount")}
                </label>
                <input
                  type="number"
                  name="imageCount"
                  value={initialData.imageCount || ""}
                  onChange={handleChange}
                  placeholder={t("enterImageCount")}
                  min="1"
                  step="1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionAcquisition;