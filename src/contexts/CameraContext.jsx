// src/contexts/CameraContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  
  // 📷 STATE برای دوربین‌ها
  const [cameras, setCameras] = useState({
    // دوربین باسلر (5 FPS با Canvas)
    basler: {
      currentFrame: null,        // ✅ آخرین عکس دریافتی از باسلر
      isConnected: false,        // ✅ آیا متصل است؟
      streamUrl: 'ws://localhost:8080/basler'  // ✅ آدرس WebSocket
    },
    // دوربین مانیتورینگ (RTSP)
    monitoring: {
      streamUrl: 'rtsp://192.168.1.100:554/stream',  // ✅ آدرس RTSP
      isConnected: false         // ✅ آیا متصل است؟
    }
  });

  // 🛠️ STATE برای ابزارهای Toolbar
  const [activeTool, setActiveTool] = useState(null);  // ✅ کدوم ابزار فعاله؟ (brush, eraser, circle...)

  // 🎨 STATE برای نقاشی‌ها
  const [drawings, setDrawings] = useState([]);        // ✅ لیست همه نقاشی‌های کامل شده
  const [isDrawing, setIsDrawing] = useState(false);   // ✅ آیا الان داره نقاشی می‌کشه؟
  const [currentPath, setCurrentPath] = useState([]); // ✅ نقاشی در حال انجام

  // 🎛️ STATE برای تنظیمات تصویر
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,   // ✅ روشنایی (0-200)
    contrast: 100,     // ✅ کنتراست (0-200) 
    saturation: 100,   // ✅ اشباع رنگ (0-200)
    zoom: 1,           // ✅ زوم (0.5 - 5)
    rotation: 0        // ✅ چرخش (0, 90, 180, 270)
  });

  // 📍 STATE برای موقعیت ماوس
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // 🔄 FUNCTION: دریافت frame جدید از باسلر
  const updateBaslerFrame = useCallback((frameData) => {
    setCameras(prev => ({
      ...prev,
      basler: {
        ...prev.basler,
        currentFrame: frameData,  // ✅ عکس جدید رو ذخیره می‌کنه
        isConnected: true         // ✅ نشون میده که متصله
      }
    }));
  }, []);

  // 🔧 FUNCTION: فعال‌سازی ابزار از Toolbar
  const applyTool = useCallback((toolName) => {
    setActiveTool(toolName);  // ✅ ابزار انتخاب شده رو ذخیره می‌کنه
    console.log(`🔧 ابزار فعال شد: ${toolName}`);
  }, []);

  // 🖱️ FUNCTION: شروع نقاشی (Mouse Down)
  const startDrawing = useCallback((x, y) => {
    if (!activeTool || activeTool === 'move') return;  // ✅ اگه ابزاری انتخاب نشده، کاری نکن
    
    setIsDrawing(true);           // ✅ شروع نقاشی
    setCurrentPath([{ x, y }]);   // ✅ اولین نقطه رو ذخیره کن
  }, [activeTool]);

  // 🖱️ FUNCTION: ادامه نقاشی (Mouse Move)  
  const continueDrawing = useCallback((x, y) => {
    setCursorPosition({ x, y });  // ✅ همیشه موقعیت ماوس رو update کن
    
    if (!isDrawing || !activeTool) return;  // ✅ اگه داره نقاشی نمی‌کشه، فقط cursor رو update کن
    
    setCurrentPath(prev => [...prev, { x, y }]);  // ✅ نقطه جدید رو به مسیر اضافه کن
  }, [isDrawing, activeTool]);

  // 🖱️ FUNCTION: پایان نقاشی (Mouse Up)
  const finishDrawing = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return;  // ✅ اگه داره نقاشی نمی‌کشه، کاری نکن
    
    // ✅ نقاشی کامل شده رو به لیست اضافه کن
    const newDrawing = {
      id: Date.now(),              // ✅ ID یکتا
      tool: activeTool,            // ✅ کدوم ابزار استفاده شده
      path: currentPath,           // ✅ مسیر کشیده شده
      settings: { ...imageSettings }  // ✅ تنظیمات تصویر در اون لحظه
    };
    
    setDrawings(prev => [...prev, newDrawing]);  // ✅ به لیست نقاشی‌ها اضافه کن
    setIsDrawing(false);                         // ✅ پایان نقاشی
    setCurrentPath([]);                          // ✅ مسیر فعلی رو پاک کن
  }, [isDrawing, currentPath, activeTool, imageSettings]);

  // 🗑️ FUNCTION: پاک کردن همه نقاشی‌ها
  const clearDrawings = useCallback(() => {
    setDrawings([]);       // ✅ همه نقاشی‌ها رو پاک کن
    setCurrentPath([]);    // ✅ نقاشی فعلی رو پاک کن
    setIsDrawing(false);   // ✅ حالت نقاشی رو خاموش کن
  }, []);

  // 🎛️ FUNCTION: تغییر تنظیمات تصویر
  const updateImageSettings = useCallback((newSettings) => {
    setImageSettings(prev => ({ ...prev, ...newSettings }));  // ✅ تنظیمات جدید رو merge کن
  }, []);

  // 📦 همه چیزی که به بقیه کامپوننت‌ها میدیم
  const value = {
    // STATE ها
    cameras,              // ✅ اطلاعات دوربین‌ها
    activeTool,           // ✅ ابزار فعال
    drawings,             // ✅ نقاشی‌های تمام شده
    isDrawing,            // ✅ آیا داره نقاشی می‌کشه؟
    currentPath,          // ✅ نقاشی در حال انجام
    imageSettings,        // ✅ تنظیمات تصویر
    cursorPosition,       // ✅ موقعیت ماوس
    
    // FUNCTION ها
    updateBaslerFrame,    // ✅ برای دریافت frame جدید
    applyTool,           // ✅ برای Toolbar
    startDrawing,        // ✅ برای Canvas
    continueDrawing,     // ✅ برای Canvas  
    finishDrawing,       // ✅ برای Canvas
    clearDrawings,       // ✅ برای پاک کردن
    updateImageSettings, // ✅ برای تنظیمات
    setActiveTool        // ✅ برای تغییر مستقیم ابزار
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

// 🪝 HOOK برای استفاده در کامپوننت‌ها
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within CameraProvider');
  }
  return context;
};