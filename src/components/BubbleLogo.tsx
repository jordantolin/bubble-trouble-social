
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BubbleLogoProps {
  className?: string;
  withAnimation?: boolean;
}

const BubbleLogo = ({ className, withAnimation = false }: BubbleLogoProps) => {
  const logoComponent = (
    <div className={cn("relative", className)}>
      {/* Logo image has been removed */}
    </div>
  );

  if (withAnimation) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {logoComponent}
      </motion.div>
    );
  }

  return logoComponent;
};

export default BubbleLogo;
