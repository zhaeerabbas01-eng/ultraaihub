import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">{description}</p>
    </motion.div>
  );
}
