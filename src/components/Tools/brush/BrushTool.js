import { BaseTool } from '../base/BaseTool.js';
import { Brush } from 'lucide-react';

/**
 * ابزار برس پیشرفته - برای رسم آزاد با کیفیت بالا
 * شامل smooth curves، تنظیم فشار و بهینه‌سازی عملکرد
 */
export class BrushTool extends BaseTool {
  constructor() {
    super('brush', Brush, 'برس', '#ff0000', 3);
    
    // تنظیمات پیشرفته برس
    this.smoothing = 0.5; // میزان نرمی خط (0-1)
    this.minDistance = 3; // حداقل فاصله بین نقاط
    this.maxDistance = 15; // حداکثر فاصله بین نقاط
    this.pressureSensitivity = 0.3; // حساسیت به سرعت (0-1)
    this.minLineWidth = 1; // حداقل ضخامت خط
    this.maxLineWidth = 8; // حداکثر ضخامت خط
    
    // متغیرهای داخلی
    this.lastPoint = null;
    this.lastVelocity = 0;
    this.smoothedPoints = [];
  }

  /**
   * شروع رسم با برس
   */
  startDrawing(coords, settings) {
    // ریست کردن متغیرهای داخلی
    this.lastPoint = coords;
    this.lastVelocity = 0;
    this.smoothedPoints = [coords];
    
    return {
      tool: this.name,
      path: [coords],
      smoothedPath: [coords],
      color: this.color,
      lineWidth: this.lineWidth,
      settings: { ...settings },
      velocities: [0], // ذخیره سرعت برای هر نقطه
      pressures: [1] // فشار برای هر نقطه
    };
  }

  /**
   * ادامه رسم با کنترل فاصله و نرمی
   */
  continueDrawing(coords, currentPath) {
    if (!this.lastPoint) return currentPath;

    // محاسبه فاصله از آخرین نقطه
    const distance = this.calculateDistance(this.lastPoint, coords);
    
    // اگر فاصله کم است، نقطه را اضافه نکن
    if (distance < this.minDistance) {
      return currentPath;
    }

    // محاسبه سرعت (معکوس زمان بین نقاط)
    const currentTime = Date.now();
    const velocity = this.lastTime ? Math.min(distance / (currentTime - this.lastTime + 1) * 10, 10) : 0;
    this.lastTime = currentTime;
    
    // نرم کردن سرعت
    this.lastVelocity = this.lastVelocity * 0.7 + velocity * 0.3;
    
    // محاسبه فشار بر اساس سرعت (سرعت کم = فشار بیشتر = خط ضخیم‌تر)
    const pressure = Math.max(0.2, 1 - (this.lastVelocity * this.pressureSensitivity));
    
    // اضافه کردن نقاط میانی اگر فاصله زیاد است
    const newPoints = this.interpolatePoints(this.lastPoint, coords, distance);
    
    // به‌روزرسانی path
    const updatedPath = {
      ...currentPath,
      path: [...currentPath.path, ...newPoints],
      velocities: [...currentPath.velocities, ...newPoints.map(() => this.lastVelocity)],
      pressures: [...currentPath.pressures, ...newPoints.map(() => pressure)]
    };

    // ایجاد smooth path
    updatedPath.smoothedPath = this.createSmoothPath(updatedPath.path);
    
    this.lastPoint = coords;
    return updatedPath;
  }

  /**
   * محاسبه فاصله بین دو نقطه
   */
  calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * ایجاد نقاط میانی برای فاصله‌های زیاد
   */
  interpolatePoints(start, end, distance) {
    const points = [];
    
    if (distance <= this.maxDistance) {
      points.push(end);
    } else {
      // تعداد نقاط میانی مورد نیاز
      const steps = Math.ceil(distance / this.maxDistance);
      
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const point = {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        };
        points.push(point);
      }
    }
    
    return points;
  }

  /**
   * ایجاد مسیر نرم با استفاده از Catmull-Rom spline
   */
  createSmoothPath(originalPath) {
    if (originalPath.length < 3) return originalPath;

    const smoothPath = [];
    
    // اضافه کردن نقطه اول
    smoothPath.push(originalPath[0]);
    
    // ایجاد نقاط نرم
    for (let i = 1; i < originalPath.length - 1; i++) {
      const p0 = originalPath[i - 1] || originalPath[i];
      const p1 = originalPath[i];
      const p2 = originalPath[i + 1];
      const p3 = originalPath[i + 2] || originalPath[i + 1];
      
      // ایجاد چندین نقطه میانی با Catmull-Rom
      const segments = 4;
      for (let t = 0; t < segments; t++) {
        const u = t / segments;
        const point = this.catmullRomSpline(p0, p1, p2, p3, u);
        smoothPath.push(point);
      }
    }
    
    // اضافه کردن نقطه آخر
    smoothPath.push(originalPath[originalPath.length - 1]);
    
    return smoothPath;
  }

  /**
   * محاسبه نقطه در منحنی Catmull-Rom
   */
  catmullRomSpline(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    const v0 = { x: (p2.x - p0.x) * 0.5, y: (p2.y - p0.y) * 0.5 };
    const v1 = { x: (p3.x - p1.x) * 0.5, y: (p3.y - p1.y) * 0.5 };
    
    return {
      x: (2 * p1.x - 2 * p2.x + v0.x + v1.x) * t3 + 
         (-3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x) * t2 + 
         v0.x * t + p1.x,
      y: (2 * p1.y - 2 * p2.y + v0.y + v1.y) * t3 + 
         (-3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y) * t2 + 
         v0.y * t + p1.y
    };
  }

  /**
   * رسم برس با کیفیت بالا
   */
  render(ctx, drawing, settings) {
    if (!drawing.path || drawing.path.length === 0) return;

    const path = drawing.smoothedPath || drawing.path;
    if (path.length < 2) return;

    // تبدیل مختصات برای رسم
    const transformedPath = this.transformPath(path, settings);
    const pressures = drawing.pressures || Array(path.length).fill(1);
    
    ctx.save();
    
    // تنظیمات کلی
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // رسم با تنوع در ضخامت
    this.renderVariableWidth(ctx, transformedPath, pressures, drawing.lineWidth || this.lineWidth);
    
    ctx.restore();
  }

  /**
   * رسم خط با ضخامت متغیر
   */
  renderVariableWidth(ctx, path, pressures, baseWidth) {
    if (path.length < 2) return;

    // رسم هر قطعه با ضخامت مناسب
    for (let i = 0; i < path.length - 1; i++) {
      const point1 = path[i];
      const point2 = path[i + 1];
      const pressure1 = pressures[i] || 1;
      const pressure2 = pressures[i + 1] || 1;
      
      // محاسبه ضخامت برای هر نقطه
      const width1 = this.calculateLineWidth(baseWidth, pressure1);
      const width2 = this.calculateLineWidth(baseWidth, pressure2);
      
      // رسم قطعه
      this.drawSegment(ctx, point1, point2, width1, width2);
    }
  }

  /**
   * محاسبه ضخامت خط بر اساس فشار
   */
  calculateLineWidth(baseWidth, pressure) {
    const minWidth = Math.max(this.minLineWidth, baseWidth * 0.3);
    const maxWidth = Math.min(this.maxLineWidth, baseWidth * 1.5);
    return minWidth + (maxWidth - minWidth) * pressure;
  }

  /**
   * رسم یک قطعه با ضخامت متغیر
   */
  drawSegment(ctx, p1, p2, width1, width2) {
    // اگر ضخامت یکسان است، از خط ساده استفاده کن
    if (Math.abs(width1 - width2) < 0.5) {
      ctx.lineWidth = (width1 + width2) / 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      return;
    }

    // رسم با gradient width
    const steps = Math.max(3, Math.ceil(this.calculateDistance(p1, p2) / 2));
    
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;
      
      const x1 = p1.x + (p2.x - p1.x) * t1;
      const y1 = p1.y + (p2.y - p1.y) * t1;
      const x2 = p1.x + (p2.x - p1.x) * t2;
      const y2 = p1.y + (p2.y - p1.y) * t2;
      
      const width = width1 + (width2 - width1) * (t1 + t2) / 2;
      
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  /**
   * پیش‌نمایش برس در حال رسم
   */
  renderPreview(ctx, currentPath, settings) {
    if (!currentPath.path || currentPath.path.length === 0) return;

    ctx.save();
    ctx.globalAlpha = 0.8;
    
    // رسم با شفافیت برای پیش‌نمایش
    this.render(ctx, currentPath, settings);
    
    ctx.restore();
  }

  /**
   * پایان رسم - پاکسازی متغیرها
   */
  finishDrawing(currentPath) {
    // پاکسازی متغیرهای داخلی
    this.lastPoint = null;
    this.lastVelocity = 0;
    this.lastTime = null;
    this.smoothedPoints = [];
    
    return {
      id: Date.now(),
      ...currentPath
    };
  }

  /**
   * تنظیم پارامترهای برس
   */
  setBrushSettings(settings) {
    if (settings.smoothing !== undefined) this.smoothing = Math.max(0, Math.min(1, settings.smoothing));
    if (settings.minDistance !== undefined) this.minDistance = Math.max(1, settings.minDistance);
    if (settings.maxDistance !== undefined) this.maxDistance = Math.max(this.minDistance, settings.maxDistance);
    if (settings.pressureSensitivity !== undefined) this.pressureSensitivity = Math.max(0, Math.min(1, settings.pressureSensitivity));
    if (settings.minLineWidth !== undefined) this.minLineWidth = Math.max(0.5, settings.minLineWidth);
    if (settings.maxLineWidth !== undefined) this.maxLineWidth = Math.max(this.minLineWidth, settings.maxLineWidth);
  }

  /**
   * دریافت تنظیمات برس
   */
  getBrushSettings() {
    return {
      smoothing: this.smoothing,
      minDistance: this.minDistance,
      maxDistance: this.maxDistance,
      pressureSensitivity: this.pressureSensitivity,
      minLineWidth: this.minLineWidth,
      maxLineWidth: this.maxLineWidth
    };
  }
}