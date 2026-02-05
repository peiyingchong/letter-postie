import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

interface ElementProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  type: "text" | "image" | "sticker";
  content: string;
  style?: any;
  onUpdate: (id: string, updates: any) => void;
  onRemove: (id: string) => void;
  isReadOnly?: boolean;
}

const DraggableElement = ({ id, x, y, rotation, scale, type, content, style, onUpdate, onRemove, isReadOnly }: ElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = scale;
    
    const handleMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const delta = Math.max(dx, dy);
      const newScale = Math.max(0.3, Math.min(4, startScale + delta / 80));
      onUpdate(id, { scale: newScale });
    };
    
    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [id, scale, onUpdate, isReadOnly]);

  const handleRotateStart = useCallback((e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    
    const element = elementRef.current;
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const startRotation = rotation;
    
    const handleMove = (moveEvent: PointerEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      onUpdate(id, { rotation: startRotation + angleDiff });
    };
    
    const handleUp = () => {
      setIsRotating(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [id, rotation, onUpdate, isReadOnly]);

  const baseSize = type === "sticker" ? 64 : 36;

  return (
    <motion.div
      ref={elementRef}
      drag={!isReadOnly && !isResizing && !isRotating}
      dragMomentum={false}
      initial={{ x, y }}
      className={cn("absolute touch-none group", !isReadOnly && "cursor-move")}
      style={{ 
        x, 
        y,
        rotate: rotation,
        transformOrigin: 'center center'
      }}
      onDragEnd={(_, info) => {
        if (isReadOnly) return;
        const container = document.getElementById('canvas-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          onUpdate(id, { 
            x: info.point.x - rect.left, 
            y: info.point.y - rect.top 
          });
        }
      }}
    >
      {type === "text" && (
        <div className="relative">
          <div 
            contentEditable={!isReadOnly}
            suppressContentEditableWarning
            className={cn("px-2 py-1 min-w-[100px] outline-none rounded", !isReadOnly && "focus:ring-2 ring-primary/20", style?.font || "font-hand")} 
            style={{ color: style?.color, fontSize: (style?.fontSize || 24) * scale }}
            onBlur={(e) => !isReadOnly && onUpdate(id, { text: e.currentTarget.textContent })}
          >
            {content}
          </div>
          {!isReadOnly && (
            <button 
              onClick={() => onRemove(id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              data-testid="button-remove-text"
            >
              ×
            </button>
          )}
        </div>
      )}
      {type === "sticker" && (
        <div 
          className="drop-shadow-md filter select-none relative"
          style={{ 
            width: baseSize * scale, 
            height: baseSize * scale,
            transition: isResizing ? 'none' : 'width 0.1s, height 0.1s'
          }}
        >
          {content.startsWith('/assets') ? (
            <img 
              src={content} 
              alt="Sticker" 
              className="w-full h-full object-contain" 
              draggable={false} 
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ fontSize: 36 * scale }}
            >
              {content}
            </div>
          )}
          {!isReadOnly && (
            <>
              {/* Remove button */}
              <button 
                onClick={() => onRemove(id)}
                className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                data-testid="button-remove-sticker"
              >
                ×
              </button>
              
              {/* Resize handle - bottom right corner */}
              <div 
                onPointerDown={handleResizeStart}
                className={cn(
                  "absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 flex items-center justify-center",
                  isResizing && "opacity-100 bg-primary/80"
                )}
                data-testid="handle-resize"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-white" />
              </div>
              
              {/* Rotate handle - top center */}
              <div 
                onPointerDown={handleRotateStart}
                className={cn(
                  "absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 flex items-center justify-center",
                  isRotating && "opacity-100 cursor-grabbing bg-blue-600"
                )}
                data-testid="handle-rotate"
              >
                <RotateCw size={12} className="text-white" />
              </div>
              
              {/* Visual connection line to rotate handle */}
              <div className="absolute -top-6 left-1/2 w-px h-4 bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* +/- buttons for quick scaling */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => onUpdate(id, { scale: Math.max(0.3, scale - 0.2) })}
                  className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                  data-testid="button-scale-down"
                >-</button>
                <button 
                  onClick={() => onUpdate(id, { scale: Math.min(4, scale + 0.2) })}
                  className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 hover:bg-gray-100"
                  data-testid="button-scale-up"
                >+</button>
              </div>
            </>
          )}
        </div>
      )}
      {type === "image" && (
        <div className="relative group/img">
          <img 
            src={content} 
            alt="User content" 
            className="max-w-[300px] h-auto rounded-sm shadow-md"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            draggable={false}
          />
          {!isReadOnly && (
            <>
              <button 
                onClick={() => onRemove(id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                data-testid="button-remove-image"
              >
                ×
              </button>
              <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                 <button 
                   onClick={() => onUpdate(id, { scale: Math.max(0.5, scale - 0.2) })}
                   className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold"
                 >-</button>
                 <button 
                   onClick={() => onUpdate(id, { scale: Math.min(3, scale + 0.2) })}
                   className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold"
                 >+</button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface StudioCanvasProps {
  background: string;
  content: {
    textElements: any[];
    stickers: any[];
    images: any[];
  };
  onUpdateElement: (type: string, id: string, data: any) => void;
  onRemoveElement?: (type: string, id: string) => void;
  isReadOnly?: boolean;
}

export function StudioCanvas({ background, content, onUpdateElement, onRemoveElement, isReadOnly }: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getBgClass = (bg: string) => {
    switch (bg) {
      case 'crumpled-paper': return 'bg-pattern-crumpled';
      case 'midnight-blue': return 'bg-pattern-olive';
      case 'rose-petal': return 'bg-pattern-rose';
      default: return 'bg-texture-paper bg-white';
    }
  };

  const handleRemove = (type: string, id: string) => {
    if (onRemoveElement) {
      onRemoveElement(type, id);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-muted/20">
      <div 
        id="canvas-container"
        ref={containerRef}
        className={cn(
          "aspect-[7/5] w-full max-w-[900px] h-auto shadow-2xl relative overflow-hidden transition-all duration-500 rounded-sm",
          getBgClass(background)
        )}
      >
        {/* Render Text */}
        {content.textElements.map((el) => (
          <DraggableElement 
            key={el.id} 
            {...el} 
            type="text" 
            content={el.text} 
            isReadOnly={isReadOnly}
            style={{ font: el.font, color: el.color, fontSize: el.fontSize }}
            onUpdate={(id, data) => onUpdateElement('text', id, data)} 
            onRemove={(id) => handleRemove('text', id)}
          />
        ))}

        {/* Render Images */}
        {content.images?.map((el) => (
          <DraggableElement 
            key={el.id} 
            {...el} 
            type="image" 
            content={el.url}
            isReadOnly={isReadOnly}
            onUpdate={(id, data) => onUpdateElement('image', id, data)} 
            onRemove={(id) => handleRemove('image', id)}
          />
        ))}

        {/* Render Stickers */}
        {content.stickers.map((el) => {
          const stickerContent = el.stickerId;
          
          return (
            <DraggableElement 
              key={el.id} 
              {...el} 
              type="sticker" 
              content={stickerContent}
              isReadOnly={isReadOnly}
              onUpdate={(id, data) => onUpdateElement('sticker', id, data)} 
              onRemove={(id) => handleRemove('sticker', id)}
            />
          );
        })}

        {/* Stamp - rendered last for z-index */}
        <div className="absolute top-4 right-4 z-50 w-24 h-24 flex items-center justify-center pointer-events-none">
           <div className="w-20 h-24 border-2 border-primary/40 rounded-sm relative flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] overflow-hidden shadow-md">
             <div className="absolute inset-0 border-[6px] border-white/20 pointer-events-none" />
             <div className="text-[8px] font-serif uppercase tracking-[0.2em] text-primary/60 mb-1">Postie</div>
             <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
               <div className="text-xl font-serif text-primary/40 italic">P</div>
             </div>
             <div className="mt-2 text-[10px] font-bold text-primary/60 font-mono">2026</div>
           </div>
        </div>
      </div>
    </div>
  );
}
