import { PageHeader } from "@/components/PageHeader";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Cookie className="h-5 w-5" />} title="Cookie Policy" description="How we use cookies on our website." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <h2 className="text-foreground font-display">What Are Cookies</h2>
        <p className="text-muted-foreground">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners. Ultra Media AI Hub uses cookies to enhance your browsing experience and provide essential functionality.</p>
        <h2 className="text-foreground font-display">How We Use Cookies</h2>
        <p className="text-muted-foreground">We use cookies for the following purposes:</p>
        <ul className="text-muted-foreground"><li><strong>Essential cookies</strong> — Required for the website to function properly, including session management and security.</li><li><strong>Analytics cookies</strong> — Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li><li><strong>Advertising cookies</strong> — Used by Google AdSense to display relevant advertisements based on your interests.</li><li><strong>Preference cookies</strong> — Remember your settings and preferences for a better experience.</li></ul>
        <h2 className="text-foreground font-display">Third-Party Cookies</h2>
        <p className="text-muted-foreground">We use Google AdSense for advertising, which may place cookies on your device. Google uses these cookies to serve ads based on your prior visits to our website and other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>.</p>
        <h2 className="text-foreground font-display">Managing Cookies</h2>
        <p className="text-muted-foreground">You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of this website. Most browsers allow you to view, delete, and block cookies from websites.</p>
        <h2 className="text-foreground font-display">Contact</h2>
        <p className="text-muted-foreground">For questions about our cookie policy, contact <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
      </div>
    </div>
  );
}
