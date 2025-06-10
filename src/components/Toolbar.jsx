import React from 'react';
import IconButton from './common/IconButton';
import { useCamera } from '../contexts/CameraContext';
import { twMerge } from 'tailwind-merge';
import {
  Crop,
  Brush,
  Eraser,
  Circle,
  RectangleHorizontal,
  LineChart,
  Move,
  ZoomIn,
  ZoomOut,
  Palette,
  Hand,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tools = [
  { Icon: Crop, name: 'crop' },
  { Icon: Brush, name: 'brush' },
  { Icon: Eraser, name: 'eraser' },
  { Icon: Circle, name: 'circle' },
  { Icon: RectangleHorizontal, name: 'rectangle' },
  { Icon: LineChart, name: 'lineChart' },
  { Icon: Move, name: 'move' },
  { Icon: ZoomIn, name: 'zoomIn' },
  { Icon: ZoomOut, name: 'zoomOut' },
  { Icon: Palette, name: 'grayscale' },
  { Icon: Hand, name: 'pan' },
  { Icon: RotateCcw, name: 'undo' }
];

const Toolbar = ({ className = '' }) => {
  const { t } = useTranslation();
  const { activeTool, applyTool, toggleGrayscale, zoomImage, undoLastChange } = useCamera();

  const handleToolClick = (name) => {
    console.log(`ابزار انتخاب شده: ${name}`);
    if (name === 'grayscale') {
      toggleGrayscale();
    } else if (name === 'zoomIn') {
      zoomImage('in');
    } else if (name === 'zoomOut') {
      zoomImage('out');
    } else if (name === 'undo') {
      undoLastChange();
    } else {
      applyTool(name);
    }
  };

  return (
    <div
      className={twMerge(
        'w-16 bg-background-secondary h-full flex flex-col items-center py-6 gap-4 border-r border-border rounded-l-xl shadow-card dark:bg-background-secondary dark:border-border',
        className
      )}
    >
      {tools.map(({ Icon, name }, index) => (
        <IconButton
          key={index}
          Icon={Icon}
          title={t(name)}
          onClick={() => handleToolClick(name)}
          variant={activeTool === name ? 'primary' : 'default'}
          size='md'
          className='hover:scale-105'
        />
      ))}
    </div>
  );
};

export default Toolbar;