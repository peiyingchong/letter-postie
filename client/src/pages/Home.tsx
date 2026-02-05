import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PenTool, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <Navigation />
      
      {/* Hero Section */}
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
            <Link href="/studio">
              <button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group">
                Start a Letter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <button className="px-8 py-4 rounded-full bg-white border border-border text-foreground font-medium text-lg hover:bg-secondary/20 transition-colors">
              View Gallery
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Preview Cards */}
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
              title: "Keep Forever",
              desc: "Letters are stored permanently. A digital shoebox of memories."
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

      {/* Footer / Ad Placeholder */}
      <footer className="py-12 border-t border-border mt-12">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="w-full h-32 bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border mb-8">
            <span className="text-muted-foreground font-mono text-sm">Advertisement Space</span>
          </div>
          <p className="text-muted-foreground font-serif italic">© 2026 Postie. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}
