import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PenTool, Mail, Heart, Star, Gift, Cake, PartyPopper, Trophy, Music, Flower2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const exampleLetters = [
  {
    id: "1",
    title: "Birthday Wishes",
    recipient: "Sarah",
    sender: "Mom",
    preview: "Wishing you the happiest birthday filled with joy and laughter...",
    background: "bg-gradient-to-br from-pink-50 to-rose-100",
    icon: <Gift className="w-8 h-8 text-pink-500" />,
    decorIcons: [Cake, PartyPopper, Gift]
  },
  {
    id: "2", 
    title: "Thank You Note",
    recipient: "Alex",
    sender: "Jamie",
    preview: "I wanted to take a moment to express my heartfelt gratitude...",
    background: "bg-gradient-to-br from-amber-50 to-orange-100",
    icon: <Heart className="w-8 h-8 text-amber-500" />,
    decorIcons: [Heart, Sparkles, Flower2]
  },
  {
    id: "3",
    title: "Congratulations!",
    recipient: "Michael",
    sender: "The Team",
    preview: "We're so proud of everything you've accomplished this year...",
    background: "bg-gradient-to-br from-blue-50 to-indigo-100",
    icon: <Star className="w-8 h-8 text-blue-500" />,
    decorIcons: [PartyPopper, Star, Trophy]
  },
  {
    id: "4",
    title: "Love Letter",
    recipient: "My Dear",
    sender: "Forever Yours",
    preview: "Every moment with you feels like a beautiful dream come true...",
    background: "bg-gradient-to-br from-red-50 to-rose-100",
    icon: <Heart className="w-8 h-8 text-red-500" />,
    decorIcons: [Heart, Music, Flower2]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Navigation />
      
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--secondary)_0%,transparent_40%)] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-6 font-mono tracking-wide border border-secondary">
              Digital Stationery Reimagined
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-[1.1]">
              Send letters that <br/>
              <span className="italic text-primary/80">feel real.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed"
          >
            Create tactile, multimedia letters with our studio editor. 
            Share a moment of delight with a digital unboxing experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link to="/studio">
              <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group" data-testid="button-start-letter">
                Start a Letter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <a href="#gallery" className="px-8 py-4 rounded-full bg-white border border-border text-foreground font-medium text-lg hover:bg-secondary/20 transition-colors" data-testid="button-view-gallery">
              View Gallery
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <PenTool className="w-6 h-6" />,
              title: "Tactile Editing",
              desc: "Drag stickers, type in cursive, and choose premium textures."
            },
            {
              icon: <Mail className="w-6 h-6" />,
              title: "Digital Unboxing",
              desc: "Recipients open a virtual envelope with satisfying animations."
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: "Share Instantly",
              desc: "Your letter is encoded in the URL. No accounts needed."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="gallery" className="py-24 px-6 bg-gradient-to-b from-white/50 to-secondary/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 font-mono">
              Inspiration Gallery
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Beautiful letters, beautifully sent
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See what others have created with Postie. Every letter tells a unique story.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleLetters.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                data-testid={`gallery-item-${letter.id}`}
              >
                <div className={`${letter.background} rounded-lg aspect-[7/5] relative overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                  <div className="absolute inset-3 border-2 border-dashed border-black/10 rounded pointer-events-none" />
                  
                  <div className="absolute top-2 right-2 w-10 h-12 bg-white/80 rounded-sm border border-primary/20 flex flex-col items-center justify-center shadow-sm">
                    <div className="text-[5px] font-serif uppercase tracking-wider text-primary/60">Postie</div>
                    <div className="text-xs font-serif text-primary/40 italic">P</div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="mb-2">{letter.icon}</div>
                    <div className="font-hand text-lg text-center text-gray-700 mb-1">
                      For {letter.recipient}
                    </div>
                    <div className="text-xs text-gray-500 font-serif italic">
                      from {letter.sender}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {letter.decorIcons.map((Icon, si) => (
                      <div 
                        key={si} 
                        className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-sm"
                        style={{ 
                          transform: `rotate(${(si - 1) * 10}deg)`
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 text-primary/70" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h4 className="font-serif font-medium text-primary">{letter.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{letter.preview}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/studio">
              <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 mx-auto group" data-testid="button-create-yours">
                Create Yours
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border mt-12">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="w-full h-32 bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border mb-8">
            <span className="text-muted-foreground font-mono text-sm">Advertisement Space</span>
          </div>
          <p className="text-muted-foreground font-serif italic">Postie. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}
