import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg 
        viewBox="0 0 200 200" 
        className={cn(sizeClasses[size], "text-primary flex-shrink-0")}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Speed lines (left side) */}
        <line x1="10" y1="85" x2="35" y2="85" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"/>
        <line x1="10" y1="100" x2="40" y2="100" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"/>
        <line x1="10" y1="115" x2="45" y2="115" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"/>
        
        {/* Basket body */}
        <path d="M 55 90 L 50 140 L 150 140 L 145 90 Z" fill="#16a34a"/>
        
        {/* Basket rim */}
        <rect x="48" y="85" width="100" height="8" rx="3" fill="#15803d"/>
        
        {/* Basket vertical slats */}
        <rect x="65" y="95" width="5" height="38" fill="#fef3c7" rx="1"/>
        <rect x="80" y="95" width="5" height="38" fill="#fef3c7" rx="1"/>
        <rect x="95" y="95" width="5" height="38" fill="#fef3c7" rx="1"/>
        <rect x="110" y="95" width="5" height="38" fill="#fef3c7" rx="1"/>
        <rect x="125" y="95" width="5" height="38" fill="#fef3c7" rx="1"/>
        
        {/* Groceries */}
        {/* Bread (baguette) */}
        <ellipse cx="75" cy="65" rx="10" ry="22" fill="#d97706" transform="rotate(-20 75 65)"/>
        <ellipse cx="72" cy="62" rx="3" ry="5" fill="#fbbf24" transform="rotate(-20 72 62)"/>
        <ellipse cx="75" cy="68" rx="3" ry="5" fill="#fbbf24" transform="rotate(-20 75 68)"/>
        <ellipse cx="78" cy="70" rx="3" ry="5" fill="#fbbf24" transform="rotate(-20 78 70)"/>
        
        {/* Apple */}
        <circle cx="100" cy="68" r="12" fill="#dc2626"/>
        <ellipse cx="98" cy="65" rx="3" ry="4" fill="#b91c1c" opacity="0.4"/>
        <path d="M 100 56 Q 97 60 100 63" stroke="#15803d" strokeWidth="3" fill="none"/>
        <ellipse cx="103" cy="58" rx="5" ry="4" fill="#16a34a" transform="rotate(-30 103 58)"/>
        
        {/* Bottle */}
        <rect x="115" y="55" width="12" height="25" rx="2" fill="#16a34a"/>
        <rect x="117" y="50" width="8" height="6" rx="1" fill="#15803d"/>
        <rect x="117" y="65" width="8" height="3" fill="#fef3c7" opacity="0.3"/>
        
        {/* Wheels */}
        <circle cx="80" cy="150" r="12" fill="#15803d"/>
        <circle cx="120" cy="150" r="12" fill="#15803d"/>
        <circle cx="80" cy="150" r="5" fill="#fef3c7"/>
        <circle cx="120" cy="150" r="5" fill="#fef3c7"/>
      </svg>
      
      {showText && (
        <div className={cn("text-center font-bold text-primary uppercase tracking-wide", textSizes[size])}>
          <div>GROCERY</div>
          <div>DELIVERY</div>
        </div>
      )}
    </div>
  );
}
