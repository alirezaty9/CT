// src/contexts/CameraContext.jsx - بهینه شده برای کاهش تاخیر
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  
  // 📷 STATE برای دوربین‌ها
  const [cameras, setCameras] = useState({
    basler: {
      currentFrame: null,
      isConnected: false,
      lastUpdate: 0
    },
    monitoring: {
      currentFrame: null,
      isConnected: false,
      lastUpdate: 0
    }
  });

  // 🛠️ STATE برای ابزارهای Toolbar
  const [activeTool, setActiveTool] = useState(null);

  // 🎨 STATE برای نقاشی‌ها
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // 🎛️ STATE برای تنظیمات تصویر
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    zoom: 1,
    rotation: 0
  });

  // 📍 STATE برای موقعیت ماوس
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // 🌐 WebSocket connection بهینه شده
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  
  // بهینه‌سازی performance
  const frameBufferRef = useRef(new Map()); // cache برای frame ها
  const lastFrameTimeRef = useRef(new Map()); // آخرین زمان دریافت frame

  // 🔄 WebSocket Setup بهینه شده
  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      setWsStatus('connecting');
      console.log('🔄 اتصال سریع به WebSocket...');
      
      const ws = new WebSocket('ws://localhost:12345');
      
      // تنظیمات بهینه برای کاهش تاخیر
      ws.binaryType = 'arraybuffer';
      
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        console.log('✅ WebSocket با تاخیر کم متصل شد');
        
        setCameras(prev => ({
          basler: { ...prev.basler, isConnected: true },
          monitoring: { ...prev.monitoring, isConnected: true }
        }));

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        const now = performance.now(); // استفاده از performance.now برای دقت بالا
        
        try {
          const message = event.data;
          
          if (message.startsWith('response:')) {
            console.log('📨 Response:', message.slice(9));
            return;
          }

          const colonIndex = message.indexOf(':');
          if (colonIndex === -1) return;

          const channel = message.substring(0, colonIndex);
          const base64Data = message.substring(colonIndex + 1);
          
          if (!base64Data) return;

          // چک کردن تاخیر بین frame ها
          const lastTime = lastFrameTimeRef.current.get(channel) || 0;
          const timeDiff = now - lastTime;
          
          // اگر frame خیلی سریع آمده، skip کن (throttling)
          if (timeDiff < 16 && lastTime > 0) { // حداکثر 60 FPS
            return;
          }
          
          lastFrameTimeRef.current.set(channel, now);

          // ایجاد data URL بهینه
          const frameData = `data:image/jpeg;base64,${base64Data}`;
          
          // به‌روزرسانی state بهینه
          setCameras(prev => {
            const newState = { ...prev };
            
            if (channel === 'basler') {
              newState.basler = {
                currentFrame: frameData,
                isConnected: true,
                lastUpdate: Date.now()
              };
            } else if (channel === 'monitoring') {
              newState.monitoring = {
                currentFrame: frameData,
                isConnected: true,
                lastUpdate: Date.now()
              };
            }
            
            return newState;
          });

          // console.log برای debug (اختیاری)
          if (timeDiff > 100) { // فقط اگر تاخیر زیاد باشد
            console.log(`⚠️ High latency for ${channel}: ${timeDiff.toFixed(1)}ms`);
          }
          
        } catch (error) {
          console.error('❌ خطا در پردازش سریع پیام:', error);
        }
      };

      ws.onclose = (event) => {
        setWsStatus('disconnected');
        console.log('❌ WebSocket قطع شد');
        
        setCameras(prev => ({
          basler: { ...prev.basler, isConnected: false },
          monitoring: { ...prev.monitoring, isConnected: false }
        }));

        // اتصال مجدد سریع‌تر
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, 1000); // 1 ثانیه به جای 3 ثانیه
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWsStatus('disconnected');
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // 🔄 FUNCTION: deprecated
  const updateBaslerFrame = useCallback(() => {
    console.warn('⚠️ updateBaslerFrame is deprecated');
  }, []);

  // 🔧 FUNCTION: فعال‌سازی ابزار
  const applyTool = useCallback((toolName) => {
    setActiveTool(toolName);
    console.log(`🔧 ابزار فعال شد: ${toolName}`);
  }, []);

  // 🖱️ FUNCTION: شروع نقاشی (بهینه شده)
  const startDrawing = useCallback((x, y) => {
    if (!activeTool || activeTool === 'move') return;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, [activeTool]);

  // 🖱️ FUNCTION: ادامه نقاشی (بهینه شده با throttling)
  const continueDrawing = useCallback((x, y) => {
    setCursorPosition({ x, y });
    
    if (!isDrawing || !activeTool) return;
    
    // throttling برای performance بهتر
    setCurrentPath(prev => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
        if (distance < 2) return prev; // skip اگر فاصله کم باشد
      }
      return [...prev, { x, y }];
    });
  }, [isDrawing, activeTool]);

  // 🖱️ FUNCTION: پایان نقاشی
  const finishDrawing = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return;
    
    const newDrawing = {
      id: Date.now(),
      tool: activeTool,
      path: currentPath,
      settings: { ...imageSettings }
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, activeTool, imageSettings]);

  // 🗑️ FUNCTION: پاک کردن همه نقاشی‌ها
  const clearDrawings = useCallback(() => {
    setDrawings([]);
    setCurrentPath([]);
    setIsDrawing(false);
  }, []);

  // 🎛️ FUNCTION: تغییر تنظیمات تصویر
  const updateImageSettings = useCallback((newSettings) => {
    setImageSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 📦 Value object بهینه شده
  const value = {
    cameras,
    activeTool,
    drawings,
    isDrawing,
    currentPath,
    imageSettings,
    cursorPosition,
    wsStatus,
    
    updateBaslerFrame,
    applyTool,
    startDrawing,
    continueDrawing,
    finishDrawing,
    clearDrawings,
    updateImageSettings,
    setActiveTool
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within CameraProvider');
  }
  return context;
};