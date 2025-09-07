import { BaseTool } from '../base/BaseTool.js';
import { Circle } from 'lucide-react';

/**
 * ابزار رسم دایره
 */
export class CircleTool extends BaseTool {
  constructor() {
    super('circle', Circle, 'دایره', '#0000ff', 2);
  }

  /**
   * ادامه رسم دایره - فقط نقطه آخر را نگه می‌داریم
   */
  continueDrawing(coords, currentPath) {
    return {
      ...currentPath,
      path: [currentPath.path[0], coords] // فقط نقطه شروع و انتها
    };
  }

  /**
   * محاسبه شعاع دایره
   */
  calculateRadius(start, end) {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  }

  /**
   * رسم دایره روی canvas
   */
  render(ctx, drawing, settings) {
    if (!drawing.path || drawing.path.length < 2) return;

    // تبدیل مختصات
    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];

    // محاسبه شعاع
    const radius = this.calculateRadius(start, end);

    ctx.save();
    
    // تنظیمات رسم
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.lineCap = 'round';

    // رسم دایره
    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * پیش‌نمایش دایره در حال رسم
   */
  renderPreview(ctx, currentPath, settings) {
    if (!currentPath.path || currentPath.path.length < 2) return;

    // رسم با شفافیت برای پیش‌نمایش
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.setLineDash([5, 5]); // خط چین برای پیش‌نمایش
    
    this.render(ctx, currentPath, settings);
    
    ctx.restore();
  }

  /**
   * رسم دایره پر
   */
  renderFilled(ctx, drawing, settings, fillColor = null) {
    if (!drawing.path || drawing.path.length < 2) return;

    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];
    const radius = this.calculateRadius(start, end);

    ctx.save();
    
    // پر کردن
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // رسم خط دور
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}
