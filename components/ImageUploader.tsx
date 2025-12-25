import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative border-4 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-indigo-400 transition-colors duration-300 bg-white shadow-sm"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
            <UploadCloud size={48} />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">上传您的图片</h3>
          <p className="text-gray-500">拖拽文件到此处或点击浏览文件</p>
          
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform active:scale-95">
            <span>浏览文件</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
        </div>
        
        <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400 text-sm">
          <ImageIcon size={16} />
          <span>支持 JPG, PNG, WEBP 格式</span>
        </div>
      </div>
    </div>
  );
};