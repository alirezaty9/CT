import React from "react";
import IconButton from "./common/IconButton";
import { useCamera } from "../contexts/CameraContext"; // ⭐ اضافه شده
import { twMerge } from "tailwind-merge";
import {
  Crop,
  Brush,
  Eraser,
  Circle,
  RectangleHorizontal,
  LineChart,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const tools = [
  { Icon: Crop, name: "crop" },
  { Icon: Brush, name: "brush" },
  { Icon: Eraser, name: "eraser" },
  { Icon: Circle, name: "circle" },
  { Icon: RectangleHorizontal, name: "rectangle" },
  { Icon: LineChart, name: "lineChart" },
  { Icon: Move, name: "move" },
  { Icon: ZoomIn, name: "zoomIn" },
  { Icon: ZoomOut, name: "zoomOut" },
];

const Toolbar = ({ className = "" }) => {
  const { t } = useTranslation();
  const { activeTool, applyTool } = useCamera(); // ⭐ از CameraContext استفاده می‌کنه

  const handleToolClick = (name) => {
    console.log("🔧 ابزار انتخاب شده:", name);
    applyTool(name); // ⭐ ارسال به CameraContext
  };

  return (
    <div
      className={twMerge(
        "w-16 bg-background-secondary h-full flex flex-col items-center py-6 gap-4 border-r border-border rounded-l-xl shadow-card dark:bg-background-secondary dark:border-border",
        className
      )}
    >
      {tools.map(({ Icon, name }, index) => (
        <IconButton
          key={index}
          Icon={Icon}
          title={t(name)}
          onClick={() => handleToolClick(name)}
          variant={activeTool === name ? "primary" : "default"} // ⭐ از activeTool Context استفاده می‌کنه
          size="md"
          className="hover:scale-105"
        />
      ))}
    </div>
  );
};

export default Toolbar;