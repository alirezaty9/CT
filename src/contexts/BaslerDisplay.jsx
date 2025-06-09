import React, { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '../../contexts/CameraContext';

const BaslerDisplay = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
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
    finishDrawing
  } = useCamera();

  // رسم تصویر اصلی + نقاشی‌ها روی Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // اعمال فیلترها
    ctx.filter = `
      brightness(${imageSettings.brightness}%) 
      contrast(${imageSettings.contrast}%) 
      saturate(${imageSettings.saturation}%)
    `;

    // رسم تصویر
    if (cameras.basler.currentFrame) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // reset filter برای نقاشی‌ها
    ctx.filter = 'none';

    // رسم نقاشی‌های تمام شده
    drawings.forEach(drawing => {
      drawPath(ctx, drawing.path, drawing.tool);
    });

    // رسم نقاشی در حال انجام
    if (isDrawing && currentPath.length > 0) {
      drawPath(ctx, currentPath, activeTool);
    }
  }, [cameras.basler.currentFrame, drawings, isDrawing, currentPath, activeTool, imageSettings]);

  // تابع کمکی برای رسم مسیرها
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
        if (path.length >= 2) {
          const start = path[0];
          const end = path[path.length - 1];
          ctx.strokeStyle = '#00ff00';
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

  // Mouse events
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startDrawing(x, y);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    continueDrawing(x, y);
  };

  const handleMouseUp = () => {
    finishDrawing();
  };

  // Update image when frame changes
  useEffect(() => {
    if (cameras.basler.currentFrame && imageRef.current) {
      imageRef.current.src = cameras.basler.currentFrame;
      imageRef.current.onload = redrawCanvas;
    }
  }, [cameras.basler.currentFrame, redrawCanvas]);

  // Redraw when drawings change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-black rounded-lg overflow-hidden relative"
    >
      {/* تصویر مخفی برای load کردن */}
      <img
        ref={imageRef}
        style={{ display: 'none' }}
        alt="Basler frame"
      />
      
      {/* Canvas اصلی */}
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
      
      {/* نمایش موقعیت cursor */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-mono">
        X: {Math.round(cursorPosition.x)} | Y: {Math.round(cursorPosition.y)}
      </div>
      
      {/* نمایش ابزار فعال */}
      {activeTool && (
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm">
          {activeTool}
        </div>
      )}
      
      {/* نمایش وضعیت اتصال */}
      <div className={`absolute bottom-2 left-2 w-3 h-3 rounded-full ${
        cameras.basler.isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>
  );
};

export default BaslerDisplay;