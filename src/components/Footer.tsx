import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/founder" className="text-muted-foreground hover:text-primary transition-colors">Founder</Link></li>
              <li><Link to="/editorial-team" className="text-muted-foreground hover:text-primary transition-colors">Editorial Team</Link></li>
              <li><Link to="/content-review-process" className="text-muted-foreground hover:text-primary transition-colors">Content Review Process</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/gdpr" className="text-muted-foreground hover:text-primary transition-colors">GDPR</Link></li>
              <li><Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">Disclaimer</Link></li>
              <li><Link to="/dmca" className="text-muted-foreground hover:text-primary transition-colors">DMCA</Link></li>
              <li><Link to="/editorial-policy" className="text-muted-foreground hover:text-primary transition-colors">Editorial Policy</Link></li>
              <li><Link to="/ai-policy" className="text-muted-foreground hover:text-primary transition-colors">AI Usage Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">MUTECH BAAR</h4>
            <p className="text-muted-foreground text-sm">Next-generation AI-powered media processing platform by Muhammad Usman Zaheer.</p>
            <p className="text-muted-foreground text-xs mt-2">zhaeerabbas01@gmail.com</p>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-foreground mb-2">Partner Marketplace</p>
              <a
                href="https://mutechai.base44.app/"
                target="_blank"
                rel="noopener noreferrer dofollow"
                className="text-xs text-primary hover:underline block"
              >
                MUTECHAI — Buy & Sell AI Tools, Agents & SaaS
              </a>
              <p className="text-[10px] text-muted-foreground mt-1">Built by Builders, for the AI Generation.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} MUTECH BAAR. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">U</div>
            <span className="font-display text-xs font-bold gradient-text">ULTRA MEDIA AI HUB v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
