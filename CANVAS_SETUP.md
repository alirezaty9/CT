# راهنمای نصب Canvas پیشرفته

## مرحله 1: نصب کتابخانه‌ها

```bash
npm install cropperjs croppie konva paper
```

## مرحله 2: فعال‌سازی CSS

فایل `src/styles/canvas-libraries.css` را باز کنید و خطوط زیر را uncomment کنید:

```css
/* از این: */
/* 
@import 'cropperjs/dist/cropper.css';
@import 'croppie/croppie.css';
*/

/* به این: */
@import 'cropperjs/dist/cropper.css';
@import 'croppie/croppie.css';
```

## مرحله 3: فعال‌سازی Imports

فایل `src/components/Canvas/CanvasManager.js` را باز کنید و خطوط زیر را uncomment کنید:

```javascript
// از این:
try {
  // این خطوط را بعد از نصب کتابخانه‌ها uncomment کنید:
  // Cropper = (await import('cropperjs')).default;
  // Croppie = (await import('croppie')).default;
} catch (error) {
  console.warn('برخی کتابخانه‌های اختیاری در دسترس نیستند:', error.message);
}

// به این:
try {
  Cropper = (await import('cropperjs')).default;
  Croppie = (await import('croppie')).default;
} catch (error) {
  console.warn('برخی کتابخانه‌های اختیاری در دسترس نیستند:', error.message);
}
```

## مرحله 4: تست

1. سرور را restart کنید:
   ```bash
   npm run dev
   ```

2. به آدرس `/canvas-test` بروید

3. تمام ابزارها باید کار کنند!

## ویژگی‌های موجود بدون نصب اضافی:

✅ **Fabric.js** - رسم و ابزارهای پایه  
✅ **برس پیشرفته** - با تنظیمات کامل  
✅ **اشکال هندسی** - مستطیل، دایره، مثلث  
✅ **ابزار متن** - اضافه کردن متن  
✅ **Zoom & Pan** - بزرگنمایی و جابجایی  
✅ **Undo/Redo** - بازگشت و تکرار  
✅ **Export/Import** - ذخیره و بارگذاری  

## ویژگی‌های اضافی بعد از نصب:

🔄 **Cropper.js** - برش حرفه‌ای تصاویر  
🔄 **Croppie** - برش ساده و سریع  

## مشکلات رایج:

### خطای CSS import
اگر این خطا را دیدید:
```
[postcss] ENOENT: no such file or directory, open 'cropperjs/dist/cropper.css'
```

**راه حل:** ابتدا کتابخانه‌ها را نصب کنید، سپس CSS را uncomment کنید.

### خطای import در JavaScript
اگر Cropper یا Croppie کار نمی‌کند:

**راه حل:** imports را در `CanvasManager.js` uncomment کنید.

## پشتیبانی

اگر مشکلی داشتید:
1. مطمئن شوید تمام کتابخانه‌ها نصب شده‌اند
2. سرور را restart کنید
3. Cache مرورگر را پاک کنید
4. Console را برای error ها چک کنید

---

**نکته:** سیستم به گونه‌ای طراحی شده که بدون نصب کتابخانه‌های اضافی هم کار کند، فقط برخی ویژگی‌ها در دسترس نخواهند بود.
