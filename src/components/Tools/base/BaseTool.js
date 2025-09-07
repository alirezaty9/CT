/**
 * کلاس پایه برای تمام ابزارهای نقاشی
 * هر ابزار باید از این کلاس ارث‌بری کند
 */
export class BaseTool {
  constructor(name, icon, label, color = '#000000', lineWidth = 2) {
    this.name = name;
    this.icon = icon;
    this.label = label;
    this.color = color;
    this.lineWidth = lineWidth;
    this.isActive = false;
  }

  /**
   * شروع رسم - باید در هر ابزار override شود
   * @param {Object} coords - مختصات شروع {x, y}
   * @param {Object} settings - تنظیمات تصویر {zoom, panOffset}
   * @returns {Object} - داده‌های اولیه path
   */
  startDrawing(coords, settings) {
    return {
      tool: this.name,
      path: [coords],
      color: this.color,
      lineWidth: this.lineWidth,
      settings: { ...settings }
    };
  }

  /**
   * ادامه رسم - باید در هر ابزار override شود
   * @param {Object} coords - مختصات فعلی {x, y}
   * @param {Object} currentPath - path فعلی
   * @returns {Object} - path به‌روزرسانی‌شده
   */
  continueDrawing(coords, currentPath) {
    return {
      ...currentPath,
      path: [...currentPath.path, coords]
    };
  }

  /**
   * پایان رسم - باید در هر ابزار override شود
   * @param {Object} currentPath - path نهایی
   * @returns {Object} - drawing نهایی
   */
  finishDrawing(currentPath) {
    return {
      id: Date.now(),
      ...currentPath
    };
  }

  /**
   * رسم روی canvas - باید در هر ابزار override شود
   * @param {CanvasRenderingContext2D} ctx - context canvas
   * @param {Object} drawing - داده‌های drawing
   * @param {Object} settings - تنظیمات فعلی تصویر
   */
  render(ctx, drawing, settings) {
    throw new Error(`render method must be implemented in ${this.name} tool`);
  }

  /**
   * فعال کردن ابزار
   */
  activate() {
    this.isActive = true;
  }

  /**
   * غیرفعال کردن ابزار
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * تنظیم رنگ
   * @param {string} color - رنگ جدید
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * تنظیم ضخامت خط
   * @param {number} width - ضخامت جدید
   */
  setLineWidth(width) {
    this.lineWidth = width;
  }

  /**
   * دریافت تنظیمات ابزار
   * @returns {Object} - تنظیمات ابزار
   */
  getSettings() {
    return {
      name: this.name,
      icon: this.icon,
      label: this.label,
      color: this.color,
      lineWidth: this.lineWidth,
      isActive: this.isActive
    };
  }

  /**
   * تبدیل مختصات با در نظر گیری zoom و pan
   * @param {Array} path - مسیر اصلی (مختصات خام canvas)
   * @param {Object} settings - تنظیمات {zoom, panOffset}
   * @returns {Array} - مسیر تبدیل‌شده برای رسم
   */
  transformPath(path, settings) {
    // مختصات خام canvas را مستقیماً برمی‌گردانیم
    // چون zoom و pan در سطح canvas اعمال می‌شود
    return path;
  }
}
