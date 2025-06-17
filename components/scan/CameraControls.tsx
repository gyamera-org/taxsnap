import { View, TouchableOpacity } from 'react-native';
import {
  FlipHorizontal,
  X,
  Zap,
  ZapOff,
  Check,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react-native';

interface CameraControlsProps {
  torch: boolean;
  showCapturedImage: boolean;
  onToggleTorch: () => void;
  onToggleFacing: () => void;
  onPickImage: () => void;
  onTakePicture: () => void;
  onRetakePhoto: () => void;
  onCropAndAnalyze: () => void;
  onClose: () => void;
}

export function CameraControls({
  torch,
  showCapturedImage,
  onToggleTorch,
  onToggleFacing,
  onPickImage,
  onTakePicture,
  onRetakePhoto,
  onCropAndAnalyze,
  onClose,
}: CameraControlsProps) {
  if (showCapturedImage) {
    return (
      <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 pb-12">
        <View className="flex-row justify-center items-center gap-4">
          <TouchableOpacity onPress={onRetakePhoto} className="bg-white/20 p-4 rounded-full">
            <RotateCcw size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCropAndAnalyze}
            className="bg-yellow-400 px-8 py-4 rounded-full flex-row items-center"
          >
            <Check size={20} color="#000" className="mr-2" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Top Controls */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-12 px-6">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={onClose} className="bg-black/50 p-3 rounded-full">
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleTorch} className="bg-black/50 p-3 rounded-full">
            {torch ? <Zap size={24} color="#FFD700" /> : <ZapOff size={24} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 pb-12">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={onPickImage} className="bg-white/20 p-4 rounded-full">
            <ImageIcon size={24} color="#fff" />
          </TouchableOpacity>

          {/* Capture button */}
          <TouchableOpacity
            onPress={onTakePicture}
            className="bg-white w-20 h-20 rounded-full items-center justify-center border-4 border-gray-300"
          >
            <View className="bg-white w-16 h-16 rounded-full" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleFacing} className="bg-white/20 p-4 rounded-full">
            <FlipHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
