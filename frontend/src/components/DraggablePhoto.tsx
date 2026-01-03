'use client';

import { useState, useRef, useEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { RotateCw, Maximize2, X, Edit2, Trash2, Heart, Smile, ThumbsUp } from 'lucide-react';
import { normalizeImageUrl } from '@/utils/images';
import { roomAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface DraggablePhotoProps {
  photo: {
    id: number;
    photo_url: string;
    caption: string;
    uploaded_by: string;
    uploaded_by_user_id?: number;
    created_at: string;
    frame_style?: string;
    reactions?: {
      "❤️": number;
      "👍": number;
      "😊": number;
    };
    user_reacted?: string[];
    position_x?: number;
    position_y?: number;
    rotation?: number;
    scale?: number;
    z_index?: number;
    width?: number;
    height?: number;
  };
  wallId: number;
  isWallOwner: boolean;
  isMobile: boolean;
  onUpdate: () => void;
  onEdit?: (photoId: number) => void;
  onDelete?: (photoId: number) => void;
  onReact?: (photoId: number, emoji: string) => void;
  getFrameClass: (frame: string) => string;
  getFrameWrapperClass: (frame: string) => string;
  getFrameImageClass: (frame: string) => string;
}

export function DraggablePhoto({
  photo,
  wallId,
  isWallOwner,
  isMobile,
  onUpdate,
  onEdit,
  onDelete,
  onReact,
  getFrameClass,
  getFrameWrapperClass,
  getFrameImageClass
}: DraggablePhotoProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [rotation, setRotation] = useState(photo.rotation || 0);
  const [scale, setScale] = useState(photo.scale || 1.0);
  const [position, setPosition] = useState({ x: photo.position_x || 0, y: photo.position_y || 0 });
  const [size, setSize] = useState({ width: photo.width || 200, height: photo.height || 200 });
  const [showControls, setShowControls] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const rotationStartRef = useRef(0);
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  // Update local state when photo prop changes
  useEffect(() => {
    setPosition({ x: photo.position_x || 0, y: photo.position_y || 0 });
    setRotation(photo.rotation || 0);
    setScale(photo.scale || 1.0);
    setSize({ width: photo.width || 200, height: photo.height || 200 });
  }, [photo.position_x, photo.position_y, photo.rotation, photo.scale, photo.width, photo.height]);

  const handleDragStart = () => {
    if (!isWallOwner) return false;
    setIsDragging(true);
    setShowControls(true);
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    if (!isWallOwner) return;
    setPosition({ x: data.x, y: data.y });
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (!isWallOwner) return;
    setIsDragging(false);
    
    // Call async operation without making this function async
    roomAPI.updatePhotoPosition(wallId, photo.id, {
      position_x: data.x,
      position_y: data.y
    }).then(() => {
      onUpdate();
    }).catch((error: any) => {
      console.error('Error updating photo position:', error);
      toast.error('Failed to update photo position');
    });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    if (!isWallOwner) return;
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    const container = nodeRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      rotationStartRef.current = rotation - startAngle;
    }
  };

  const handleRotate = (e: MouseEvent) => {
    if (!isRotating || !isWallOwner) return;
    const container = nodeRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const newRotation = (rotationStartRef.current + angle + 360) % 360;
      setRotation(newRotation);
    }
  };

  const handleRotateStop = () => {
    if (!isRotating || !isWallOwner) return;
    setIsRotating(false);
    
    // Call async operation without making this function async
    roomAPI.updatePhotoPosition(wallId, photo.id, {
      rotation: rotation
    }).then(() => {
      onUpdate();
    }).catch((error: any) => {
      console.error('Error updating photo rotation:', error);
      toast.error('Failed to update photo rotation');
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isWallOwner) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { width: size.width, height: size.height, x: e.clientX, y: e.clientY };
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !isWallOwner) return;
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const newWidth = Math.max(100, Math.min(800, resizeStartRef.current.width + deltaX));
    const newHeight = Math.max(100, Math.min(800, resizeStartRef.current.height + deltaY));
    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeStop = () => {
    if (!isResizing || !isWallOwner) return;
    setIsResizing(false);
    
    // Call async operation without making this function async
    roomAPI.updatePhotoPosition(wallId, photo.id, {
      width: size.width,
      height: size.height
    }).then(() => {
      onUpdate();
    }).catch((error: any) => {
      console.error('Error updating photo size:', error);
      toast.error('Failed to update photo size');
    });
  };

  useEffect(() => {
    if (isRotating) {
      document.addEventListener('mousemove', handleRotate);
      document.addEventListener('mouseup', handleRotateStop);
      return () => {
        document.removeEventListener('mousemove', handleRotate);
        document.removeEventListener('mouseup', handleRotateStop);
      };
    }
  }, [isRotating, rotation]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeStop);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeStop);
      };
    }
  }, [isResizing, size]);

  const handleBringToFront = () => {
    if (!isWallOwner) return;
    // Get max z_index and add 1
    const maxZ = Math.max(...(document.querySelectorAll('.draggable-photo') as any).map((el: HTMLElement) => 
      parseInt(el.style.zIndex) || 0
    ), photo.z_index || 0);
    
    // Call async operation without making this function async
    roomAPI.updatePhotoLayer(wallId, photo.id, maxZ + 1).then(() => {
      onUpdate();
    }).catch((error: any) => {
      console.error('Error updating photo layer:', error);
      toast.error('Failed to update photo layer');
    });
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      disabled={!isWallOwner}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={`photo-container photo-container-${photo.id} draggable-photo ${isWallOwner ? 'cursor-move' : 'cursor-default'}`}
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          zIndex: photo.z_index || 0,
          width: `${size.width}px`,
          height: 'auto'
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isDragging && setShowControls(false)}
      >
        <div className={`glass-effect rounded-2xl hover:shadow-xl transition-all ${isMobile ? 'p-2' : 'p-2'} ${getFrameClass(photo.frame_style || 'none')} relative`}>
          {/* Controls - Only show for wall owner */}
          {isWallOwner && showControls && (
            <div className="absolute -top-2 -right-2 flex gap-1 z-50">
              <button
                type="button"
                onClick={handleBringToFront}
                className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Bring to front"
              >
                <Maximize2 className="w-3 h-3 text-gray-700" />
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(photo.id)}
                  className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3 text-gray-700" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(photo.id)}
                  className="p-1 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              )}
            </div>
          )}

          {/* Rotation Handle - Only for wall owner */}
          {isWallOwner && showControls && (
            <button
              type="button"
              onMouseDown={handleRotateStart}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-50 cursor-grab active:cursor-grabbing"
              title="Rotate"
            >
              <RotateCw className="w-3 h-3 text-gray-700" />
            </button>
          )}

          {/* Resize Handle - Only for wall owner */}
          {isWallOwner && showControls && (
            <button
              type="button"
              onMouseDown={handleResizeStart}
              className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-50 cursor-nwse-resize"
              title="Resize"
            >
              <Maximize2 className="w-3 h-3 text-gray-700" />
            </button>
          )}

          <div className={`${getFrameWrapperClass(photo.frame_style || 'none')}`}>
            <img
              src={normalizeImageUrl(photo.photo_url)}
              alt={photo.caption || 'Birthday memory'}
              className={`w-full h-auto object-cover ${getFrameImageClass(photo.frame_style || 'none')}`}
              style={{ width: `${size.width}px`, height: 'auto' }}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.startsWith('data:')) {
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                  target.onerror = null;
                }
              }}
            />
          </div>

          {/* Caption */}
          {photo.caption && (
            <p className={`mt-2 text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {photo.caption}
            </p>
          )}

          {/* Reactions */}
          {photo.reactions && (
            <div className="flex gap-2 mt-2">
              {onReact && (
                <>
                  <button
                    type="button"
                    onClick={() => onReact(photo.id, '❤️')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${photo.user_reacted?.includes('❤️') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}`}
                  >
                    <Heart className="w-3 h-3" />
                    <span className="text-xs">{photo.reactions['❤️'] || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReact(photo.id, '👍')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${photo.user_reacted?.includes('👍') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-xs">{photo.reactions['👍'] || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReact(photo.id, '😊')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${photo.user_reacted?.includes('😊') ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'}`}
                  >
                    <Smile className="w-3 h-3" />
                    <span className="text-xs">{photo.reactions['😊'] || 0}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

