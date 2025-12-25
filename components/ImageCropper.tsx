import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Sliders, Download, CheckCircle, ArrowRight, FileType } from 'lucide-react';
import { getCroppedImg } from '../utils/canvasUtils';
import { OutputFormat } from '../types';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (processedImage: string, width: number, height: number, filenamePrefix: string) => void;
  initialTargetWidth?: number;
  initialTargetHeight?: number;
  initialFilenamePrefix?: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ 
  imageSrc, 
  onCropComplete,
  initialTargetWidth = 800,
  initialTargetHeight = 800,
  initialFilenamePrefix = 'processed_image'
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [targetWidth, setTargetWidth] = useState(initialTargetWidth);
  const [targetHeight, setTargetHeight] = useState(initialTargetHeight);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [filenamePrefix, setFilenamePrefix] = useState(initialFilenamePrefix);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  // Download functionality for Step 1
  const handleDownloadCurrent = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, targetWidth, targetHeight, format);
      const link = document.createElement('a');
      link.href = croppedImage;
      const ext = format === 'image/jpeg' ? 'jpg' : 'png';
      link.download = `${filenamePrefix}_${targetWidth}x${targetHeight}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('图片处理失败');
    }
  };

  const handleNext = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      // Generate the final high-res cropped image
      // Note: Passing the user selected format to the next step
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, targetWidth, targetHeight, format);
      onCropComplete(croppedImage, targetWidth, targetHeight, filenamePrefix);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Calculate aspect ratio for the cropper based on target dimensions
  const aspect = targetWidth / targetHeight;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Sliders className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-800">输出设置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文件名前缀</label>
              <input
                type="text"
                value={filenamePrefix}
                onChange={(e) => setFilenamePrefix(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标宽度 (px)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标高度 (px)</label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">图片格式</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFormat('image/png')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    format === 'image/png'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setFormat('image/jpeg')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    format === 'image/jpeg'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              裁剪框已锁定为 {targetWidth}:{targetHeight} 的比例。
              最终输出图片将精确调整为 {targetWidth}x{targetHeight} 像素。
            </p>
          </div>

          <div className="mt-8 space-y-3">
             <button
              onClick={handleDownloadCurrent}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <Download size={18} />
              <span>下载当前步骤图片 ({format === 'image/png' ? 'PNG' : 'JPG'})</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              <span>下一步：宫格切分</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Cropper UI */}
      <div className="w-full lg:w-2/3 bg-gray-900 rounded-2xl overflow-hidden shadow-xl h-[500px] lg:h-[600px] relative">
        <div className="absolute inset-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            objectFit="contain"
          />
        </div>
        
        {/* Zoom Slider Overlay */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 max-w-sm bg-black/60 backdrop-blur-md px-6 py-3 rounded-full">
          <div className="flex items-center space-x-4">
            <span className="text-white text-xs font-bold">缩放</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};