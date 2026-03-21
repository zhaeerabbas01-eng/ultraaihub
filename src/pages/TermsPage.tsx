import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<FileText className="h-5 w-5" />} title="Terms & Conditions" description="Please read these terms carefully before using our services." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <h2 className="text-foreground font-display">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">By accessing and using Ultra Media AI Hub, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.</p>
        <h2 className="text-foreground font-display">2. Use of Services</h2>
        <p className="text-muted-foreground">Our tools are provided for personal and lawful use only. You agree not to use our services to download, convert, or process any content that you do not have the right to access or modify. You are solely responsible for ensuring compliance with applicable copyright laws.</p>
        <h2 className="text-foreground font-display">3. Intellectual Property</h2>
        <p className="text-muted-foreground">All content, design, and functionality of Ultra Media AI Hub are owned by us and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
        <h2 className="text-foreground font-display">4. Limitation of Liability</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our services, including but not limited to data loss, system damage, or service interruptions.</p>
        <h2 className="text-foreground font-display">5. File Processing</h2>
        <p className="text-muted-foreground">Files uploaded for processing are handled securely and deleted automatically after processing. We do not retain copies of your files. You are responsible for backing up your own data before using our conversion and processing tools.</p>
        <h2 className="text-foreground font-display">6. Modifications</h2>
        <p className="text-muted-foreground">We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>
      </div>
    </div>
  );
}
