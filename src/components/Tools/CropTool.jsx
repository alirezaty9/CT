import React, { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { 
  Crop, 
  Check,
  X,
  Square,
  Maximize
} from 'lucide-react';

const CropTool = forwardRef(({ canvas, isActive }, ref) => {
  const [showPanel, setShowPanel] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('free');
  
  const cropRectRef = useRef(null);
  const originalImageRef = useRef(null);
  const overlaysRef = useRef([]);

  // Find the largest image on canvas
  const findLargestImage = useCallback(() => {
    if (!canvas) return null;
    
    const objects = canvas.getObjects();
    let largestImage = null;
    let largestArea = 0;
    
    objects.forEach(obj => {
      if (obj.type === 'image') {
        const area = obj.width * obj.height;
        if (area > largestArea) {
          largestArea = area;
          largestImage = obj;
        }
      }
    });
    
    return largestImage;
  }, [canvas]);

  // Remove crop box and overlays
  const removeCropBox = useCallback(() => {
    if (cropRectRef.current && canvas) {
      // Remove overlays
      overlaysRef.current.forEach(overlay => {
        canvas.remove(overlay);
      });
      overlaysRef.current = [];
      
      // Remove crop box
      canvas.remove(cropRectRef.current);
      cropRectRef.current = null;
      canvas.renderAll();
    }
  }, [canvas]);

  // Update overlays when crop box changes
  const updateOverlays = useCallback(() => {
    if (!cropRectRef.current || !originalImageRef.current || !canvas) return;
    
    const cropRect = cropRectRef.current;
    const targetImage = originalImageRef.current;
    
    // Get bounds - handle both background and regular images
    let bounds;
    if (targetImage === canvas.backgroundImage) {
      bounds = {
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height
      };
    } else {
      bounds = targetImage.getBoundingRect();
    }
    
    // Update overlay positions and sizes
    if (overlaysRef.current && overlaysRef.current.length === 4) {
      const [overlay1, overlay2, overlay3, overlay4] = overlaysRef.current;
      
      // Top overlay
      overlay1.set({
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: Math.max(0, cropRect.top - bounds.top)
      });
      
      // Bottom overlay
      overlay2.set({
        left: bounds.left,
        top: cropRect.top + cropRect.height * cropRect.scaleY,
        width: bounds.width,
        height: Math.max(0, bounds.top + bounds.height - (cropRect.top + cropRect.height * cropRect.scaleY))
      });
      
      // Left overlay
      overlay3.set({
        left: bounds.left,
        top: cropRect.top,
        width: Math.max(0, cropRect.left - bounds.left),
        height: cropRect.height * cropRect.scaleY
      });
      
      // Right overlay
      overlay4.set({
        left: cropRect.left + cropRect.width * cropRect.scaleX,
        top: cropRect.top,
        width: Math.max(0, bounds.left + bounds.width - (cropRect.left + cropRect.width * cropRect.scaleX)),
        height: cropRect.height * cropRect.scaleY
      });
      
      canvas.renderAll();
    }
  }, [canvas]);

  // Create crop box overlay
  const createCropBox = useCallback((targetImage) => {
    if (!targetImage || !canvas) {
      console.warn('❌ createCropBox: No target image or canvas provided');
      return;
    }
    
    console.log('🔲 createCropBox called with:', targetImage);
    
    // Remove existing crop box
    removeCropBox();
    
    // Get image bounds - handle both background and regular images
    let bounds;
    if (targetImage === canvas.backgroundImage) {
      // For background images, use canvas dimensions
      bounds = {
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height
      };
    } else {
      bounds = targetImage.getBoundingRect();
    }
    
    console.log('🔲 Image bounds:', bounds);
    
    const cropWidth = Math.min(bounds.width * 0.8, 300);
    const cropHeight = aspectRatio === 'free' ? cropWidth * 0.75 : 
                     aspectRatio === 'square' ? cropWidth :
                     aspectRatio === '16:9' ? cropWidth * 9/16 :
                     aspectRatio === '4:3' ? cropWidth * 3/4 :
                     cropWidth * 0.75;
    
    console.log('🔲 Crop dimensions:', { cropWidth, cropHeight, aspectRatio });
    
    // Create crop rectangle
    cropRectRef.current = new fabric.Rect({
      left: bounds.left + (bounds.width - cropWidth) / 2,
      top: bounds.top + (bounds.height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
      fill: 'transparent',
      stroke: '#007bff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true,
      lockRotation: true,
      borderColor: '#007bff',
      cornerColor: '#007bff',
      cornerSize: 12,
      transparentCorners: false
    });
    
    // Add crop overlay (dark areas)
    const overlay1 = new fabric.Rect({
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: cropRectRef.current.top - bounds.top,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
    
    const overlay2 = new fabric.Rect({
      left: bounds.left,
      top: cropRectRef.current.top + cropRectRef.current.height,
      width: bounds.width,
      height: bounds.top + bounds.height - (cropRectRef.current.top + cropRectRef.current.height),
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
    
    const overlay3 = new fabric.Rect({
      left: bounds.left,
      top: cropRectRef.current.top,
      width: cropRectRef.current.left - bounds.left,
      height: cropRectRef.current.height,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
    
    const overlay4 = new fabric.Rect({
      left: cropRectRef.current.left + cropRectRef.current.width,
      top: cropRectRef.current.top,
      width: bounds.left + bounds.width - (cropRectRef.current.left + cropRectRef.current.width),
      height: cropRectRef.current.height,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      excludeFromExport: true
    });
    
    // Add to canvas
    canvas.add(overlay1, overlay2, overlay3, overlay4, cropRectRef.current);
    canvas.setActiveObject(cropRectRef.current);
    canvas.renderAll();
    
    // Store references for cleanup
    overlaysRef.current = [overlay1, overlay2, overlay3, overlay4];
    
    // Add event listener to update overlays when crop box moves
    cropRectRef.current.on('moving', updateOverlays);
    cropRectRef.current.on('scaling', updateOverlays);
  }, [canvas, aspectRatio, updateOverlays, removeCropBox]);

  // Crop background image
  const cropBackgroundImage = useCallback((cropData) => {
    if (!canvas) return;
    const bgImg = canvas.backgroundImage;
    if (!bgImg) return;
    
    // Get the actual image element
    const imgElement = bgImg._element || bgImg._originalElement;
    if (!imgElement) {
      console.error('Image element not found');
      return;
    }
    
    // Calculate scale factors between displayed and original image
    const bgBounds = bgImg.getBoundingRect();
    const scaleX = imgElement.width / bgBounds.width;
    const scaleY = imgElement.height / bgBounds.height;
    
    // Calculate crop area on original image
    const originalCropData = {
      left: (cropData.left - bgBounds.left) * scaleX,
      top: (cropData.top - bgBounds.top) * scaleY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY
    };
    
    // Create new canvas for cropping
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = originalCropData.width;
    cropCanvas.height = originalCropData.height;
    const cropCtx = cropCanvas.getContext('2d');
    
    // Draw cropped portion from original image
    cropCtx.drawImage(
      imgElement,
      Math.max(0, originalCropData.left), 
      Math.max(0, originalCropData.top), 
      originalCropData.width, 
      originalCropData.height,
      0, 0, 
      originalCropData.width, 
      originalCropData.height
    );
    
    // Create new fabric image from cropped canvas
    fabric.Image.fromURL(cropCanvas.toDataURL(), (newImg) => {
      // Scale the new image to fit the crop area
      newImg.set({
        left: 0,
        top: 0,
        scaleX: cropData.width / originalCropData.width,
        scaleY: cropData.height / originalCropData.height,
        selectable: false,
        evented: false
      });
      
      // Resize canvas to match cropped area
      canvas.setWidth(cropData.width);
      canvas.setHeight(cropData.height);
      
      // Set cropped image as new background
      canvas.setBackgroundImage(newImg, () => {
        canvas.renderAll();
        console.log('🔲 Background image cropped and canvas resized');
      });
    });
  }, [canvas]);

  // Crop regular image object
  const cropImageObject = useCallback((imageObj, cropData) => {
    if (!canvas) return;
    // Get the actual image element
    const imgElement = imageObj._element || imageObj._originalElement;
    if (!imgElement) {
      console.error('Image element not found');
      return;
    }
    
    // Calculate scale factors
    const objBounds = imageObj.getBoundingRect();
    const scaleX = imgElement.width / objBounds.width;
    const scaleY = imgElement.height / objBounds.height;
    
    // Calculate crop area on original image
    const originalCropData = {
      left: (cropData.left - objBounds.left) * scaleX,
      top: (cropData.top - objBounds.top) * scaleY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY
    };
    
    // Create cropped version
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = originalCropData.width;
    cropCanvas.height = originalCropData.height;
    const cropCtx = cropCanvas.getContext('2d');
    
    // Draw cropped portion
    cropCtx.drawImage(
      imgElement,
      Math.max(0, originalCropData.left), 
      Math.max(0, originalCropData.top), 
      originalCropData.width, 
      originalCropData.height,
      0, 0, 
      originalCropData.width, 
      originalCropData.height
    );
    
    // Replace with cropped image
    fabric.Image.fromURL(cropCanvas.toDataURL(), (newImg) => {
      newImg.set({
        left: cropData.left,
        top: cropData.top,
        scaleX: cropData.width / originalCropData.width,
        scaleY: cropData.height / originalCropData.height,
        angle: imageObj.angle,
        selectable: true,
        evented: true
      });
      
      canvas.remove(imageObj);
      canvas.add(newImg);
      canvas.renderAll();
      console.log('🔲 Image object cropped successfully');
    });
  }, [canvas]);

  // Start crop mode
  const startCropMode = useCallback(() => {
    console.log('🔲 startCropMode called - canvas:', !!canvas, 'isActive:', isActive);
    if (!canvas || !isActive) {
      console.warn('❌ Cannot start crop mode - missing canvas or not active');
      return;
    }
    setCropMode(true);
    console.log('🔲 cropMode set to true');
  }, [canvas, isActive]);

  // Cancel crop mode
  const cancelCropMode = useCallback(() => {
    setCropMode(false);
    removeCropBox();
  }, [removeCropBox]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    togglePanel: () => setShowPanel(prev => !prev),
    showPanel: () => setShowPanel(true),
    hidePanel: () => setShowPanel(false),
    startCrop: startCropMode,
    cancelCrop: cancelCropMode
  }), [startCropMode, cancelCropMode]);

  // Auto-start crop mode when tool becomes active
  useEffect(() => {
    if (!canvas || !isActive) return;
    
    console.log('🔲 CropTool activated - auto-starting crop mode');
    // Automatically start crop mode when tool is selected
    startCropMode();
  }, [canvas, isActive, startCropMode]);

  // Crop implementation
  useEffect(() => {
    if (!canvas || !isActive) return;
    
    if (cropMode) {
      console.log('🔲 Starting crop mode...');
      // Disable selection and drawing
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
      
      // Find the background image to crop
      const bgImage = canvas.backgroundImage || findLargestImage();
      console.log('🔲 Background image found:', !!bgImage, 'Type:', bgImage?.type);
      
      if (!bgImage) {
        console.warn('❌ No image found to crop');
        return;
      }
      
      originalImageRef.current = bgImage;
      createCropBox(bgImage);
      
      console.log('✅ Crop mode activated successfully');
      
    } else {
      console.log('🔲 Cleaning up crop mode...');
      // Clean up crop mode
      removeCropBox();
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      console.log('✅ Crop mode cleaned up');
    }
  }, [cropMode, canvas, isActive, findLargestImage, createCropBox, removeCropBox]);

  // Apply crop
  const applyCrop = useCallback(() => {
    console.log('🔲 applyCrop called');
    console.log('🔲 cropRectRef.current:', !!cropRectRef.current);
    console.log('🔲 originalImageRef.current:', !!originalImageRef.current);
    
    if (!cropRectRef.current || !originalImageRef.current || !canvas) {
      console.warn('❌ applyCrop: Missing crop rect, original image, or canvas');
      return;
    }
    
    const cropRect = cropRectRef.current;
    const targetImage = originalImageRef.current;
    
    // Get actual crop box dimensions (including scaling)
    const actualWidth = cropRect.width * cropRect.scaleX;
    const actualHeight = cropRect.height * cropRect.scaleY;
    
    // Get crop coordinates relative to the image
    const cropData = {
      left: cropRect.left,
      top: cropRect.top,
      width: actualWidth,
      height: actualHeight
    };
    
    console.log('🔲 Applying crop:', cropData);
    console.log('🔲 Target image type:', targetImage === canvas.backgroundImage ? 'background' : 'object');
    
    // Create cropped image
    if (canvas.backgroundImage === targetImage) {
      // Crop background image
      cropBackgroundImage(cropData);
    } else {
      // Crop regular image object
      cropImageObject(targetImage, cropData);
    }
    
    // Exit crop mode
    cancelCropMode();
  }, [canvas, cancelCropMode, cropBackgroundImage, cropImageObject]);

  // Aspect ratio presets
  const aspectRatios = [
    { value: 'free', label: 'Free', icon: Maximize },
    { value: 'square', label: '1:1', icon: Square },
    { value: '16:9', label: '16:9', icon: Square },
    { value: '4:3', label: '4:3', icon: Square }
  ];

  console.log('🔲 CropTool rendering - showPanel:', showPanel, 'cropMode:', cropMode);
  
  return (
    <div className="crop-tool p-3 border-t border-gray-200 bg-white shadow-lg">
      {!showPanel && !cropMode ? (
        // Minimal view
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🔲 Crop Tool</span>
          <button
            onClick={() => {
              console.log('🔲 Settings button clicked');
              setShowPanel(true);
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Settings
          </button>
        </div>
      ) : cropMode ? (
        // Crop mode active
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-700">🔲 Crop Mode Active</span>
            <div className="flex gap-1">
              <button
                onClick={applyCrop}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                title="Apply Crop"
              >
                <Check size={12} />
              </button>
              <button
                onClick={cancelCropMode}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-blue-600 mb-2">
            Drag the crop area to adjust. Click ✓ to apply or ✕ to cancel.
          </div>
          
          {/* Aspect Ratio Controls */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-1">
              {aspectRatios.map(ratio => (
                <button
                  key={ratio.value}
                  onClick={() => {
                    setAspectRatio(ratio.value);
                    if (cropRectRef.current) {
                      removeCropBox();
                      createCropBox(originalImageRef.current);
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    aspectRatio === ratio.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Full settings panel
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">🔲 Crop Tool</span>
            <button
              onClick={() => setShowPanel(false)}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
          
          {/* Main Actions */}
          <div className="mb-4">
            <button
              onClick={() => {
                console.log('🔲 Start Crop button clicked!');
                startCropMode();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Crop size={16} />
              <span className="text-sm">Start Crop</span>
            </button>
          </div>
          
          {/* Aspect Ratio Selection */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-1">
              {aspectRatios.map(ratio => {
                const IconComponent = ratio.icon;
                return (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      aspectRatio === ratio.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <IconComponent size={12} />
                    {ratio.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CropTool;