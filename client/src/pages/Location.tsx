import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MapPicker from "@/components/ui/MapPicker";

export default function Location() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  // Market location coordinates
  const marketCoordinates: [number, number] = [41.3680822, 69.2937804];
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=41.3680822,69.2937804";
  
  // Handle location selection (for MapPicker, though we won't use it for navigation here)
  const handleLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
  }) => {
    // Location selected - could be used for future features
    console.log('Location selected:', location);
  };

  return (
    <>
      <Helmet>
        <title>{t("location.title")} - Diyor Market</title>
        <meta name="description" content={t("location.subtitle")} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
            {t("location.title")}
          </h1>
          <p className="text-neutral-600 text-lg">
            {t("location.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{t("location.mapTitle")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neutral-700 leading-relaxed">
                  {t("location.address")}
                </p>
                <Button
                  asChild
                  className="w-full"
                  variant="outline"
                >
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <span>{t("location.getDirections")}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t("location.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-neutral-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">{t("footer.phone")}</p>
                    <a
                      href="tel:+11234567890"
                      className="text-primary hover:underline"
                    >
                      +1 (123) 456-7890
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Mail className="h-5 w-5 text-neutral-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">{t("footer.email")}</p>
                    <a
                      href="mailto:help@diyormarket.com"
                      className="text-primary hover:underline"
                    >
                      help@diyormarket.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("location.mapTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialCoordinates={marketCoordinates}
                  initialAddress={t("location.address")}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

