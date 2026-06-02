import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

export default function DmcaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<Shield className="h-5 w-5" />} title="DMCA Policy" description="How we handle copyright concerns and takedown requests." />
      <div className="glass-panel rounded-xl p-6 prose prose-invert prose-sm max-w-none">
        <p><strong>Last updated:</strong> June 2, 2026</p>

        <h2 className="text-foreground font-display">Our Commitment to Copyright</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub, operated by MUTECH BAAR, respects the intellectual property rights of others and expects users of our tools to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (the "DMCA"), we will respond expeditiously to valid notices of alleged copyright infringement that comply with the requirements set out below.</p>

        <h2 className="text-foreground font-display">No Hosted Content</h2>
        <p className="text-muted-foreground">Ultra Media AI Hub provides client-side and metadata-only utilities. We do not host, store, mirror, or redistribute copyrighted videos, audio files, or images. Our YouTube tools only return publicly available metadata via the official YouTube Data API. If you believe a third-party platform is hosting infringing material, please contact that platform directly.</p>

        <h2 className="text-foreground font-display">Filing a DMCA Notice</h2>
        <p className="text-muted-foreground">If you are a copyright owner or authorized representative and believe that content surfaced through our tools infringes your copyright, please send a written notice to our designated agent containing:</p>
        <ul className="text-muted-foreground">
          <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>A description of the material and where it is located on our service (URL).</li>
          <li>Your full contact information (name, address, phone, email).</li>
          <li>A statement that you have a good-faith belief that the use is not authorized.</li>
          <li>A statement, under penalty of perjury, that the information is accurate and that you are authorized to act on behalf of the owner.</li>
        </ul>

        <h2 className="text-foreground font-display">Designated DMCA Agent</h2>
        <p className="text-muted-foreground">Email: <a href="mailto:zhaeerabbas01@gmail.com" className="text-primary hover:underline">zhaeerabbas01@gmail.com</a><br/>Subject line: "DMCA Notice — Ultra Media AI Hub"<br/>Company: MUTECH BAAR</p>

        <h2 className="text-foreground font-display">Counter Notification</h2>
        <p className="text-muted-foreground">If you believe content was disabled by mistake or misidentification, you may submit a counter-notification containing the elements required by 17 U.S.C. §512(g)(3).</p>

        <h2 className="text-foreground font-display">Repeat Infringer Policy</h2>
        <p className="text-muted-foreground">We will, in appropriate circumstances, terminate access for users who are determined to be repeat infringers.</p>

        <h2 className="text-foreground font-display">False Claims</h2>
        <p className="text-muted-foreground">Misrepresentations in a DMCA notice may subject the sender to liability under 17 U.S.C. §512(f). Please consult an attorney before filing a notice if you are unsure.</p>
      </div>
    </div>
  );
}
