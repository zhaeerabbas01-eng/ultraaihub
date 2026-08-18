import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "umah-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* storage blocked */
    }
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl glass-panel rounded-xl border border-border/60 p-4 shadow-lg flex flex-col md:flex-row md:items-center gap-3">
        <Cookie className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground flex-1">
          We use essential cookies to run this site and, with your consent, advertising cookies
          (Google AdSense) to show relevant ads. Read our{" "}
          <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> and{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => decide("rejected")}>
            Reject non-essential
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}
