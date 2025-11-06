import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { X, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeliveryZoneBannerProps {
  dismissible?: boolean;
  variant?: "default" | "warning" | "info";
  showLink?: boolean;
  className?: string;
}

export default function DeliveryZoneBanner({
  dismissible = true,
  variant = "info",
  showLink = true,
  className = "",
}: DeliveryZoneBannerProps) {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed && dismissible) {
    return null;
  }

  const variantStyles = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-primary/10 border-primary/20 text-primary",
  };

  return (
    <Alert className={`${variantStyles[variant]} ${className}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <AlertTitle className="font-medium mb-1">
              {t("deliveryZone.banner")}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {t("deliveryZone.currentZone")} {t("deliveryZone.expandingSoon")}
              {showLink && (
                <Link href="/location" className="ml-2 underline hover:no-underline">
                  {t("deliveryZone.viewMap")}
                </Link>
              )}
            </AlertDescription>
          </div>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 ml-2"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

