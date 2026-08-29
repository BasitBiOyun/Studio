import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { IconCheck, IconX } from '@tabler/icons-react';

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropCompleteHandler = useCallback((_: unknown, pixels: PixelCrop) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image), { once: true });
      image.addEventListener('error', reject, { once: true });
      image.crossOrigin = 'anonymous';
      image.src = url;
    });

  const getCroppedImg = async (
    source: string,
    pixelCrop: PixelCrop,
    rotationDegrees = 0,
  ): Promise<string> => {
    const image = await createImage(source);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context is unavailable.');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = Math.ceil(maxSize * Math.sqrt(2));
    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);
    ctx.drawImage(
      image,
      safeArea / 2 - image.width / 2,
      safeArea / 2 - image.height / 2,
    );

    const rotatedData = ctx.getImageData(0, 0, safeArea, safeArea);
    canvas.width = Math.max(1, Math.round(pixelCrop.width));
    canvas.height = Math.max(1, Math.round(pixelCrop.height));

    ctx.putImageData(
      rotatedData,
      Math.round(-safeArea / 2 + image.width / 2 - pixelCrop.x),
      Math.round(-safeArea / 2 + image.height / 2 - pixelCrop.y),
    );

    return canvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || isSaving) return;

    setIsSaving(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Image crop failed', error);
      window.alert('Could not crop this image. The existing visual was kept.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
          <h2 className="text-white font-bold text-sm">Crop Image</h2>
          <button onClick={onCancel} className="text-neutral-400 hover:text-white" aria-label="Close crop editor">
            <IconX size={20} />
          </button>
        </div>

        <div className="relative w-full h-[400px] bg-neutral-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div className="p-4 bg-neutral-900 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-neutral-400">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs text-neutral-400">Rotation</label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={!croppedAreaPixels || isSaving}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg text-sm flex items-center gap-2"
            >
              <IconCheck size={16} />
              {isSaving ? 'Processing…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
