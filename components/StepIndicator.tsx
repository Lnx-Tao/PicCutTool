import React from 'react';
import { Check } from 'lucide-react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
  setStep: (step: Step) => void;
  maxStepReached: Step;
}

const steps = [
  { id: Step.UPLOAD, label: '上传图片' },
  { id: Step.CROP_RESIZE, label: '裁剪与缩放' },
  { id: Step.GRID_SPLIT, label: '宫格切分' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, setStep, maxStepReached }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= maxStepReached;

          return (
            <div key={step.id} className="flex items-center">
              {index > 0 && (
                <div className={`w-8 h-1 mx-2 rounded ${step.id <= maxStepReached ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
              <button
                onClick={() => isClickable && setStep(step.id)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-200
                  ${isCompleted ? 'bg-indigo-600 text-white' : ''}
                  ${isCurrent ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-lg scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? <Check size={20} /> : index + 1}
              </button>
              <span className={`ml-2 text-sm font-medium ${isCurrent ? 'text-indigo-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};