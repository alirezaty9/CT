import { BaseTool } from '../base/BaseTool.js';
import { Eraser } from 'lucide-react';

/**
 * ابزار پاک‌کن - برای پاک کردن بخش‌هایی از نقاشی‌ها
 * این ابزار خطوط موجود را شناسایی و پاک می‌کند
 */
export class EraserTool extends BaseTool {
  constructor() {
    super('eraser', Eraser, 'پاک‌کن', '#ffffff', 10);
    
    // تنظیمات پاک‌کن
    this.eraserRadius = 15; // شعاع پاک‌کن
    this.minEraserRadius = 5;
    this.maxEraserRadius = 50;
    this.eraserOpacity = 0.8; // شفافیت پیش‌نمایش
    
    // متغیرهای داخلی
    this.currentPosition = null;
    this.isErasing = false;
  }

  /**
   * شروع پاک کردن
   */
  startDrawing(coords, settings) {
    this.currentPosition = coords;
    this.isErasing = true;
    
    return {
      tool: this.name,
      path: [coords],
      color: this.color,
      lineWidth: this.lineWidth,
      eraserRadius: this.eraserRadius,
      settings: { ...settings },
      type: 'eraser' // نوع خاص برای پاک‌کن
    };
  }

  /**
   * ادامه پاک کردن
   */
  continueDrawing(coords, currentPath) {
    this.currentPosition = coords;
    
    return {
      ...currentPath,
      path: [...currentPath.path, coords]
    };
  }

  /**
   * به‌روزرسانی موقعیت ماوس (برای نمایش پیش‌نمایش)
   */
  updateMousePosition(coords) {
    this.currentPosition = coords;
  }

  /**
   * پایان پاک کردن
   */
  finishDrawing(currentPath) {
    this.currentPosition = null;
    this.isErasing = false;
    
    return {
      id: Date.now(),
      ...currentPath,
      type: 'eraser'
    };
  }

  /**
   * رسم پاک‌کن - این متد نباید چیزی رسم کند
   * عملیات اصلی پاک کردن در CameraContext انجام می‌شود
   */
  render(ctx, drawing, settings) {
    // پاک‌کن نباید در canvas نهایی رسم شود
    // عملیات پاک کردن در سطح بالاتر انجام می‌شود
    return;
  }

  /**
   * پیش‌نمایش پاک‌کن
   */
  renderPreview(ctx, currentPath, settings) {
    // نمایش مسیر پاک‌کن در حین رسم
    if (currentPath && currentPath.path && currentPath.path.length > 0) {
      const transformedPath = this.transformPath(currentPath.path, settings);
      const radius = currentPath.eraserRadius || this.eraserRadius;

      ctx.save();
      
      // نمایش مسیر پاک‌کن با دایره‌های قرمز شفاف
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      
      transformedPath.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      
      ctx.restore();
    }

    // نمایش دایره پیش‌نمایش در موقعیت فعلی ماوس
    if (this.currentPosition) {
      ctx.save();
      
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.arc(
        this.currentPosition.x, 
        this.currentPosition.y, 
        this.eraserRadius, 
        0, 
        Math.PI * 2
      );
      ctx.stroke();
      
      // نمایش نقطه مرکز
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(
        this.currentPosition.x, 
        this.currentPosition.y, 
        3, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.restore();
    }
  }

  /**
   * تنظیم اندازه پاک‌کن
   */
  setEraserRadius(radius) {
    this.eraserRadius = Math.max(
      this.minEraserRadius, 
      Math.min(this.maxEraserRadius, radius)
    );
  }

  /**
   * دریافت اندازه پاک‌کن
   */
  getEraserRadius() {
    return this.eraserRadius;
  }

  /**
   * بررسی اینکه آیا نقطه‌ای در محدوده پاک‌کن است
   */
  isPointInEraserRange(point, eraserPoint, radius) {
    const distance = Math.sqrt(
      Math.pow(point.x - eraserPoint.x, 2) + 
      Math.pow(point.y - eraserPoint.y, 2)
    );
    return distance <= radius;
  }

  /**
   * تنظیمات اضافی پاک‌کن
   */
  getSettings() {
    return {
      ...super.getSettings(),
      eraserRadius: this.eraserRadius,
      minEraserRadius: this.minEraserRadius,
      maxEraserRadius: this.maxEraserRadius
    };
  }


  
  
  /**
   * بررسی اینکه آیا drawing با مسیر پاک‌کن تداخل دارد
   */
  doesDrawingIntersectWithEraser(drawing, eraserPath, eraserRadius) {
    if (!drawing.path || !eraserPath || drawing.path.length === 0 || eraserPath.length === 0) {
      return false;
    }

    // بررسی تداخل هر نقطه از drawing با هر نقطه از eraser
    for (const drawingPoint of drawing.path) {
      for (const eraserPoint of eraserPath) {
        if (this.isPointInEraserRange(drawingPoint, eraserPoint, eraserRadius)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * بررسی تداخل خط با دایره پاک‌کن
   */
  doesLineIntersectWithCircle(lineStart, lineEnd, circleCenter, radius) {
    // فاصله نقطه از خط
    const A = lineEnd.x - lineStart.x;
    const B = lineEnd.y - lineStart.y;
    const C = lineStart.x - circleCenter.x;
    const D = lineStart.y - circleCenter.y;

    const a = A * A + B * B;
    const b = 2 * (A * C + B * D);
    const c = C * C + D * D - radius * radius;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return false;
    }

    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }

  /**
   * حذف بخش‌هایی از drawing که با پاک‌کن تداخل دارند
   */
  erasePartsFromDrawing(drawing, eraserPath, eraserRadius) {
    if (!drawing.path || drawing.path.length === 0) {
      return drawing;
    }

    const remainingPath = [];
    let currentSegment = [];

    for (let i = 0; i < drawing.path.length; i++) {
      const point = drawing.path[i];
      let shouldErase = false;

      // بررسی اینکه آیا این نقطه باید پاک شود
      for (const eraserPoint of eraserPath) {
        if (this.isPointInEraserRange(point, eraserPoint, eraserRadius)) {
          shouldErase = true;
          break;
        }
      }

      if (!shouldErase) {
        currentSegment.push(point);
      } else {
        // اگر segment فعلی نقاط دارد، آن را اضافه کن
        if (currentSegment.length > 1) {
          remainingPath.push([...currentSegment]);
        }
        currentSegment = [];
      }
    }

    // اضافه کردن segment آخر
    if (currentSegment.length > 1) {
      remainingPath.push([...currentSegment]);
    }

    // اگر هیچ بخشی باقی نمانده، drawing کامل پاک شده
    if (remainingPath.length === 0) {
      return null;
    }

    // اگر فقط یک segment باقی مانده، drawing اصلی را با path جدید برگردان
    if (remainingPath.length === 1) {
      return {
        ...drawing,
        path: remainingPath[0]
      };
    }

    // اگر چندین segment باقی مانده، آن‌ها را به drawing های جداگانه تبدیل کن
    return remainingPath.map((segment, index) => ({
      ...drawing,
      id: `${drawing.id}_${index}`,
      path: segment
    }));
  }

  /**
   * تنظیم پارامترهای پاک‌کن
   */
  setEraserSettings(settings) {
    if (settings.eraserRadius !== undefined) {
      this.setEraserRadius(settings.eraserRadius);
    }
    if (settings.minEraserRadius !== undefined) {
      this.minEraserRadius = Math.max(1, settings.minEraserRadius);
    }
    if (settings.maxEraserRadius !== undefined) {
      this.maxEraserRadius = Math.max(this.minEraserRadius, settings.maxEraserRadius);
    }
  }
}
