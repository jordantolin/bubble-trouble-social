
import { cn } from "@/lib/utils";

interface BubbleLogoProps {
  className?: string;
}

const BubbleLogo = ({ className }: BubbleLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      <img 
        src="/lovable-uploads/8268f1f2-e2d4-41fe-a95b-0209574c3023.png" 
        alt="Bubble Trouble Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default BubbleLogo;
