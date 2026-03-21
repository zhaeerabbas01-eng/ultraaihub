import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<FileText className="h-5 w-5" />} title="Terms of Service" description="Please read these terms carefully before using our services." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <p className="text-muted-foreground">These Terms of Service ("Terms") govern your access to and use of Ultra Media AI Hub, operated by MUTECH BAAR. By accessing or using our Service, you agree to be bound by these Terms.</p>
        
        <h2 className="text-foreground font-display">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">By accessing and using Ultra Media AI Hub, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our services. These terms apply to all visitors, users, and others who access or use the Service.</p>
        
        <h2 className="text-foreground font-display">2. Description of Service</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub provides online media processing tools including video downloading, audio conversion, image conversion, AI-powered image upscaling, file compression, AI thumbnail generation, video trimming, and AI background removal. The Service is provided free of charge and supported by advertising revenue.</p>
        
        <h2 className="text-foreground font-display">3. Use of Services</h2>
        <p className="text-muted-foreground">Our tools are provided for personal and lawful use only. You agree not to use our services to download, convert, or process any content that you do not have the right to access or modify. You are solely responsible for ensuring compliance with applicable copyright laws and the terms of service of content platforms.</p>
        
        <h2 className="text-foreground font-display">4. Intellectual Property</h2>
        <p className="text-muted-foreground">All content, design, code, and functionality of Ultra Media AI Hub are owned by MUTECH BAAR and protected by international intellectual property laws. The Ultra Media AI Hub name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of MUTECH BAAR. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
        
        <h2 className="text-foreground font-display">5. User Responsibilities</h2>
        <p className="text-muted-foreground">You agree to: (a) use the Service only for lawful purposes; (b) not upload malicious files or attempt to exploit our systems; (c) not use automated scripts or bots to access our Service; (d) not attempt to reverse engineer our tools; (e) comply with all applicable local, national, and international laws.</p>
        
        <h2 className="text-foreground font-display">6. File Processing</h2>
        <p className="text-muted-foreground">Files uploaded for processing are handled securely and deleted automatically after processing. We do not retain copies of your files. You are responsible for backing up your own data before using our conversion and processing tools. You retain all rights to the content you upload and the processed output.</p>
        
        <h2 className="text-foreground font-display">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub is provided "as is" and "as available" without warranties of any kind, express or implied. MUTECH BAAR and Muhammad Usman Zaheer shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from the use of our services, including but not limited to data loss, system damage, service interruptions, or loss of revenue.</p>
        
        <h2 className="text-foreground font-display">8. Indemnification</h2>
        <p className="text-muted-foreground">You agree to defend, indemnify, and hold harmless MUTECH BAAR, its founder Muhammad Usman Zaheer, and any affiliates from any claims, damages, obligations, losses, liabilities, or expenses arising from your use of the Service or your violation of these Terms.</p>
        
        <h2 className="text-foreground font-display">9. Service Availability</h2>
        <p className="text-muted-foreground">We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to the Service. We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We shall not be liable for any modification, suspension, or discontinuance of the Service.</p>
        
        <h2 className="text-foreground font-display">10. Modifications to Terms</h2>
        <p className="text-muted-foreground">We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Continued use of our services after changes constitutes acceptance of the modified terms. We encourage you to review these Terms periodically.</p>
        
        <h2 className="text-foreground font-display">11. Governing Law</h2>
        <p className="text-muted-foreground">These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.</p>
        
        <h2 className="text-foreground font-display">12. Contact</h2>
        <p className="text-muted-foreground">For questions about these Terms, contact us at <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a> — MUTECH BAAR</p>
      </div>
    </div>
  );
}
