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

const DraggableElement = ({ id, x, y, rotation, scale, type, content, style, onUpdate }: ElementProps) => {
  const [isEditing, setIsEditing] = (type === "text") ? [true, () => {}] : [false, () => {}]; // Simplified for placeholder

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x, y, rotate: rotation, scale }}
      className="absolute cursor-move touch-none group"
      onDragEnd={(_, info) => {
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
          contentEditable
          suppressContentEditableWarning
          className={cn("px-2 py-1 min-w-[100px] outline-none focus:ring-2 ring-primary/20 rounded", style?.font || "font-hand")} 
          style={{ color: style?.color, fontSize: (style?.fontSize || 24) * scale }}
          onBlur={(e) => onUpdate(id, { text: e.currentTarget.textContent })}
        >
          {content}
        </div>
      )}
      {type === "sticker" && (
        <div className="drop-shadow-md filter select-none">
          {content.startsWith('/assets') ? (
            <img src={content} alt="Sticker" className="w-16 h-16 object-contain" draggable={false} />
          ) : (
            <div className="text-4xl">{content}</div>
          )}
        </div>
      )}
      {type === "image" && (
        <img 
          src={content} 
          alt="User content" 
          className="max-w-[300px] h-auto rounded-sm shadow-md"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
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
}

export function StudioCanvas({ background, content, onUpdateElement }: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getBgClass = (bg: string) => {
    switch (bg) {
      case 'crumpled-paper': return 'bg-pattern-crumpled';
      case 'midnight-blue': return 'bg-pattern-nordwood';
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
        <div className="absolute top-4 right-4 z-10 w-24 h-24 border-2 border-dashed border-primary/20 rounded flex items-center justify-center bg-white/50 backdrop-blur-sm group">
           <div 
             contentEditable 
             suppressContentEditableWarning
             className="text-[10px] font-hand text-center p-1 outline-none w-full"
           >
             STAMP
           </div>
        </div>
        {/* Render Text */}
        {content.textElements.map((el) => (
          <DraggableElement 
            key={el.id} 
            {...el} 
            type="text" 
            content={el.text} 
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
            onUpdate={(id, data) => onUpdateElement('image', id, data)} 
          />
        ))}

        {/* Render Stickers */}
        {content.stickers.map((el) => {
          let stickerContent = "⭐";
          if (el.stickerId === 'heart') stickerContent = "❤️";
          if (el.stickerId === 'moon') stickerContent = "🌙";
          if (el.stickerId === 'flower') stickerContent = "🌸";
          
          return (
            <DraggableElement 
              key={el.id} 
              {...el} 
              type="sticker" 
              content={stickerContent}
              onUpdate={(id, data) => onUpdateElement('sticker', id, data)} 
            />
          );
        })}
      </div>
    </div>
  );
}
