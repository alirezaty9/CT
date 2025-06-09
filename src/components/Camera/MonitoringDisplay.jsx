// src/components/Camera/MonitoringDisplay.jsx
import React, { useRef, useEffect } from 'react';
import { useCamera } from '../../contexts/CameraContext';

const MonitoringDisplay = () => {
  const videoRef = useRef(null);        // ✅ REF برای video element
  const { cameras } = useCamera();      // ✅ دریافت اطلاعات دوربین‌ها از Context

  // 🔄 EFFECT: وقتی URL تغییر می‌کنه، ویدیو رو به آدرس جدید وصل کن
  useEffect(() => {
    if (videoRef.current && cameras.monitoring.streamUrl) {
      videoRef.current.src = cameras.monitoring.streamUrl;  // ✅ آدرس RTSP رو set کن
      // ✅ مرورگر خودش مدیریت RTSP رو انجام میده
    }
  }, [cameras.monitoring.streamUrl]);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      {/* 📹 Video element برای RTSP stream */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"  // ✅ ویدیو رو به سایز container fit کن
        autoPlay                                  // ✅ خودکار پخش شه
        muted                                     // ✅ صدا خاموش
        playsInline                              // ✅ در iOS نه fullscreen بشه
      />
      
      {/* 🏷️ برچسب نام دوربین */}
      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
        Monitoring Camera
      </div>
    </div>
  );
};

export default MonitoringDisplay;