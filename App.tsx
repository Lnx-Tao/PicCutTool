import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { ImageUploader } from './components/ImageUploader';
import { ImageCropper } from './components/ImageCropper';
import { GridSplitter } from './components/GridSplitter';
import { Step } from './types';
import { Scissors, Info } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.UPLOAD);
  const [maxStepReached, setMaxStepReached] = useState<Step>(Step.UPLOAD);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [config, setConfig] = useState({
    targetWidth: 812,
    targetHeight: 1421,
    filenamePrefix: 'grid_image'
  });

  const handleImageSelected = (imageDataUrl: string) => {
    setOriginalImage(imageDataUrl);
    setProcessedImage(null); // Reset processed image when new image is uploaded
    setCurrentStep(Step.CROP_RESIZE);
    setMaxStepReached(Step.CROP_RESIZE);
  };

  const handleCropComplete = (
    processedImg: string, 
    width: number, 
    height: number, 
    prefix: string
  ) => {
    setProcessedImage(processedImg);
    setConfig(prev => ({ ...prev, targetWidth: width, targetHeight: height, filenamePrefix: prefix }));
    setCurrentStep(Step.GRID_SPLIT);
    setMaxStepReached(Step.GRID_SPLIT);
  };

  const handleReset = () => {
    // Removed window.confirm to improve responsiveness and avoid blocking issues
    setOriginalImage(null);
    setProcessedImage(null);
    setCurrentStep(Step.UPLOAD);
    setMaxStepReached(Step.UPLOAD);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <Scissors size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              奇点拼图活动切图工具（亡语版）
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
             本地安全处理，无需上传服务器
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <StepIndicator 
          currentStep={currentStep} 
          setStep={setCurrentStep}
          maxStepReached={maxStepReached}
        />

        <div className="flex flex-col xl:flex-row gap-8 mt-8 items-start">
          
          {/* Main Workspace */}
          <div className="flex-1 w-full min-w-0 transition-all duration-300">
            {currentStep === Step.UPLOAD && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">开始使用</h2>
                  <p className="text-gray-500">上传图片以进行缩放、裁剪及宫格切分。</p>
                </div>
                <ImageUploader onImageSelected={handleImageSelected} />
              </div>
            )}

            {currentStep === Step.CROP_RESIZE && originalImage && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <ImageCropper 
                  imageSrc={originalImage} 
                  onCropComplete={handleCropComplete}
                  initialTargetWidth={config.targetWidth}
                  initialTargetHeight={config.targetHeight}
                  initialFilenamePrefix={config.filenamePrefix}
                />
              </div>
            )}

            {currentStep === Step.GRID_SPLIT && processedImage && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <GridSplitter 
                   processedImageSrc={processedImage} 
                   filenamePrefix={config.filenamePrefix}
                   onReset={handleReset}
                 />
               </div>
            )}
          </div>

          {/* Right Sidebar: Instructions */}
          <div className="w-full xl:w-96 shrink-0 xl:sticky xl:top-24 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
               <div className="flex items-start gap-4">
                 <div className="p-2 bg-indigo-100 rounded-xl shrink-0 text-indigo-600">
                    <Info size={24} />
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-lg font-bold text-gray-900">奇点时代拼图活动切图教程</h3>
                   <ol className="list-decimal list-inside text-base text-gray-600 space-y-3 marker:text-indigo-600 marker:font-bold">
                      <li className="pl-2"><span className="-ml-2">找到想作为拼图的卡牌大图，一般为1500*2436；</span></li>
                      <li className="pl-2"><span className="-ml-2">裁剪大图尺寸为812*1421；</span></li>
                      <li className="pl-2"><span className="-ml-2">裁剪至7行4列的宫格，每个拼图块大小为203*203；</span></li>
                      <li className="pl-2"><span className="-ml-2">修改重命名前缀。</span></li>
                   </ol>
                   <div className="pt-4 mt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-400">按照以上步骤操作可获得最佳效果。</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;