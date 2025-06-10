// src/components/Camera/MonitoringDisplay.jsx
import React, { useRef, useEffect } from 'react';
import { useCamera } from '../../contexts/CameraContext';

const MonitoringDisplay = () => {
  const imgRef = useRef(null);
  const { cameras, wsStatus } = useCamera();      // ✅ دریافت اطلاعات دوربین‌ها و وضعیت WebSocket

  // 🔄 EFFECT: وقتی frame جدید میاد، تصویر رو update کن
  useEffect(() => {
    if (imgRef.current && cameras.monitoring.currentFrame) {
      imgRef.current.src = cameras.monitoring.currentFrame;
    }
  }, [cameras.monitoring.currentFrame]);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      {/* 📹 Image element برای نمایش stream */}
      <img
        ref={imgRef}
        className="w-full h-full object-contain"  // ✅ تصویر رو به سایز container fit کن
        alt="Monitoring Camera"
        style={{ display: cameras.monitoring.currentFrame ? 'block' : 'none' }}
      />
      
      {/* 🔄 Loading state */}
      {!cameras.monitoring.currentFrame && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-sm">
            {wsStatus === 'connecting' ? 'اتصال به دوربین...' : 
             wsStatus === 'connected' ? 'در انتظار تصویر...' : 
             'قطع ارتباط با دوربین'}
          </div>
        </div>
      )}
      
      {/* 🏷️ برچسب نام دوربین */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
        Monitoring Camera
      </div>
      
      {/* 🔴 نمایش وضعیت اتصال */}
      <div className={`absolute bottom-2 left-2 w-3 h-3 rounded-full ${
        cameras.monitoring.isConnected && cameras.monitoring.currentFrame ? 'bg-green-500' : 'bg-red-500'
      }`} />
      
      {/* 📊 نمایش FPS (اختیاری) */}
      {cameras.monitoring.currentFrame && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          RTSP Live
        </div>
      )}
    </div>
  );
};

export default MonitoringDisplay;