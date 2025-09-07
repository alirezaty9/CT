import { BaseTool } from '../base/BaseTool.js';
import { RectangleHorizontal } from 'lucide-react';

/**
 * ابزار رسم مستطیل
 */
export class RectangleTool extends BaseTool {
  constructor() {
    super('rectangle', RectangleHorizontal, 'مستطیل', '#00ff00', 2);
  }

  /**
   * ادامه رسم مستطیل - فقط نقطه آخر را نگه می‌داریم
   */
  continueDrawing(coords, currentPath) {
    return {
      ...currentPath,
      path: [currentPath.path[0], coords] // فقط نقطه شروع و انتها
    };
  }

  /**
   * محاسبه ابعاد مستطیل
   */
  calculateDimensions(start, end) {
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    };
  }

  /**
   * رسم مستطیل روی canvas
   */
  render(ctx, drawing, settings) {
    if (!drawing.path || drawing.path.length < 2) return;

    // تبدیل مختصات
    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];

    // محاسبه ابعاد
    const rect = this.calculateDimensions(start, end);

    ctx.save();
    
    // تنظیمات رسم
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // رسم مستطیل
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.restore();
  }

  /**
   * پیش‌نمایش مستطیل در حال رسم
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
   * رسم مستطیل پر
   */
  renderFilled(ctx, drawing, settings, fillColor = null) {
    if (!drawing.path || drawing.path.length < 2) return;

    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];
    const rect = this.calculateDimensions(start, end);

    ctx.save();
    
    // پر کردن
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    // رسم خط دور
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.restore();
  }

  /**
   * رسم مستطیل با گوشه‌های گرد
   */
  renderRounded(ctx, drawing, settings, radius = 10, fillColor = null) {
    if (!drawing.path || drawing.path.length < 2) return;

    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];
    const rect = this.calculateDimensions(start, end);

    ctx.save();
    
    // ایجاد path برای مستطیل گرد
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);

    // پر کردن
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    // رسم خط دور
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.stroke();

    ctx.restore();
  }
}
