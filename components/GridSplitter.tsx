import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Grid, Download, Layers, RotateCcw, FileText } from 'lucide-react';
import { splitImageToGrid } from '../utils/canvasUtils';
import { OutputFormat } from '../types';

interface GridSplitterProps {
  processedImageSrc: string;
  filenamePrefix: string;
  onReset: () => void;
}

export const GridSplitter: React.FC<GridSplitterProps> = ({ 
  processedImageSrc, 
  filenamePrefix,
  onReset
}) => {
  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(4);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [customPrefix, setCustomPrefix] = useState(filenamePrefix);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update local state if prop changes (though mainly used for initial value)
  useEffect(() => {
    setCustomPrefix(filenamePrefix);
  }, [filenamePrefix]);

  const handleDownloadGrid = async () => {
    setIsProcessing(true);
    try {
      const parts = await splitImageToGrid(processedImageSrc, rows, cols, format);
      
      const zip = new JSZip();
      const folder = zip.folder(`${customPrefix}_grid`);
      
      const totalParts = parts.length;
      // Calculate padding length: at least 2 digits, or more if count > 99
      const padLength = Math.max(2, String(totalParts).length);
      const ext = format === 'image/jpeg' ? 'jpg' : 'png';

      parts.forEach((part, index) => {
        // Generate sequential filename: prefix + padded number
        // Index is 0-based, so we use index + 1 for 1-based numbering
        // Row-major order is guaranteed by splitImageToGrid implementation
        const sequence = String(index + 1).padStart(padLength, '0');
        const fileName = `${customPrefix}${sequence}.${ext}`;
        folder?.file(fileName, part.blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      
      // Handle potential import mismatches with esm.sh
      // @ts-ignore
      const saveFn = FileSaver.saveAs || FileSaver;
      saveFn(content, `${customPrefix}_grid_${rows}x${cols}.zip`);
    } catch (e) {
      console.error(e);
      alert('生成宫格失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReset();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4">
      {/* Controls */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Grid className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-lg text-gray-800">宫格设置</h3>
          </div>

          <div className="space-y-6">
            
            {/* Filename Prefix Input */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="text-gray-500" />
                <span>输出文件名前缀</span>
              </label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                placeholder="例如: pieces_1033"
              />
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                预览: <span className="font-mono text-indigo-600">{customPrefix}01.{format === 'image/jpeg' ? 'jpg' : 'png'}</span> ... <span className="font-mono text-indigo-600">{customPrefix}{String(rows * cols).padStart(Math.max(2, String(rows * cols).length), '0')}.{format === 'image/jpeg' ? 'jpg' : 'png'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行数 (A)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={rows}
                    onChange={(e) => setRows(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">水平</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">列数 (B)</label>
                <div className="relative">
                   <input
                    type="number"
                    min="1"
                    max="50"
                    value={cols}
                    onChange={(e) => setCols(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">垂直</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
              <div className="flex space-x-2">
                <button
                  type="button"
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
                  type="button"
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

            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Layers size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-900">概览</span>
              </div>
              <p className="text-sm text-indigo-800">
                将被切分为 <span className="font-bold">{rows * cols}</span> 个独立文件。
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                按顺序编号 (01, 02...)
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadGrid}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl transform active:scale-95 duration-200 cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download size={20} className="pointer-events-none" />
                  <span className="pointer-events-none">下载宫格切图 (.ZIP)</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleResetClick}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all text-sm relative z-10 active:scale-95 cursor-pointer"
            >
              <RotateCcw size={14} className="pointer-events-none" />
              <span className="pointer-events-none">重新开始</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="w-full lg:w-2/3 bg-gray-100 rounded-2xl p-6 flex items-center justify-center overflow-auto border border-gray-200 shadow-inner min-h-[400px]">
        <div className="relative shadow-2xl bg-white" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <img 
            src={processedImageSrc} 
            alt="Preview" 
            className="block max-w-full h-auto"
            style={{ maxHeight: '600px' }}
          />
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none border border-indigo-500/50">
             {/* Horizontal Lines */}
             {Array.from({ length: rows - 1 }).map((_, i) => (
              <div
                key={`row-${i}`}
                className="absolute w-full border-t border-indigo-400/80 shadow-[0_0_2px_rgba(255,255,255,0.5)]"
                style={{ top: `${((i + 1) / rows) * 100}%` }}
              />
            ))}
            {/* Vertical Lines */}
            {Array.from({ length: cols - 1 }).map((_, i) => (
              <div
                key={`col-${i}`}
                className="absolute h-full border-l border-indigo-400/80 shadow-[0_0_2px_rgba(255,255,255,0.5)]"
                style={{ left: `${((i + 1) / cols) * 100}%` }}
              />
            ))}
          </div>
          
          {/* Label Preview Overlay (Optional - shows first and last index) */}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
            {customPrefix}01
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
            {customPrefix}{String(rows * cols).padStart(Math.max(2, String(rows * cols).length), '0')}
          </div>

        </div>
      </div>
    </div>
  );
};