// src/components/Camera/BaslerDisplay.jsx
import React, { useRef, useEffect, useCallback } from 'react';
import { useCamera } from '../../contexts/CameraContext';

const BaslerDisplay = () => {
  // 📋 REF ها - برای دسترسی مستقیم به DOM elements
  const canvasRef = useRef(null);      // ✅ Canvas اصلی که همه چیز روش نقاشی میشه
  const imageRef = useRef(null);       // ✅ Image element مخفی برای load کردن frames
  const containerRef = useRef(null);   // ✅ Container برای محاسبه سایز
  
  // 🔗 دریافت اطلاعات از Context
  const {
    cameras,           // ✅ اطلاعات دوربین‌ها (فریم فعلی، وضعیت اتصال)
    activeTool,        // ✅ ابزار انتخاب شده از Toolbar
    drawings,          // ✅ لیست نقاشی‌های تمام شده
    isDrawing,         // ✅ آیا الان داره نقاشی می‌کشه؟
    currentPath,       // ✅ نقاشی در حال انجام
    imageSettings,     // ✅ تنظیمات تصویر (brightness, contrast, ...)
    cursorPosition,    // ✅ موقعیت ماوس
    startDrawing,      // ✅ تابع شروع نقاشی
    continueDrawing,   // ✅ تابع ادامه نقاشی
    finishDrawing      // ✅ تابع پایان نقاشی
  } = useCamera();

  // 🎨 FUNCTION: رسم همه چیز روی Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;  // ✅ اگه Canvas یا Image آماده نیست، کاری نکن

    const ctx = canvas.getContext('2d');        // ✅ گرفتن context برای نقاشی
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // ✅ پاک کردن Canvas

    // 🎛️ اعمال فیلترهای تصویر
    ctx.filter = `
      brightness(${imageSettings.brightness}%) 
      contrast(${imageSettings.contrast}%) 
      saturate(${imageSettings.saturation}%)
    `;

    // 🖼️ رسم تصویر اصلی از باسلر
    if (cameras.basler.currentFrame) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);  // ✅ تصویر رو به سایز Canvas کش میده
    }

    // 🎨 reset فیلتر برای نقاشی‌ها (نقاشی‌ها تحت تاثیر فیلتر نباشن)
    ctx.filter = 'none';

    // ✏️ رسم همه نقاشی‌های تمام شده
    drawings.forEach(drawing => {
      drawPath(ctx, drawing.path, drawing.tool);  // ✅ هر نقاشی رو با ابزار مخصوصش بکش
    });

    // 📝 رسم نقاشی در حال انجام
    if (isDrawing && currentPath.length > 0) {
      drawPath(ctx, currentPath, activeTool);  // ✅ نقاشی فعلی رو نشون بده
    }
  }, [cameras.basler.currentFrame, drawings, isDrawing, currentPath, activeTool, imageSettings]);

  // 🖌️ FUNCTION: رسم یک مسیر با ابزار مشخص
  const drawPath = (ctx, path, tool) => {
    if (path.length === 0) return;  // ✅ اگه مسیر خالیه، کاری نکن

    ctx.beginPath();                 // ✅ شروع یک مسیر جدید
    ctx.moveTo(path[0].x, path[0].y); // ✅ رفتن به اولین نقطه

    switch (tool) {
      case 'brush':  // 🖌️ قلم قرمز
        ctx.strokeStyle = '#ff0000';   // ✅ رنگ قرمز
        ctx.lineWidth = 3;             // ✅ ضخامت 3 پیکسل
        path.forEach(point => ctx.lineTo(point.x, point.y));  // ✅ خط کشیدن بین نقاط
        ctx.stroke();                  // ✅ رسم نهایی
        break;
        
      case 'eraser':  // 🧽 پاک‌کن
        ctx.globalCompositeOperation = 'destination-out';  // ✅ حالت پاک کردن
        ctx.lineWidth = 10;                                // ✅ ضخامت پاک‌کن
        path.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';      // ✅ برگشت به حالت عادی
        break;
        
      case 'rectangle':  // ⬜ مستطیل سبز
        if (path.length >= 2) {  // ✅ حداقل 2 نقطه لازمه
          const start = path[0];           // ✅ نقطه شروع
          const end = path[path.length - 1]; // ✅ نقطه پایان
          ctx.strokeStyle = '#00ff00';     // ✅ رنگ سبز
          ctx.lineWidth = 2;
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);  // ✅ رسم مستطیل
        }
        break;
        
      case 'circle':  // ⭕ دایره آبی
        if (path.length >= 2) {
          const start = path[0];
          const end = path[path.length - 1];
          // ✅ محاسبه شعاع بر اساس فاصله دو نقطه
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.strokeStyle = '#0000ff';     // ✅ رنگ آبی
          ctx.lineWidth = 2;
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);  // ✅ رسم دایره
          ctx.stroke();
        }
        break;
    }
  };

  // 🖱️ EVENT HANDLERS برای ماوس

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();  // ✅ گرفتن موقعیت Canvas در صفحه
    const x = e.clientX - rect.left;   // ✅ تبدیل موقعیت ماوس به موقعیت روی Canvas
    const y = e.clientY - rect.top;
    startDrawing(x, y);                // ✅ شروع نقاشی با این موقعیت
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    continueDrawing(x, y);             // ✅ ادامه نقاشی یا update کردن موقعیت ماوس
  };

  const handleMouseUp = () => {
    finishDrawing();                   // ✅ پایان نقاشی
  };

  // 🔄 EFFECT: وقتی frame جدید میاد، تصویر رو update کن
  useEffect(() => {
    if (cameras.basler.currentFrame && imageRef.current) {
      imageRef.current.src = cameras.basler.currentFrame;  // ✅ frame جدید رو set کن
      imageRef.current.onload = redrawCanvas;              // ✅ وقتی load شد، Canvas رو دوباره بکش
    }
  }, [cameras.basler.currentFrame, redrawCanvas]);

  // 🔄 EFFECT: وقتی نقاشی‌ها تغییر می‌کنن، Canvas رو دوباره بکش
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-black rounded-lg overflow-hidden relative"
    >
      {/* 🖼️ تصویر مخفی برای load کردن frames */}
      <img
        ref={imageRef}
        style={{ display: 'none' }}  // ✅ مخفی - فقط برای load کردن استفاده میشه
        alt="Basler frame"
      />
      
      {/* 🎨 Canvas اصلی */}
      <canvas
        ref={canvasRef}
        width={800}                    // ✅ عرض Canvas
        height={600}                   // ✅ ارتفاع Canvas
        className="w-full h-full object-contain cursor-crosshair"  // ✅ cursor نشان‌گر برای نقاشی
        onMouseDown={handleMouseDown}   // ✅ شروع نقاشی
        onMouseMove={handleMouseMove}   // ✅ ادامه نقاشی
        onMouseUp={handleMouseUp}       // ✅ پایان نقاشی
        onMouseLeave={handleMouseUp}    // ✅ اگه ماوس از Canvas خارج شد، نقاشی رو تمام کن
      />
      
      {/* 📍 نمایش موقعیت ماوس */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-mono">
        X: {Math.round(cursorPosition.x)} | Y: {Math.round(cursorPosition.y)}
      </div>
      
      {/* 🔧 نمایش ابزار فعال */}
      {activeTool && (
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm">
          {activeTool}
        </div>
      )}
      
      {/* 🔴 نمایش وضعیت اتصال */}
      <div className={`absolute bottom-2 left-2 w-3 h-3 rounded-full ${
        cameras.basler.isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>
  );
};

export default BaslerDisplay;