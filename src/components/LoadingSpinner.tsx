import { motion } from "framer-motion";

export function LoadingSpinner({ text = "Processing..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="relative">
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-muted"
          style={{ borderTopColor: "hsl(var(--primary))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-muted"
          style={{ borderBottomColor: "hsl(var(--accent))" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
}
