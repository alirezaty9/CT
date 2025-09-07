import { LineTool } from './line/LineTool.js';
import { BrushTool } from './brush/BrushTool.js';
import { CircleTool } from './circle/CircleTool.js';
import { RectangleTool } from './rectangle/RectangleTool.js';
import { EraserTool } from './eraser/EraserTool.js';

/**
 * مدیر ابزارهای نقاشی
 * مسئول مدیریت تمام ابزارها و انتقال بین آن‌ها
 */
export class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
    this.currentDrawing = null;
    
    // ثبت ابزارهای پیش‌فرض
    this.registerTool(new LineTool());
    this.registerTool(new BrushTool());
    this.registerTool(new CircleTool());
    this.registerTool(new RectangleTool());
    this.registerTool(new EraserTool());
  }

  /**
   * ثبت ابزار جدید
   * @param {BaseTool} tool - ابزار برای ثبت
   */
  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * حذف ابزار
   * @param {string} toolName - نام ابزار برای حذف
   */
  unregisterTool(toolName) {
    if (this.activeTool && this.activeTool.name === toolName) {
      this.activeTool = null;
    }
    this.tools.delete(toolName);
  }

  /**
   * فعال کردن ابزار
   * @param {string} toolName - نام ابزار
   * @returns {boolean} - موفقیت عملیات
   */
  activateTool(toolName) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      console.warn(`Tool "${toolName}" not found`);
      return false;
    }

    // غیرفعال کردن ابزار قبلی
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // فعال کردن ابزار جدید
    this.activeTool = tool;
    this.activeTool.activate();
    
    return true;
  }

  /**
   * غیرفعال کردن ابزار فعلی
   */
  deactivateCurrentTool() {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }
  }

  /**
   * دریافت ابزار فعال
   * @returns {BaseTool|null}
   */
  getActiveTool() {
    return this.activeTool;
  }

  /**
   * دریافت تمام ابزارها
   * @returns {Array} - لیست تمام ابزارها
   */
  getAllTools() {
    return Array.from(this.tools.values());
  }

  /**
   * دریافت تنظیمات تمام ابزارها برای نمایش در UI
   * @returns {Array} - لیست تنظیمات ابزارها
   */
  getToolsForUI() {
    return this.getAllTools().map(tool => tool.getSettings());
  }

  /**
   * شروع رسم با ابزار فعال
   * @param {Object} coords - مختصات {x, y}
   * @param {Object} settings - تنظیمات تصویر
   * @returns {Object|null} - داده‌های drawing اولیه
   */
  startDrawing(coords, settings) {
    if (!this.activeTool) return null;

    this.currentDrawing = this.activeTool.startDrawing(coords, settings);
    return this.currentDrawing;
  }

  /**
   * ادامه رسم با ابزار فعال
   * @param {Object} coords - مختصات {x, y}
   * @returns {Object|null} - داده‌های drawing به‌روزرسانی‌شده
   */
  continueDrawing(coords) {
    if (!this.activeTool || !this.currentDrawing) return null;

    this.currentDrawing = this.activeTool.continueDrawing(coords, this.currentDrawing);
    return this.currentDrawing;
  }

  /**
   * پایان رسم با ابزار فعال
   * @returns {Object|null} - drawing نهایی
   */
  finishDrawing() {
    if (!this.activeTool || !this.currentDrawing) return null;

    const finalDrawing = this.activeTool.finishDrawing(this.currentDrawing);
    this.currentDrawing = null;
    return finalDrawing;
  }

  /**
   * لغو رسم فعلی
   */
  cancelDrawing() {
    this.currentDrawing = null;
  }

  /**
   * رسم drawing روی canvas
   * @param {CanvasRenderingContext2D} ctx - context canvas
   * @param {Object} drawing - داده‌های drawing
   * @param {Object} settings - تنظیمات تصویر
   */
  renderDrawing(ctx, drawing, settings) {
    const tool = this.tools.get(drawing.tool);
    if (tool) {
      tool.render(ctx, drawing, settings);
    }
  }

  /**
   * رسم پیش‌نمایش drawing فعلی
   * @param {CanvasRenderingContext2D} ctx - context canvas
   * @param {Object} settings - تنظیمات تصویر
   */
  renderPreview(ctx, settings) {
    if (!this.activeTool || !this.currentDrawing) return;

    if (this.activeTool.renderPreview) {
      this.activeTool.renderPreview(ctx, this.currentDrawing, settings);
    } else {
      this.activeTool.render(ctx, this.currentDrawing, settings);
    }
  }

  /**
   * تنظیم رنگ برای ابزار فعال
   * @param {string} color - رنگ جدید
   */
  setActiveToolColor(color) {
    if (this.activeTool) {
      this.activeTool.setColor(color);
    }
  }

  /**
   * تنظیم ضخامت خط برای ابزار فعال
   * @param {number} width - ضخامت جدید
   */
  setActiveToolLineWidth(width) {
    if (this.activeTool) {
      this.activeTool.setLineWidth(width);
    }
  }

  /**
   * بررسی اینکه آیا در حال رسم هستیم
   * @returns {boolean}
   */
  isDrawing() {
    return this.currentDrawing !== null;
  }

  /**
   * دریافت drawing فعلی
   * @returns {Object|null}
   */
  getCurrentDrawing() {
    return this.currentDrawing;
  }
}
