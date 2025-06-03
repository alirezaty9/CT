import React, { useState, useCallback, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  Move3D,
  Focus,
  ImagePlus,
  Wrench,
  Play,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import BaslerTools from "./Toolbar";
import TabNav from "./TabNav";
import IconButton from "./IconButton";
import { useTranslation } from "react-i18next";
import { useFormData } from "../contexts/FormDataContext";
import { useWebSocket } from "../contexts/WebSocketContext";

// تب‌های بالا
const tabs = [
  { to: "/initial", label: "initial", icon: <LayoutDashboard className="w-4 h-4 mr-1" /> },
  { to: "/position", label: "position", icon: <Move3D className="w-4 h-4 mr-1" /> },
  { to: "/projection", label: "projection", icon: <Focus className="w-4 h-4 mr-1" /> },
  { to: "/post-processing", label: "postProcessing", icon: <Wrench className="w-4 h-4 mr-1" /> },
  { to: "/reconstruction", label: "reconstruction", icon: <ImagePlus className="w-4 h-4 mr-1" /> },
];

// دکمه انتخاب زبان
const LanguageButton = ({ lng, current, onClick }) => (
  <button
    onClick={() => onClick(lng)}
    className={twMerge(
      "px-2 py-1 text-sm rounded-md",
      current === lng ? "bg-primary text-white" : "bg-background-secondary text-text-muted"
    )}
  >
    {lng.toUpperCase()}
  </button>
);

// پنل پایین (وضعیت سیستم و دوربین)
const BottomPanels = ({ t }) => (
  <div className="h-40 md:h-44 flex gap-4 p-4 pt-0">
    <div className="panel flex-1 flex items-center justify-center text-sm dark:text-text">
      {t("systemStatus")}
    </div>
    <div className="panel w-96 flex items-center justify-center text-sm dark:text-text">
      {t("camera")}
    </div>
  </div>
);

// کامپوننت اصلی Layout
const Layout = () => {
  const location = useLocation();
  const defaultActive = location.pathname.includes("settings") ? "Settings" : null;

  const [activeButton, setActiveButton] = useState(defaultActive);
  const { t, i18n } = useTranslation();
  const { getAllFormData } = useFormData();
  const { send, isConnected, addMessageCallback, removeMessageCallback } = useWebSocket();
  const [response, setResponse] = useState("");

  useEffect(() => {
    const handleMessage = (message) => {
      console.log("📬 پاسخ از WebSocket:", message);
      if (message.startsWith("response:")) {
        const content = message.slice("response:".length);
        setResponse(content);
        if (content === t("dataSubmittedSuccessfully")) {
          Swal.fire({
            title: t("success"),
            text: t("dataSubmittedSuccessfully"),
            icon: "success",
            confirmButtonText: t("ok"),
            confirmButtonColor: "#16a34a",
            customClass: {
              confirmButton: "swal-confirm-button",
            },
          });
        } else if (content.includes("Error")) {
          Swal.fire({
            title: t("error"),
            text: content,
            icon: "error",
            confirmButtonText: t("ok"),
            confirmButtonColor: "#16a34a",
            customClass: {
              confirmButton: "swal-confirm-button",
            },
          });
        }
      }
    };
    addMessageCallback(handleMessage);
    return () => removeMessageCallback(handleMessage);
  }, [addMessageCallback, removeMessageCallback, t]);

  const handleButtonClick = useCallback((name) => {
    setActiveButton(name);
  }, []);

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    console.log("Changed language to:", lng);
  }, [i18n]);

  const handleSubmitAll = async () => {
    const allData = getAllFormData();
    if (Object.keys(allData).length === 0) {
      setResponse(t("noDataAvailable"));
      Swal.fire({
        title: t("error"),
        text: t("noDataToSubmit"),
        icon: "warning",
        confirmButtonText: t("ok"),
        confirmButtonColor: "#16a34a",
        customClass: {
          confirmButton: "swal-confirm-button",
        },
      });
      return;
    }

    // پاپ‌آپ تأیید
    const result = await Swal.fire({
      title: t("areYouSure"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#ef4444",
      customClass: {
        confirmButton: "swal-confirm-button",
        cancelButton: "swal-cancel-button",
      },
    });

    if (result.isConfirmed) {
      const message = `AllFormData:${JSON.stringify(allData)}`;
      if (send(message)) {
        setResponse(t("sendingData"));
      }
    }
    // اگه لغو کنه، هیچی انجام نمی‌شه
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-4 p-4 bg-background dark:bg-background">
      {/* ستون چپ */}
      <div className="w-full md:w-1/2 flex flex-col gap-4  ">
        <div className="card flex-1 flex flex-col">
          {/* نوار بالا */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary dark:bg-background-secondary dark:border-border rounded-t-xl">
            <TabNav tabs={tabs.map((tab) => ({ ...tab, label: t(tab.label) }))} />
            <div className="flex gap-2 items-center">
              <IconButton
                Icon={Play}
                title={t("run")}
                variant={activeButton === "Run" ? "primary" : "default"}
                size="md"
                onClick={() => {
                  handleButtonClick("Run");
                  handleSubmitAll();
                }}
                disabled={!isConnected}
              />
              <Link to="/settings">
                <IconButton
                  Icon={Settings}
                  title={t("settings")}
                  variant={activeButton === "Settings" ? "primary" : "default"}
                  size="md"
                  onClick={() => handleButtonClick("Settings")}
                />
              </Link>
            </div>
          </div>

          {/* محتوای مرکزی */}
          <div className="w-full flex-1 overflow-auto px-6 py-4">
            <div className="w-full h-full max-h-[calc(100vh-320px)] overflow-auto rounded-md">
              <Outlet />
            </div>
            {response && <p className="text-green-600 mt-2">{response}</p>}
          </div>

          {/* وضعیت سیستم / دوربین */}
          <BottomPanels t={t} />
        </div>
      </div>

      {/* ستون راست */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex-1 flex flex-col gap-0">
          <div className="card flex-1 rounded-b-none border-b-0 relative overflow-hidden flex dark:bg-background-white dark:border-border">
            <BaslerTools />
            <div className="flex-1 flex items-center justify-center text-text dark:text-text font-medium">
              {t("projectionDisplay")}
            </div>
          </div>
          <div className="card rounded-t-none border-t-0 text-text dark:text-text font-medium text-center p-4">
            {t("imageReel")}
          </div>
        </div>
        <div className="card h-40 md:h-44 p-4 text-text dark:text-text font-medium text-center">
          {t("histogram")}
        </div>
      </div>
    </div>
  );
};

export default Layout;