import { useRef, useState, useCallback, useEffect, memo } from "react";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCw, X, Minus, Plus } from "lucide-react";

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
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const DraggableElement = memo(({ id, x, y, rotation, scale, type, content, style, onUpdate, onRemove, isReadOnly, isSelected, onSelect, canvasScale = 1 }: ElementProps & { canvasScale?: number }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use motion values for smooth drag without re-renders
  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);
  
  // Sync motion values when props change (from state updates)
  useEffect(() => {
    motionX.set(x);
    motionY.set(y);
  }, [x, y, motionX, motionY]);

  // Focus text area when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  // Click outside to exit edit mode
  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        if (textRef.current) {
          onUpdate(id, { text: textRef.current.textContent || "" });
        }
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [isEditing, id, onUpdate]);

  // Manual drag handling with scale compensation and pointer capture
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (isReadOnly || isResizing || isRotating || isEditing) return;
    e.stopPropagation();
    setIsDragging(true);
    
    const element = elementRef.current;
    if (element) {
      element.setPointerCapture(e.pointerId);
    }
    
    const pointerId = e.pointerId;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startX = x;
    const startY = y;
    
    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointerX) / canvasScale;
      const dy = (moveEvent.clientY - startPointerY) / canvasScale;
      
      motionX.set(startX + dx);
      motionY.set(startY + dy);
    };
    
    const cleanup = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      if (element) {
        element.releasePointerCapture(pointerId);
      }
    };
    
    const handleUp = (upEvent: PointerEvent) => {
      const dx = (upEvent.clientX - startPointerX) / canvasScale;
      const dy = (upEvent.clientY - startPointerY) / canvasScale;
      
      onUpdate(id, { x: startX + dx, y: startY + dy });
      cleanup();
    };
    
    const handleCancel = () => {
      motionX.set(startX);
      motionY.set(startY);
      cleanup();
    };
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
  }, [id, x, y, canvasScale, isReadOnly, isResizing, isRotating, isEditing, motionX, motionY, onUpdate]);

  // Text box resize handler - width only, height auto-hugs content
  const handleTextResizeStart = useCallback((e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startPointerX = e.clientX;
    const startWidth = style?.width || 180;
    
    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startPointerX) / canvasScale;
      const newWidth = Math.max(60, startWidth + dx);
      onUpdate(id, { width: newWidth });
    };
    
    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [id, style?.width, canvasScale, onUpdate, isReadOnly]);

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

  const handleClick = (e: React.MouseEvent) => {
    if (type === "image" && onSelect && !isReadOnly) {
      e.stopPropagation();
      onSelect(id);
    }
  };

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (type === "text" && !isReadOnly) {
      e.stopPropagation();
      setIsEditing(true);
    }
  }, [type, isReadOnly]);

  // Text box dimensions - width controlled, height auto-hugs content
  const textWidth = style?.width || 180;
  const textFontSize = style?.fontSize || 18;

  return (
    <motion.div
      ref={elementRef}
      initial={{ x, y }}
      className={cn(
        "absolute touch-none select-none",
        !isReadOnly && !isResizing && !isRotating && !isEditing && "cursor-grab",
        isDragging && "cursor-grabbing",
        !isReadOnly && "hover:z-10"
      )}
      style={{ 
        x: motionX, 
        y: motionY,
        rotate: rotation,
        transformOrigin: 'top left',
        willChange: 'transform'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handleDragStart}
    >
      {type === "text" && (
        <div 
          className="relative group"
          style={{ width: textWidth }}
        >
          {/* Text container - width controlled, height hugs content */}
          <div
            ref={textRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={cn(
              "w-full rounded px-2 py-1",
              style?.font || "font-hand",
              isEditing
                ? "outline-none ring-2 ring-primary/40 bg-white/60 cursor-text"
                : "cursor-grab",
              !isEditing && !isReadOnly && "border border-transparent group-hover:border-primary/20"
            )}
            style={{ 
              color: style?.color || "#334155", 
              fontSize: textFontSize,
              lineHeight: 1.4,
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
            onBlur={(e) => {
              if (!isReadOnly && isEditing) {
                onUpdate(id, { text: e.currentTarget.textContent || "" });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditing(false);
                if (textRef.current) {
                  onUpdate(id, { text: textRef.current.textContent || "" });
                }
              }
              e.stopPropagation();
            }}
            data-testid="text-content-box"
          >
            {content}
          </div>

          {/* Right edge resize handle */}
          {!isReadOnly && (
            <div
              onPointerDown={handleTextResizeStart}
              className={cn(
                "absolute top-0 -right-2 w-3 h-full cursor-ew-resize z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                isResizing && "opacity-100"
              )}
              data-testid="handle-resize-text"
            >
              <div className="w-0.5 h-6 rounded-full bg-primary/40" />
            </div>
          )}

          {/* Remove button */}
          {!isReadOnly && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              data-testid="button-remove-text"
            >
              <X size={10} />
            </button>
          )}

          {/* Double-click hint */}
          {!isReadOnly && !isEditing && (
            <div className="absolute -bottom-5 left-0 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Double-click to edit
            </div>
          )}
        </div>
      )}
      {type === "sticker" && (
        <div 
          className="drop-shadow-md filter select-none relative group"
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
              <button 
                onClick={() => onRemove(id)}
                className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                data-testid="button-remove-sticker"
              >
                <X size={10} />
              </button>
              
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
              
              <div className="absolute -top-6 left-1/2 w-px h-4 bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
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
        <div 
          className={cn(
            "relative select-none",
            isSelected && "outline outline-2 outline-primary outline-offset-2 rounded-sm"
          )}
          style={{
            width: 200 * scale,
            height: 'auto'
          }}
        >
          {/* Image sized by width - wrapper grows with scale so controls follow */}
          <img 
            src={content} 
            alt="User content" 
            className="w-full h-auto rounded-sm shadow-md pointer-events-none block"
            draggable={false}
          />
          {/* Controls positioned at corners of the sized wrapper */}
          {!isReadOnly && isSelected && (
            <>
              {/* Remove button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10 hover:bg-red-600 transition-colors"
                data-testid="button-remove-image"
              >
                <X size={12} />
              </button>
              
              {/* Resize handle */}
              <div 
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleResizeStart(e);
                }}
                className={cn(
                  "absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-full cursor-se-resize shadow-md z-10 flex items-center justify-center hover:bg-primary/80 transition-colors",
                  isResizing && "bg-primary/80"
                )}
                data-testid="handle-resize-image"
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-white" />
              </div>
              
              {/* Scale buttons */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(id, { scale: Math.max(0.5, scale - 0.2) });
                  }}
                  className="w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-100"
                  data-testid="button-scale-down-image"
                >-</button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(id, { scale: Math.min(3, scale + 0.2) });
                  }}
                  className="w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-100"
                  data-testid="button-scale-up-image"
                >+</button>
              </div>
              
              {/* Drag hint */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Drag to move
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
});

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
  senderName?: string;
  showFooter?: boolean;
}

const BASE_WIDTH = 900;
const BASE_HEIGHT = 643; // 7:5 aspect ratio

export function StudioCanvas({ background, content, onUpdateElement, onRemoveElement, isReadOnly, senderName, showFooter }: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const actualWidth = containerRef.current.offsetWidth;
        setCanvasScale(actualWidth / BASE_WIDTH);
      }
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

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
    if (type === 'image' && id === selectedImageId) {
      setSelectedImageId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas-inner') {
      setSelectedImageId(null);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6 bg-muted/20">
      <div 
        id="canvas-container"
        ref={containerRef}
        className={cn(
          "aspect-[7/5] w-full max-w-[900px] h-auto shadow-2xl relative overflow-hidden transition-all duration-500 rounded-sm",
          getBgClass(background)
        )}
      >
        {/* Scaled content wrapper - everything inside scales proportionally */}
        <div 
          id="canvas-inner"
          onClick={handleCanvasClick}
          className="absolute inset-0"
          style={{
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left',
            width: BASE_WIDTH,
            height: BASE_HEIGHT
          }}
        >
          {/* Dotted border to define letter boundaries */}
          <div 
            className="absolute pointer-events-none z-40"
            style={{
              top: 24,
              left: 24,
              right: 24,
              bottom: showFooter ? 100 : 24,
              border: '2px dashed',
              borderColor: 'rgba(0,0,0,0.15)',
              borderRadius: 4
            }}
          />
          {/* Render Text */}
          {content.textElements.map((el) => (
            <DraggableElement 
              key={el.id} 
              {...el} 
              type="text" 
              content={el.text} 
              isReadOnly={isReadOnly}
              canvasScale={canvasScale}
              style={{ font: el.font, color: el.color, fontSize: el.fontSize, width: el.width, height: el.height }}
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
              canvasScale={canvasScale}
              isSelected={selectedImageId === el.id}
              onSelect={(id) => setSelectedImageId(id)}
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
                canvasScale={canvasScale}
                onUpdate={(id, data) => onUpdateElement('sticker', id, data)} 
                onRemove={(id) => handleRemove('sticker', id)}
              />
            );
          })}

          {/* Footer inside letter - scales with content */}
          {showFooter && senderName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent pt-16 pb-6 px-8">
              <div className="text-center">
                <p className="text-muted-foreground font-serif text-base mb-3">
                  With love from {senderName}
                </p>
                <a 
                  href="/" 
                  className="inline-block px-6 py-2 rounded-full bg-primary/10 text-primary font-serif text-sm hover:bg-primary/20 transition-colors"
                  data-testid="link-create-own"
                >
                  Create your own letter with Postie
                </a>
              </div>
            </div>
          )}

          {/* Circular Chop-Style Stamp */}
          <div className="absolute top-4 right-4 z-50 w-20 h-20 flex items-center justify-center pointer-events-none">
            <div 
              className="w-20 h-20 rounded-full border-[3px] border-primary relative flex flex-col items-center justify-center"
              style={{ 
                transform: 'rotate(-15deg)',
                boxShadow: 'inset 0 0 0 2px transparent'
              }}
            >
              {/* Outer decorative ring */}
              <div className="absolute inset-1 rounded-full border-[1.5px] border-primary/60" />
              
              {/* Date text curved at top */}
              <div className="absolute top-2 text-[7px] font-bold text-primary tracking-[0.15em] uppercase">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              
              {/* Center text */}
              <div className="text-lg font-serif font-bold text-primary tracking-wide">
                POSTIE
              </div>
              
              {/* Year at bottom */}
              <div className="absolute bottom-2 text-[8px] font-bold text-primary tracking-[0.2em]">
                {new Date().getFullYear()}
              </div>
              
              {/* Small decorative dots */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
