import { PageHeader } from "@/components/PageHeader";
import { ShieldCheck } from "lucide-react";

export default function GdprPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<ShieldCheck className="h-5 w-5" />} title="GDPR Compliance" description="How we comply with the General Data Protection Regulation." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> March 21, 2026</p>
        <h2 className="text-foreground font-display">Our Commitment to GDPR</h2>
        <p className="text-muted-foreground">MUTECH BAAR is committed to protecting the privacy and rights of individuals in accordance with the General Data Protection Regulation (GDPR). This page outlines how we comply with GDPR requirements and your rights as a data subject.</p>
        <h2 className="text-foreground font-display">Data We Collect</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub is designed with privacy-first principles. We collect minimal data:</p>
        <ul className="text-muted-foreground"><li>Anonymous usage analytics (no personally identifiable information)</li><li>Files you upload are processed in-memory and never permanently stored</li><li>No user accounts or registration required</li><li>No tracking of individual user behavior</li></ul>
        <h2 className="text-foreground font-display">Your Rights Under GDPR</h2>
        <p className="text-muted-foreground">Under the GDPR, you have the following rights:</p>
        <ul className="text-muted-foreground"><li><strong>Right of access</strong> — You can request a copy of any personal data we hold about you.</li><li><strong>Right to rectification</strong> — You can request correction of inaccurate personal data.</li><li><strong>Right to erasure</strong> — You can request deletion of your personal data.</li><li><strong>Right to restrict processing</strong> — You can request we limit how we use your data.</li><li><strong>Right to data portability</strong> — You can request your data in a machine-readable format.</li><li><strong>Right to object</strong> — You can object to our processing of your personal data.</li></ul>
        <h2 className="text-foreground font-display">Legal Basis for Processing</h2>
        <p className="text-muted-foreground">We process data based on: legitimate interest (analytics to improve our service), consent (for cookies and advertising), and contractual necessity (to provide our tools and services).</p>
        <h2 className="text-foreground font-display">Data Protection Officer</h2>
        <p className="text-muted-foreground">For any GDPR-related inquiries, contact our Data Protection Officer at <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a></p>
      </div>
    </div>
  );
}
