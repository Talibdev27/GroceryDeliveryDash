import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  MapPin, 
  Phone, 
  Mail,
  Leaf
} from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-heading font-bold text-xl">Diyor Market</span>
            </Link>
            <p className="text-neutral-400 mb-4">{t("footer.tagline")}</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-neutral-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.shopping")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-neutral-400 hover:text-white">
                  {t("footer.browseCategories")}
                </Link>
              </li>
              <li>
                <Link href="/products?onSale=true" className="text-neutral-400 hover:text-white">
                  {t("footer.dailyDeals")}
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-neutral-400 hover:text-white">
                  {t("footer.giftCards")}
                </Link>
              </li>
              <li>
                <Link href="/meal-kits" className="text-neutral-400 hover:text-white">
                  {t("footer.mealKits")}
                </Link>
              </li>
              <li>
                <Link href="/products?organic=true" className="text-neutral-400 hover:text-white">
                  {t("footer.organicItems")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.account")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-neutral-400 hover:text-white">
                  {t("footer.myAccount")}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-neutral-400 hover:text-white">
                  {t("footer.orderHistory")}
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="text-neutral-400 hover:text-white">
                  {t("footer.wishlist")}
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="text-neutral-400 hover:text-white">
                  {t("footer.addresses")}
                </Link>
              </li>
              <li>
                <Link href="/account/payment-methods" className="text-neutral-400 hover:text-white">
                  {t("footer.paymentMethods")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">{t("footer.contactUs")}</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 mt-1 text-neutral-400 flex-shrink-0" />
                <span className="text-neutral-400">
                  {t("footer.address")}
                </span>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <a href="tel:+11234567890" className="text-neutral-400 hover:text-white">
                  {t("footer.phone")}
                </a>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <a href="mailto:help@diyormarket.com" className="text-neutral-400 hover:text-white">
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Diyor Market. {t("footer.allRightsReserved")}
          </p>
          <div className="flex space-x-4 rtl:space-x-reverse items-center">
            <Link href="/privacy-policy" className="text-neutral-400 hover:text-white text-sm">
              {t("footer.privacyPolicy")}
            </Link>
            <span className="text-neutral-600">•</span>
            <Link href="/terms" className="text-neutral-400 hover:text-white text-sm">
              {t("footer.termsOfService")}
            </Link>
            <span className="text-neutral-600">•</span>
            <Link href="/accessibility" className="text-neutral-400 hover:text-white text-sm">
              {t("footer.accessibility")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
