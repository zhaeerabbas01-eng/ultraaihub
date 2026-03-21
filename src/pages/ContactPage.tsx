import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Message sent! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Mail className="h-5 w-5" />} title="Contact Us" description="Have questions or feedback? We'd love to hear from you." />
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-6">
          <h3 className="font-display font-bold text-foreground mb-4">Get in Touch</h3>
          <div className="space-y-4 text-sm">
            <div><p className="text-muted-foreground">Email</p><p className="text-foreground">zhaeerabbas01@gmail.com</p></div>
            <div><p className="text-muted-foreground">Company</p><p className="text-foreground">MUTECH BAAR</p></div>
            <div><p className="text-muted-foreground">Founder</p><p className="text-foreground">Muhammad Usman Zaheer</p></div>
            <div><p className="text-muted-foreground">Response Time</p><p className="text-foreground">Within 24 hours</p></div>
          </div>
        </motion.div>
        <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-4">
          <Input placeholder="Your name" required className="bg-secondary border-border" maxLength={100} />
          <Input type="email" placeholder="Your email" required className="bg-secondary border-border" maxLength={255} />
          <Input placeholder="Subject" required className="bg-secondary border-border" maxLength={200} />
          <Textarea placeholder="Your message..." required className="bg-secondary border-border min-h-[120px]" maxLength={2000} />
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Message
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
