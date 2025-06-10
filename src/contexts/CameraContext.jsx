import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  // State برای دوربین‌ها
  const [cameras, setCameras] = useState({
    basler: { currentFrame: null, isConnected: false, lastUpdate: 0 },
    monitoring: { currentFrame: null, isConnected: false, lastUpdate: 0 }
  });

  // State برای ابزارها
  const [activeTool, setActiveTool] = useState(null);

  // State برای نقاشی
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // State برای تنظیمات تصویر
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    zoom: 1,
    grayscale: false,
    crop: null,
    panOffset: { x: 0, y: 0 }
  });

  // State برای موقعیت ماوس
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // State برای تاریخچه تغییرات
  const [history, setHistory] = useState([]);

  // State برای WebSocket
  const [wsStatus, setWsStatus] = useState('disconnected');

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:12345');
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setWsStatus('connected');
      setCameras(prev => ({
        ...prev,
        basler: { ...prev.basler, isConnected: true },
        monitoring: { ...prev.monitoring, isConnected: true }
      }));
      console.log('WebSocket متصل شد');
    };

    ws.onmessage = (event) => {
      try {
        const message = event.data;
        if (typeof message === 'string' && message.startsWith('response:')) {
          console.log('Response:', message.slice(9));
          return;
        }
        if (typeof message !== 'string') return;

        const colonIndex = message.indexOf(':');
        if (colonIndex === -1) return;

        const channel = message.substring(0, colonIndex);
        const base64Data = message.substring(colonIndex + 1);
        if (!base64Data) return;

        const frameData = `data:image/jpeg;base64,${base64Data}`;
        setCameras(prev => ({
          ...prev,
          [channel]: {
            currentFrame: frameData,
            isConnected: true,
            lastUpdate: Date.now()
          }
        }));
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      setCameras(prev => ({
        ...prev,
        basler: { ...prev.basler, isConnected: false },
        monitoring: { ...prev.monitoring, isConnected: false }
      }));
      console.log('WebSocket قطع شد');
    };

    return () => ws.close();
  }, []);

  // فعال‌سازی ابزار
  const applyTool = useCallback((tool) => {
    setActiveTool(tool);
    console.log(`ابزار: ${tool}`);
  }, []);

  // شروع نقاشی یا کراپ
  const startDrawing = useCallback((x, y) => {
    if (!activeTool || activeTool === 'pan') return;
    if (activeTool === 'crop' && imageSettings.crop) {
      // غیرفعال کردن کراپ با کلیک
      setImageSettings(prev => ({ ...prev, crop: null }));
      setActiveTool(null);
      setHistory(prev => [...prev, { type: 'crop', action: 'remove' }]);
      return;
    }
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, [activeTool, imageSettings.crop]);

  // ادامه نقاشی یا کراپ
  const continueDrawing = useCallback((x, y) => {
    setCursorPosition({ x, y });
    if (!isDrawing || !activeTool) return;
    setCurrentPath(prev => [...prev, { x, y }]);
  }, [isDrawing, activeTool]);

  // پایان نقاشی یا کراپ
  const finishDrawing = useCallback(() => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false);
      setCurrentPath([]);
      return;
    }
    if (activeTool === 'crop') {
      const start = currentPath[0];
      const end = currentPath[currentPath.length - 1];
      const cropSettings = {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y)
      };
      setImageSettings(prev => ({ ...prev, crop: cropSettings }));
      setHistory(prev => [...prev, { type: 'crop', action: 'apply', settings: cropSettings }]);
    } else {
      const newDrawing = {
        id: Date.now(),
        tool: activeTool,
        path: currentPath
      };
      setDrawings(prev => [...prev, newDrawing]);
      setHistory(prev => [...prev, { type: 'drawing', action: 'add', drawing: newDrawing }]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, activeTool]);

  // پاک کردن نقاشی‌ها
  const clearDrawings = useCallback(() => {
    setDrawings([]);
    setCurrentPath([]);
    setIsDrawing(false);
    setImageSettings(prev => ({ ...prev, crop: null }));
    setHistory(prev => [...prev, { type: 'clear', action: 'all' }]);
  }, []);

  // تغییر تنظیمات تصویر
  const updateImageSettings = useCallback((newSettings) => {
    setImageSettings(prev => {
      const updated = { ...prev, ...newSettings };
      setHistory(history => [...history, { type: 'settings', action: 'update', settings: newSettings, prevSettings: prev }]);
      return updated;
    });
  }, []);

  // فیلتر سیاه و سفید
  const toggleGrayscale = useCallback(() => {
    setImageSettings(prev => {
      const newGrayscale = !prev.grayscale;
      setHistory(history => [...history, { type: 'grayscale', action: 'toggle', value: newGrayscale }]);
      return { ...prev, grayscale: newGrayscale };
    });
  }, []);

  // زوم
  const zoomImage = useCallback((direction) => {
    setImageSettings(prev => {
      const newZoom = direction === 'in' ? prev.zoom * 1.2 : prev.zoom / 1.2;
      const clampedZoom = Math.max(0.2, Math.min(5, newZoom));
      setHistory(history => [...history, { type: 'zoom', action: 'change', value: clampedZoom, prevValue: prev.zoom }]);
      return { ...prev, zoom: clampedZoom };
    });
  }, []);

  // جابجایی تصویر
  const panImage = useCallback((dx, dy) => {
    setImageSettings(prev => {
      const newOffset = {
        x: prev.panOffset.x + dx,
        y: prev.panOffset.y + dy
      };
      setHistory(history => [...history, { type: 'pan', action: 'move', offset: newOffset, prevOffset: prev.panOffset }]);
      return { ...prev, panOffset: newOffset };
    });
  }, []);

  // بازگشت آخرین تغییر
  const undoLastChange = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const lastChange = prev[prev.length - 1];
      const newHistory = prev.slice(0, -1);

      switch (lastChange.type) {
        case 'drawing':
          if (lastChange.action === 'add') {
            setDrawings(drawings => drawings.slice(0, -1));
          }
          break;
        case 'crop':
          if (lastChange.action === 'apply') {
            setImageSettings(settings => ({ ...settings, crop: null }));
          } else if (lastChange.action === 'remove') {
            setImageSettings(settings => ({ ...settings, crop: lastChange.settings }));
          }
          break;
        case 'grayscale':
          setImageSettings(settings => ({ ...settings, grayscale: !lastChange.value }));
          break;
        case 'zoom':
          setImageSettings(settings => ({ ...settings, zoom: lastChange.prevValue }));
          break;
        case 'settings':
          setImageSettings(settings => ({ ...settings, ...lastChange.prevSettings }));
          break;
        case 'pan':
          setImageSettings(settings => ({ ...settings, panOffset: lastChange.prevOffset }));
          break;
      }

      return newHistory;
    });
  }, []);

  const value = {
    cameras,
    activeTool,
    drawings,
    isDrawing,
    currentPath,
    imageSettings,
    cursorPosition,
    wsStatus,
    applyTool,
    startDrawing,
    continueDrawing,
    finishDrawing,
    clearDrawings,
    updateImageSettings,
    toggleGrayscale,
    zoomImage,
    panImage,
    undoLastChange
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) throw new Error('useCamera must be used within CameraProvider');
  return context;
};