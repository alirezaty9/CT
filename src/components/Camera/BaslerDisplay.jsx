import React, { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '../../contexts/CameraContext';

const BaslerDisplay = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const panStartRef = useRef(null);

  const {
    cameras,
    activeTool,
    drawings,
    isDrawing,
    currentPath,
    imageSettings,
    cursorPosition,
    startDrawing,
    continueDrawing,
    finishDrawing,
    wsStatus,
    panImage
  } = useCamera();

  // رسم روی Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // اعمال فیلترها
    ctx.filter = [
      `brightness(${imageSettings.brightness}%)`,
      `contrast(${imageSettings.contrast}%)`,
      `saturate(${imageSettings.saturation}%)`,
      imageSettings.grayscale ? 'grayscale(100%)' : ''
    ].filter(Boolean).join(' ');

    // رسم تصویر
    if (cameras.basler.currentFrame) {
      ctx.save();
      ctx.translate(imageSettings.panOffset.x, imageSettings.panOffset.y);
      ctx.scale(imageSettings.zoom, imageSettings.zoom);

      if (imageSettings.crop) {
        const { x, y, width, height } = imageSettings.crop;
        ctx.drawImage(image, x, y, width, height, x, y, width, height);
      } else {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }

    // Reset فیلتر برای نقاشی
    ctx.filter = 'none';

    // رسم نقاشی‌های قبلی
    drawings.forEach(drawing => drawPath(ctx, drawing.path, drawing.tool));

    // رسم نقاشی در حال انجام
    if (isDrawing && currentPath.length > 0) {
      drawPath(ctx, currentPath, activeTool);
    }
  }, [cameras.basler.currentFrame, drawings, isDrawing, currentPath, activeTool, imageSettings]);

  // رسم مسیر
  const drawPath = (ctx, path, tool) => {
    if (path.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    switch (tool) {
      case 'brush':
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        path.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 10;
        path.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        break;
      case 'rectangle':
      case 'crop':
        if (path.length >= 2) {
          const start = path[0];
          const end = path[path.length - 1];
          ctx.strokeStyle = tool === 'crop' ? '#ffff00' : '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
        break;
      case 'circle':
        if (path.length >= 2) {
          const start = path[0];
          const end = path[path.length - 1];
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.strokeStyle = '#0000ff';
          ctx.lineWidth = 2;
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
    }
  };

  // مدیریت رویدادهای ماوس
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'pan' && imageSettings.zoom > 1) {
      panStartRef.current = { x, y };
      canvas.style.cursor = 'grabbing';
    } else {
      startDrawing(x, y);
    }
  }, [activeTool, imageSettings.zoom, startDrawing]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'pan' && panStartRef.current && imageSettings.zoom > 1) {
      const dx = x - panStartRef.current.x;
      const dy = y - panStartRef.current.y;
      panImage(dx, dy);
      panStartRef.current = { x, y };
    } else {
      continueDrawing(x, y);
    }
  }, [activeTool, imageSettings.zoom, panImage, continueDrawing]);

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'pan') {
      panStartRef.current = null;
      canvasRef.current.style.cursor = 'crosshair';
    } else {
      finishDrawing();
    }
  }, [activeTool, finishDrawing]);

  // به‌روزرسانی تصویر
  useEffect(() => {
    if (cameras.basler.currentFrame && imageRef.current) {
      imageRef.current.src = cameras.basler.currentFrame;
      imageRef.current.onload = redrawCanvas;
    }
  }, [cameras.basler.currentFrame, redrawCanvas]);

  // به‌روزرسانی Canvas
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // فرمت زمان
  const formatLastUpdate = useCallback((timestamp) => {
    if (!timestamp) return 'No data';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      <img ref={imageRef} style={{ display: 'none' }} alt="Basler frame" />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full object-contain cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {!cameras.basler.currentFrame && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-sm">
            {wsStatus === 'connecting' ? 'اتصال به باسلر...' :
             wsStatus === 'connected' ? 'در انتظار تصویر باسلر...' :
             'قطع ارتباط با باسلر'}
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-mono">
        X: {Math.round(cursorPosition.x)} | Y: {Math.round(cursorPosition.y)}
      </div>
      {activeTool && (
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm">
          {activeTool}
        </div>
      )}
      <div className={`absolute bottom-2 left-2 w-3 h-3 rounded-full ${
        cameras.basler.isConnected && cameras.basler.currentFrame ? 'bg-green-500' : 'bg-red-500'
      }`} />
      {cameras.basler.lastUpdate && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {formatLastUpdate(cameras.basler.lastUpdate)}
        </div>
      )}
    </div>
  );
};

export default BaslerDisplay;