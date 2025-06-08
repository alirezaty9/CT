import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useFormData } from "../contexts/FormDataContext";
import {
  RotateCcw,
  FlipHorizontal,
  Sparkles,
  Filter,
  Maximize,
  Search,
  Download,
} from "lucide-react";

const PostProcessing = () => {
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
      rotationAngle: "None",
      mirroring: false,
      medianFilter: false,
      gaussianFilter: false,
      gaussianSigma: "1.0",
      meanFilter: false,
      varianceFilter: false,
      pseudoColorFilter: false,
      fourierFilter: "Low Pass",
      sharpening: false,
      kernelSize: "3x3",
      sharpeningStrength: "1.0",
      edgeDetection: false,
      threshold: "100",
      edgeMethod: "Sobel",
      exportFormat: "TIFF",
    }),
    []
  );

  // ✅ بهینه‌سازی: useMemo برای ترکیب داده‌ها
  const initialData = useMemo(() => {
    const pageData = formData.postProcessing || {};
    return { ...defaultData, ...pageData };
  }, [defaultData, formData.postProcessing]);

  // حالت‌های محلی
  const [mirroring, setMirroring] = useState(initialData.mirroring);
  const [sharpening, setSharpening] = useState(initialData.sharpening);
  const [edgeDetection, setEdgeDetection] = useState(initialData.edgeDetection);

  // ✅ بهینه‌سازی: useCallback برای handleChange
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      updateFormData("postProcessing", {
        ...initialData,
        [name]: type === "checkbox" ? checked : value,
      });
    },
    [initialData, updateFormData]
  );

  // ✅ بهینه‌سازی: useCallback برای toggle functions
  const toggleMirroring = useCallback(() => {
    const newStatus = !mirroring;
    setMirroring(newStatus);
    updateFormData("postProcessing", {
      ...initialData,
      mirroring: newStatus,
    });
  }, [mirroring, initialData, updateFormData]);

  const toggleSharpening = useCallback(() => {
    const newStatus = !sharpening;
    setSharpening(newStatus);
    updateFormData("postProcessing", {
      ...initialData,
      sharpening: newStatus,
    });
  }, [sharpening, initialData, updateFormData]);

  const toggleEdgeDetection = useCallback(() => {
    const newStatus = !edgeDetection;
    setEdgeDetection(newStatus);
    updateFormData("postProcessing", {
      ...initialData,
      edgeDetection: newStatus,
    });
  }, [edgeDetection, initialData, updateFormData]);

  // ✅ بهینه‌سازی: useCallback برای دکمه‌های WebSocket
  const handleAction = useCallback(
    (action, value = null) => {
      if (isConnected) {
        const message = value ? `Action:${action}:${value}` : `Action:${action}`;
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
  const mirroringClasses = useMemo(
    () =>
      `px-6 py-3 rounded-lg font-medium font-vazir transition-colors ${
        mirroring
          ? "bg-primary hover:bg-primary-dark text-white"
          : "bg-background-secondary hover:bg-accent text-text-muted"
      } disabled:opacity-50 disabled:cursor-not-allowed`,
    [mirroring]
  );

  const sharpeningClasses = useMemo(
    () =>
      `px-6 py-3 rounded-lg font-medium font-vazir transition-colors ${
        sharpening
          ? "bg-primary hover:bg-primary-dark text-white"
          : "bg-background-secondary hover:bg-accent text-text-muted"
      } disabled:opacity-50 disabled:cursor-not-allowed`,
    [sharpening]
  );

  const edgeDetectionClasses = useMemo(
    () =>
      `px-6 py-3 rounded-lg font-medium font-vazir transition-colors ${
        edgeDetection
          ? "bg-primary hover:bg-primary-dark text-white"
          : "bg-background-secondary hover:bg-accent text-text-muted"
      } disabled:opacity-50 disabled:cursor-not-allowed`,
    [edgeDetection]
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background font-vazir p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        {!isConnected && (
          <div className="panel variant-highlight border border-border rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3 text-white dark:text-white">
              <div className="relative">
                <Sparkles className="w-5 h-5" />
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
        {/* Rotation and Mirroring */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <RotateCcw className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("imageTransform")}
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <select
              name="rotationAngle"
              value={initialData.rotationAngle}
              onChange={handleChange}
              className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
            >
              <option value="None">{t("none")}</option>
              <option value="90°">{t("90degree")}</option>
              <option value="180°">{t("180degree")}</option>
              <option value="270°">{t("270degree")}</option>
            </select>
            <button
              type="button"
              onClick={toggleMirroring}
              disabled={!isConnected}
              className={mirroringClasses}
            >
              <div className="flex items-center gap-2">
                <FlipHorizontal className="w-4 h-4" />
                <span>{mirroring ? t("active") : t("inactive")}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Normalize */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Sparkles className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("normalize")}
            </label>
          </div>
          <button
            type="button"
            onClick={() => handleAction("Normalize")}
            disabled={!isConnected}
            className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t("normalize")}
          </button>
        </div>

        {/* FFT and FFT Inverse */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Filter className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("fourierTransforms")}
            </label>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAction("FFT")}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("fft")}
            </button>
            <button
              type="button"
              onClick={() => handleAction("FFTInverse")}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("fftInverse")}
            </button>
          </div>
        </div>

        {/* Fourier Filters */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Filter className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("fourierFilter")}
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <select
              name="fourierFilter"
              value={initialData.fourierFilter}
              onChange={handleChange}
              className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
            >
              <option value="Low Pass">{t("lowPass")}</option>
              <option value="Band Pass">{t("bandPass")}</option>
              <option value="High Pass">{t("highPass")}</option>
            </select>
            <button
              type="button"
              onClick={() => handleAction("FourierFilter", initialData.fourierFilter)}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("applyFourierFilter")}
            </button>
          </div>
        </div>

        {/* Image Filters */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md lg:col-span-2">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Filter className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("imageFilters")}
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "medianFilter", label: t("medianFilter") },
              { name: "meanFilter", label: t("meanFilter") },
              { name: "varianceFilter", label: t("varianceFilter") },
              { name: "pseudoColorFilter", label: t("pseudoColorFilter") },
            ].map((filter) => (
              <label
                key={filter.name}
                className={`flex items-center gap-2 font-vazir text-text ${textAlign}`}
              >
                <input
                  type="checkbox"
                  name={filter.name}
                  checked={initialData[filter.name] || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                {filter.label}
              </label>
            ))}
            <div>
              <label
                className={`flex items-center gap-2 font-vazir text-text ${textAlign}`}
              >
                <input
                  type="checkbox"
                  name="gaussianFilter"
                  checked={initialData.gaussianFilter || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                {t("gaussianFilter")}
              </label>
              {initialData.gaussianFilter && (
                <input
                  type="number"
                  name="gaussianSigma"
                  value={initialData.gaussianSigma || ""}
                  onChange={handleChange}
                  placeholder={t("enterGaussianSigma")}
                  min="0"
                  step="0.1"
                  className={`w-full p-3 mt-2 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sharpening */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-4 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Maximize className="w-5 h-5 text-primary" />
              <label
                className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
              >
                {t("sharpening")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  sharpening ? "bg-primary" : "bg-text-muted"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  sharpening
                    ? "text-primary dark:text-primary"
                    : "text-text-muted dark:text-text-muted"
                } font-vazir ${textAlign}`}
              >
                {sharpening ? t("active") : t("inactive")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={toggleSharpening}
              disabled={!isConnected}
              className={sharpeningClasses}
            >
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4" />
                <span>{sharpening ? t("active") : t("inactive")}</span>
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("kernelSize")}
                </label>
                <select
                  name="kernelSize"
                  value={initialData.kernelSize}
                  onChange={handleChange}
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
                >
                  <option value="3x3">3x3</option>
                  <option value="5x5">5x5</option>
                  <option value="7x7">7x7</option>
                </select>
              </div>
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("sharpeningStrength")}
                </label>
                <input
                  type="number"
                  name="sharpeningStrength"
                  value={initialData.sharpeningStrength || ""}
                  onChange={handleChange}
                  placeholder={t("enterSharpeningStrength")}
                  min="0"
                  step="0.1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edge Detection */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center justify-between mb-4 ${flexDir}`}>
            <div className={`flex items-center gap-2 ${flexDir}`}>
              <Search className="w-5 h-5 text-primary" />
              <label
                className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
              >
                {t("edgeDetection")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  edgeDetection ? "bg-primary" : "bg-text-muted"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  edgeDetection
                    ? "text-primary dark:text-primary"
                    : "text-text-muted dark:text-text-muted"
                } font-vazir ${textAlign}`}
              >
                {edgeDetection ? t("active") : t("inactive")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={toggleEdgeDetection}
              disabled={!isConnected}
              className={edgeDetectionClasses}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>{edgeDetection ? t("active") : t("inactive")}</span>
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("threshold")}
                </label>
                <input
                  type="number"
                  name="threshold"
                  value={initialData.threshold || ""}
                  onChange={handleChange}
                  placeholder={t("enterThreshold")}
                  min="0"
                  step="1"
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors ${textAlign}`}
                />
              </div>
              <div>
                <label
                  className={`text-sm font-medium text-text dark:text-text mb-2 font-vazir ${textAlign}`}
                >
                  {t("edgeMethod")}
                </label>
                <select
                  name="edgeMethod"
                  value={initialData.edgeMethod}
                  onChange={handleChange}
                  className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
                >
                  <option value="Sobel">{t("sobel")}</option>
                  <option value="Canny">{t("canny")}</option>
                  <option value="Prewitt">{t("prewitt")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Export Image */}
        <div className="card p-6 transition-all duration-200 hover:shadow-md">
          <div className={`flex items-center gap-2 mb-3 ${flexDir}`}>
            <Download className="w-5 h-5 text-primary" />
            <label
              className={`font-medium text-text dark:text-text font-vazir ${textAlign}`}
            >
              {t("exportImage")}
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <select
              name="exportFormat"
              value={initialData.exportFormat}
              onChange={handleChange}
              className={`w-full p-3 border border-border rounded-lg bg-background-white dark:bg-background-secondary text-text dark:text-text outline-none focus:border-primary focus:shadow-sm focus:shadow-primary/50 transition-colors font-vazir ${textAlign}`}
            >
              <option value="TIFF">{t("tiff")}</option>
              <option value="JPG">{t("jpg")}</option>
              <option value="DICOM">{t("dicom")}</option>
            </select>
            <button
              type="button"
              onClick={() => handleAction("Export", initialData.exportFormat)}
              disabled={!isConnected}
              className={`px-6 py-3 rounded-lg font-medium font-vazir transition-colors bg-background-secondary hover:bg-accent text-text-muted disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("export")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProcessing;