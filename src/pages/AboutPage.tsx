import { PageHeader } from "@/components/PageHeader";
import { Building2, Mail, Globe, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader icon={<Building2 className="h-5 w-5" />} title="About MUTECH BAAR" description="Pioneering next-generation AI-powered media solutions." />
      
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">MUTECH BAAR is a technology company founded by <strong className="text-foreground">Muhammad Usman Zaheer</strong>, dedicated to making professional media processing tools accessible to everyone. Our flagship product, <strong className="text-foreground">Ultra Media AI Hub</strong>, combines cutting-edge artificial intelligence with intuitive design to deliver powerful media tools that work entirely in your browser.</p>
          <p className="text-muted-foreground leading-relaxed mt-4">We believe that professional-grade video downloading, audio conversion, image processing, and AI enhancement should be free, fast, and available without registration. Our platform processes millions of files monthly while maintaining the highest standards of privacy and security.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Users, title: "10M+ Users", desc: "Trusted by millions of content creators worldwide" },
            { icon: Globe, title: "Global Reach", desc: "Available in 190+ countries with zero restrictions" },
            { icon: Mail, title: "24/7 Support", desc: "Dedicated support team ready to help anytime" },
          ].map((item, i) => (
            <div key={i} className="glass-panel rounded-xl p-6 text-center">
              <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-bold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Why Choose Ultra Media AI Hub?</h2>
          <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>Ultra Media AI Hub stands apart from other online media tools by combining <strong className="text-foreground">artificial intelligence</strong> with browser-based processing. Unlike traditional tools that upload your files to remote servers, our platform processes most operations locally in your browser, ensuring <strong className="text-foreground">maximum privacy and speed</strong>.</p>
            <p>Our <strong className="text-foreground">AI-powered background remover</strong> uses advanced neural networks to precisely detect and remove backgrounds from images, producing professional transparent PNGs in seconds. The <strong className="text-foreground">AI thumbnail generator</strong> leverages Google's Gemini AI to suggest compelling titles and design concepts that boost click-through rates.</p>
            <p>Whether you're a <strong className="text-foreground">YouTuber</strong> needing thumbnails, a <strong className="text-foreground">social media manager</strong> batch-converting images, a <strong className="text-foreground">podcaster</strong> converting audio files, or a <strong className="text-foreground">marketer</strong> compressing assets — Ultra Media AI Hub has you covered with professional-grade tools that are completely free to use.</p>
            <p>Founded by <strong className="text-foreground">Muhammad Usman Zaheer</strong> at <strong className="text-foreground">MUTECH BAAR</strong>, our mission is to democratize professional media tools. We're committed to keeping Ultra Media AI Hub free, fast, and constantly improving with the latest AI innovations.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact</h2>
          <p className="text-muted-foreground">Email: <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
          <p className="text-muted-foreground mt-2">Company: MUTECH BAAR</p>
          <p className="text-muted-foreground mt-2">Founder: Muhammad Usman Zaheer</p>
        </motion.div>
      </div>
    </div>
  );
}
