import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFormData } from "../contexts/FormDataContext";
import {
  Power,
  Video,
  Gauge,
  Zap,
  Battery,
  Filter,
  Clock,
  Layers,
  Move3D,
  Sliders,
} from "lucide-react";

const InitialParameters = () => {
  const { t, i18n } = useTranslation();
  const { formData, updateFormData } = useFormData();
  const { isConnected } = useWebSocket();

  // ✅ تشخیص زبان و تنظیم جهت
  const isRtl = i18n.language === "fa";
  const flexDir = isRtl ? "flex-row-reverse" : "flex-row";
  const textAlign = isRtl ? "text-right" : "text-left";

  // ✅ بهینه‌سازی: useMemo برای defaultData
  const defaultData = useMemo(() => ({
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
  }), []);

  // ✅ بهینه‌سازی: useMemo برای ترکیب داده‌ها
  const initialData = useMemo(() => {
    const pageData = formData.initialParameters || {};
    return { ...defaultData, ...pageData };
  }, [defaultData, formData.initialParameters]);

  // حالت‌های محلی برای tubeStatus و cabinCameraStatus
  const [tubeStatus, setTubeStatus] = useState(initialData.tubeStatus);
  const [cabinCameraStatus, setCabinCameraStatus] = useState(initialData.cabinCameraStatus);

  // همگام‌سازی حالت‌های محلی با تغییرات کانتکست
  useEffect(() => {
    setTubeStatus(initialData.tubeStatus);
    setCabinCameraStatus(initialData.cabinCameraStatus);
  }, [initialData.tubeStatus, initialData.cabinCameraStatus]);

  // ✅ بهینه‌سازی: useCallback برای handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    updateFormData("initialParameters", {
      ...initialData,
      [name]: value,
    });
  }, [initialData, updateFormData]);

  // ✅ بهینه‌سازی: useCallback برای toggle functions
  const toggleTubeStatus = useCallback(() => {
    const newStatus = !tubeStatus;
    setTubeStatus(newStatus);
    updateFormData("initialParameters", {
      ...initialData,
      tubeStatus: newStatus,
      tubeVoltageDisplay: newStatus ? "100" : "0",
      tubeCurrentDisplay: newStatus ? "10" : "0",
    });
  }, [tubeStatus, initialData, updateFormData]);

  const toggleCabinCameraStatus = useCallback(() => {
    const newStatus = !cabinCameraStatus;
    setCabinCameraStatus(newStatus);
    updateFormData("initialParameters", {
      ...initialData,
      cabinCameraStatus: newStatus,
    });
  }, [cabinCameraStatus, initialData, updateFormData]);

  // ✅ بهینه‌سازی: useCallback برای preset handlers
  const handleStandardPreset = useCallback(() => {
    updateFormData("initialParameters", {
      ...initialData,
      power: "50",
      tubeVoltage: "120",
      anodeCurrent: "10",
    });
  }, [initialData, updateFormData]);

  const handleHighPowerPreset = useCallback(() => {
    updateFormData("initialParameters", {
      ...initialData,
      power: "100",
      tubeVoltage: "150",
      anodeCurrent: "20",
    });
  }, [initialData, updateFormData]);

  const handleClearAll = useCallback(() => {
    updateFormData("initialParameters", {
      ...defaultData,
      tubeStatus: false,
      cabinCameraStatus: false,
    });
  }, [defaultData, updateFormData]);

  // ✅ بهینه‌سازی: useMemo برای manipulator fields
  const manipulatorFields = useMemo(() => [
    { name: "manipulatorX", label: t("manipulatorX") },
    { name: "manipulatorY", label: t("manipulatorY") },
    { name: "manipulatorZ", label: t("manipulatorZ") },
    { name: "manipulatorTheta", label: t("manipulatorTheta") },
    { name: "manipulatorGamma", label: t("manipulatorGamma") },
  ], [t]);

  // ✅ بهینه‌سازی: useMemo برای class names
  const tubeStatusClasses = useMemo(() => 
    `px-6 py-3 rounded-lg font-medium font-vazir transition-all duration-200 transform active:scale-95 ${
      tubeStatus
        ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
        : 'bg-background-secondary hover:bg-accent text-text-muted'
    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`,
    [tubeStatus]
  );

  const cabinCameraClasses = useMemo(() =>
    `px-6 py-3 rounded-lg font-medium font-vazir transition-colors ${
      cabinCameraStatus
        ? 'bg-primary hover:bg-primary-dark text-white'
        : 'bg-background-secondary hover:bg-accent text-text-muted'
    } disabled:opacity-50 disabled:cursor-not-allowed`,
    [cabinCameraStatus]
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background font-vazir p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        {/* WebSocket Warning */}
        {!isConnected && (
          <div className="panel variant-highlight border border-border rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3 text-white dark:text-white">
              <div className="relative">
                <Zap className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-highlight rounded-full animate-ping"></div>
              </div>
              <span className={`font-medium font-vazir ${textAlign}`}>{t("websocketConnecting")}</span>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isConnected && (
          <div className="panel bg-background-white dark:bg-background-secondary border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 text-primary dark:text-primary">
              <div className="relative">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <span className={`font-medium font-vazir ${textAlign}`}>{t("websocketConnected")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="card p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStandardPreset}
              className="px-4 py-2 variant-primary rounded-lg border border-border hover:variant-primary text-sm font-medium font-vazir"
            >
              {t("presetStandard")}
            </button>
            <button
              onClick={handleHighPowerPreset}
              className="px-4 py-2 variant-highlight rounded-lg border border-border text-sm font-medium font-vazir"
            >
              {t("presetHighPower")}
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 variant-default rounded-lg border border-border hover:variant-default text-sm font-medium font-vazir"
            >
              {t("clearAll")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
        {/* Power */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-3 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Gauge className="w-5 h-5 text-primary" />
              <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("power")}</label>
            </div>
            {initialData.power && (
              <span className={`text-sm text-primary dark:text-primary font-medium font-vazir ${textAlign}`}>
                {initialData.power} W
              </span>
            )}
          </div>
          <input
            type="number"
            name="power"
            value={initialData.power || ""}
            onChange={handleChange}
            placeholder={t("enterPower")}
            min="0"
            step="1"
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
          />
        </div>

        {/* Tube Voltage */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-3 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Zap className="w-5 h-5 text-primary" />
              <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("tubeVoltage")}</label>
            </div>
            {initialData.tubeVoltage && (
              <span className={`text-sm text-primary dark:text-primary font-medium font-vazir ${textAlign}`}>
                {initialData.tubeVoltage} kVp
              </span>
            )}
          </div>
          <input
            type="number"
            name="tubeVoltage"
            value={initialData.tubeVoltage || ""}
            onChange={handleChange}
            placeholder={t("enterTubeVoltage")}
            min="0"
            step="0.1"
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
          />
        </div>

        {/* Anode Current */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-3 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Battery className="w-5 h-5 text-primary" />
              <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("anodeCurrent")}</label>
            </div>
            {initialData.anodeCurrent && (
              <span className={`text-sm text-primary dark:text-primary font-medium font-vazir ${textAlign}`}>
                {initialData.anodeCurrent} {initialData.anodeCurrentUnit}
              </span>
            )}
          </div>
          <div className={`flex gap-3 ${flexDir}`}>
            <input
              type="number"
              name="anodeCurrent"
              value={initialData.anodeCurrent || ""}
              onChange={handleChange}
              placeholder={t("enterAnodeCurrent")}
              min="0"
              step="0.1"
              className={`flex-1 p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
            />
            <select
              name="anodeCurrentUnit"
              value={initialData.anodeCurrentUnit}
              onChange={handleChange}
              className={`w-20 p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
            >
              <option value="mA">mA</option>
              <option value="μA">μA</option>
            </select>
          </div>
        </div>

        {/* Filtration */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Filter className="w-5 h-5 text-primary" />
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("filtration")}</label>
          </div>
          <div className={`flex gap-3 ${flexDir}`}>
            <select
              name="filtrationMaterial"
              value={initialData.filtrationMaterial}
              onChange={handleChange}
              className={`flex-1 p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
            >
              <option value="Al">{t("aluminum")}</option>
              <option value="Cu">{t("copper")}</option>
              <option value="Ag">{t("silver")}</option>
            </select>
            <input
              type="number"
              name="filtrationThickness"
              value={initialData.filtrationThickness || ""}
              onChange={handleChange}
              placeholder={t("enterThickness")}
              min="0"
              step="0.01"
              className={`w-28 p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
            />
          </div>
        </div>

        {/* Exposure Time */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Filter className="w-5 h-5 text-primary" />
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("exposureTime")}</label>
          </div>
          <input
            type="text"
            value={initialData.exposureTime}
            readOnly
            className={`w-full p-3 border border-border rounded-lg bg-background-secondary dark:bg-accent text-text dark:text-text cursor-not-allowed font-vazir ${textAlign}`}
          />
        </div>

        {/* Bit Depth */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Layers className="w-5 h-5 text-primary" />
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("bitDepth")}</label>
          </div>
          <select
            name="bitDepth"
            value={initialData.bitDepth}
            onChange={handleChange}
            className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
          >
            <option value="8-bit">{t("8bit")}</option>
            <option value="16-bit">{t("16bit")}</option>
          </select>
        </div>

        {/* Tube Status */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Power className="w-5 h-5 text-primary" />
              <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("tubeStatus")}</label>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${tubeStatus ? 'bg-primary' : 'bg-text-muted'}`}></div>
              <span className={`text-sm font-medium ${tubeStatus ? 'text-primary dark:text-primary' : 'text-text-muted dark:text-text-muted'} font-vazir ${textAlign}`}>
                {tubeStatus ? t("active") : t("inactive")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={toggleTubeStatus}
              disabled={!isConnected}
              className={tubeStatusClasses}
            >
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4" />
                <span>{tubeStatus ? t("active") : t("inactive")}</span>
              </div>
            </button>
            <div className="flex gap-4">
              <div className="text-center">
                <div className={`text-sm text-text-muted dark:text-text-muted mb-1 font-vazir ${textAlign}`}>{t("voltage")}</div>
                <div className="panel px-3 py-2 rounded-lg border border-border">
                  <span className={`text-lg font-mono font-bold text-text dark:text-text ${textAlign}`}>
                    {initialData.tubeVoltageDisplay}
                  </span>
                  <span className={`text-sm text-text-muted dark:text-text-muted ml-1 font-vazir ${textAlign}`}>kVp</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-sm text-text-muted dark:text-text-muted mb-1 font-vazir ${textAlign}`}>{t("current")}</div>
                <div className="panel px-3 py-2 rounded-lg border border-border">
                  <span className={`text-lg font-mono font-bold text-text dark:text-text ${textAlign}`}>
                    {initialData.tubeCurrentDisplay}
                  </span>
                  <span className={`text-sm text-text-muted dark:text-text-muted ml-1 font-vazir ${textAlign}`}>mA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manipulator */}
        <div className="card p-6 lg:col-span-2">
          <div className={`flex items-center gap-2 mb-4 ${flexDir}`}>
            <Move3D className="w-5 h-5 text-primary" />
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("manipulator")}</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {manipulatorFields.map((field) => (
              <div key={field.name}>
                <div className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}>
                  {field.label}
                </div>
                <input
                  type="number"
                  name={field.name}
                  value={initialData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={t("enterManipulatorPosition", { label: field.label })}
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
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("joystickSpeed")}</label>
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

        {/* Cabin Camera Status */}
        <div className="card p-6">
          <div className={`flex items-center gap-2 mb-4 ${flexDir}`}>
            <Video className="w-5 h-6 text-primary" />
            <label className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}>{t("cabinCameraStatus")}</label>
          </div>
          <button
            type="button"
            onClick={toggleCabinCameraStatus}
            disabled={!isConnected}
            className={cabinCameraClasses}
          >
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{cabinCameraStatus ? t("active") : t("inactive")}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialParameters;