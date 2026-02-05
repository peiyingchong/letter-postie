import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

const DraggableElement = ({ id, x, y, rotation, scale, type, content, style, onUpdate, isReadOnly }: ElementProps & { isReadOnly?: boolean }) => {
  return (
    <motion.div
      drag={!isReadOnly}
      dragMomentum={false}
      initial={{ x, y, rotate: rotation, scale }}
      className={cn("absolute touch-none group", !isReadOnly && "cursor-move")}
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
        <div 
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          className={cn("px-2 py-1 min-w-[100px] outline-none rounded", !isReadOnly && "focus:ring-2 ring-primary/20", style?.font || "font-hand")} 
          style={{ color: style?.color, fontSize: (style?.fontSize || 24) * scale }}
          onBlur={(e) => !isReadOnly && onUpdate(id, { text: e.currentTarget.textContent })}
        >
          {content}
        </div>
      )}
      {type === "sticker" && (
        <div className="drop-shadow-md filter select-none relative">
          {content.startsWith('/assets') ? (
            <img 
              src={content} 
              alt="Sticker" 
              style={{ width: 64 * scale, height: 64 * scale }}
              className="object-contain" 
              draggable={false} 
            />
          ) : (
            <div style={{ fontSize: 36 * scale }}>{content}</div>
          )}
          {!isReadOnly && (
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={() => onUpdate(id, { scale: Math.max(0.5, scale - 0.2) })}
                 className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold"
               >-</button>
               <button 
                 onClick={() => onUpdate(id, { scale: Math.min(3, scale + 0.2) })}
                 className="w-5 h-5 bg-white shadow rounded-full flex items-center justify-center text-[10px] font-bold"
               >+</button>
            </div>
          )}
        </div>
      )}
      {type === "image" && (
        <div className="relative group/img">
          <img 
            src={content} 
            alt="User content" 
            className="max-w-[300px] h-auto rounded-sm shadow-md"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
          {!isReadOnly && (
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
  isReadOnly?: boolean;
}

export function StudioCanvas({ background, content, onUpdateElement, isReadOnly }: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getBgClass = (bg: string) => {
    switch (bg) {
      case 'crumpled-paper': return 'bg-pattern-crumpled';
      case 'midnight-blue': return 'bg-pattern-olive';
      case 'rose-petal': return 'bg-pattern-rose';
      default: return 'bg-texture-paper bg-white';
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
        <div className="absolute top-4 right-4 z-10 w-24 h-24 flex items-center justify-center">
           <div className="w-20 h-24 border-2 border-primary/40 rounded-sm relative flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] overflow-hidden">
             <div className="absolute inset-0 border-[6px] border-white/20 pointer-events-none" />
             <div className="text-[8px] font-serif uppercase tracking-[0.2em] text-primary/60 mb-1">Postal</div>
             <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center">
               <div className="text-xl font-serif text-primary/40 italic">L</div>
             </div>
             <div className="mt-2 text-[10px] font-bold text-primary/60 font-mono">2026</div>
           </div>
           <div 
             contentEditable={!isReadOnly}
             suppressContentEditableWarning
             className="absolute inset-0 flex items-center justify-center text-[10px] font-hand text-center p-1 outline-none z-10 text-primary font-bold"
           >
             {isReadOnly ? "" : "STAMP"}
           </div>
        </div>
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
            />
          );
        })}
      </div>
    </div>
  );
}
