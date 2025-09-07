import { BaseTool } from '../base/BaseTool.js';
import { Minus } from 'lucide-react';

/**
 * ابزار رسم خط مستقیم
 */
export class LineTool extends BaseTool {
  constructor() {
    super('line', Minus, 'خط', '#ff00ff', 3);
  }

  /**
   * ادامه رسم خط - فقط نقطه آخر را نگه می‌داریم
   */
  continueDrawing(coords, currentPath) {
    return {
      ...currentPath,
      path: [currentPath.path[0], coords] // فقط نقطه شروع و انتها
    };
  }

  /**
   * رسم خط روی canvas
   */
  render(ctx, drawing, settings) {
    if (!drawing.path || drawing.path.length < 2) return;

    // تبدیل مختصات
    const transformedPath = this.transformPath(drawing.path, settings);
    const start = transformedPath[0];
    const end = transformedPath[transformedPath.length - 1];

    ctx.save();
    
    // تنظیمات رسم
    ctx.strokeStyle = drawing.color || this.color;
    ctx.lineWidth = drawing.lineWidth || this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // رسم خط
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * پیش‌نمایش خط در حال رسم
   */
  renderPreview(ctx, currentPath, settings) {
    if (!currentPath.path || currentPath.path.length < 2) return;

    // رسم با شفافیت برای پیش‌نمایش
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    this.render(ctx, currentPath, settings);
    
    ctx.restore();
  }
}
