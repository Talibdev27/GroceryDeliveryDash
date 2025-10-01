import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/utils";
import { Address } from "@/types";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Home,
  MapPin, 
  Timer, 
  Truck 
} from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters",
  }),
  zipCode: z.string().min(4, {
    message: "Zip code must be at least 4 characters",
  }),
  deliveryTime: z.string(),
  paymentMethod: z.enum(["uzcard", "humo", "click", "payme", "international"]),
  saveAddress: z.boolean().default(false),
  contactFree: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<"address" | "delivery" | "payment" | "confirmation">("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Debug current step
  console.log("🛒 CHECKOUT: Current step:", paymentStep);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const loadSavedAddresses = useCallback(async () => {
    try {
      const data = await userApi.getAddresses();
      setSavedAddresses(data.addresses || []);
      
      // Set default address if available
      const defaultAddress = data.addresses?.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        fillFormWithAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    }
  }, []);

  // Load saved addresses when user is available
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user, loadSavedAddresses]);

  const fillFormWithAddress = (address: Address) => {
    form.setValue("fullName", address.fullName);
    form.setValue("address", address.address);
    form.setValue("city", address.city);
    form.setValue("state", address.state);
    form.setValue("zipCode", address.postalCode);
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      deliveryTime: "asap",
      paymentMethod: "uzcard",
      saveAddress: false,
      contactFree: false,
      notes: "",
    },
  });

  // Auto-advance removed - user must manually progress through steps
  
  const onError = (errors: any) => {
    console.log("🛒 CHECKOUT: Form validation errors:", errors);
    // Navigate to the first step with errors
    if (errors.fullName || errors.email || errors.phone || errors.address || errors.city || errors.state || errors.zipCode) {
      console.log("🛒 CHECKOUT: Address errors found, navigating to address step");
      setPaymentStep("address");
    } else if (errors.deliveryTime) {
      console.log("🛒 CHECKOUT: Delivery errors found, navigating to delivery step");
      setPaymentStep("delivery");
    }
  };
  
  const onSubmitActual = async (data: FormValues) => {
    console.log("🚀 CHECKOUT: Form submitted!");
    console.log("🚀 CHECKOUT: Form data:", data);
    
    try {
      // Save address if requested and create order
      let addressId = selectedAddressId;
      
      // If save address is checked or no address is selected, create a new one
      if (data.saveAddress || !addressId) {
        const addressResponse = await userApi.createAddress({
          title: "Home",
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.zipCode,
          country: "Uzbekistan",
          phone: data.phone,
          isDefault: savedAddresses.length === 0, // Make first address default
        });
        addressId = addressResponse.address.id;
      }
      
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price,
        salePrice: item.salePrice,
        sale: item.sale || false,
      }));
      
      // Create the order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          addressId,
          paymentMethod: data.paymentMethod,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      
      const result = await response.json();
      console.log("✅ Order created:", result);
      
      // Show order confirmation
      setOrderPlaced(true);
      
      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        setLocation("/");
      }, 5000);
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };
  
  // Wrapper to ensure we only submit on the payment step, otherwise advance
  const onSubmit = (data: FormValues) => {
    if (paymentStep !== "payment") {
      console.log("🛒 CHECKOUT: Form valid but not on payment step, advancing");
      handleContinue(paymentStep);
      return;
    }
    onSubmitActual(data);
  };
  
  // Determine the next step based on the current step
  const handleContinue = async (step: "address" | "delivery" | "payment") => {
    switch (step) {
      case "address":
        const addressValid = await form.trigger(["fullName", "email", "phone", "address", "city", "state", "zipCode"]);
        if (!addressValid) {
          return;
        }
        setPaymentStep("delivery");
        break;
      case "delivery":
        const deliveryValid = await form.trigger(["deliveryTime"]);
        if (!deliveryValid) {
          return;
        }
        setPaymentStep("payment");
        break;
      case "payment":
        form.handleSubmit(onSubmitActual, onError)();
        break;
    }
  };
  
  // Go back to previous step
  const handleBack = () => {
    switch (paymentStep) {
      case "delivery":
        setPaymentStep("address");
        break;
      case "payment":
        setPaymentStep("delivery");
        break;
      default:
        break;
    }
  };
  
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-neutral-200 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-4">{t("checkout.orderConfirmed")}</h1>
          <p className="text-neutral-600 mb-6">{t("checkout.orderConfirmedMessage")}</p>
          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <p className="font-medium">{t("checkout.orderNumber")}: #ORD-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
          <p className="text-sm text-neutral-500 mb-8">{t("checkout.redirectMessage")}</p>
          <Link href="/">
            <Button className="w-full">
              {t("checkout.backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-neutral-200 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-heading font-bold mb-4">{t("checkout.emptyCart")}</h1>
          <p className="text-neutral-600 mb-6">{t("checkout.emptyCartMessage")}</p>
          <Link href="/products">
            <Button>
              {t("checkout.startShopping")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{t("seo.checkout.title")}</title>
        <meta name="description" content={t("seo.checkout.description")} />
      </Helmet>
      
      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <h1 className="text-2xl font-heading font-bold">{t("checkout.title")}</h1>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, onError)} className="p-6 space-y-6">
                    {/* Address Information */}
                    <div className={paymentStep !== "address" ? "hidden" : ""}>
                      <h2 className="text-lg font-medium mb-4 flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        {t("checkout.deliveryAddress")}
                      </h2>
                      
                      {/* Saved Addresses */}
                      {savedAddresses.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-md font-medium mb-3">Saved Addresses</h3>
                          <div className="space-y-2">
                            {savedAddresses.map((address) => (
                              <div
                                key={address.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedAddressId === address.id
                                    ? "border-primary bg-primary/5"
                                    : "border-neutral-200 hover:border-neutral-300"
                                }`}
                                onClick={() => {
                                  setSelectedAddressId(address.id);
                                  fillFormWithAddress(address);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{address.title}</p>
                                    <p className="text-sm text-neutral-600">
                                      {address.fullName}, {address.address}, {address.city}, {address.state} {address.postalCode}
                                    </p>
                                  </div>
                                  {address.isDefault && (
                                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-neutral-500">
                            Or fill in a new address below:
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.fullName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.fullNamePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.email")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.emailPlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.phone")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.phonePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.address")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.addressPlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.city")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.cityPlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.state")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.statePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.zipCode")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("checkout.zipCodePlaceholder")} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="saveAddress"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t("checkout.saveAddressForFuture")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Delivery Options */}
                    <div className={paymentStep !== "delivery" ? "hidden" : ""}>
                      <h2 className="text-lg font-medium mb-4 flex items-center">
                        <Truck className="mr-2 h-5 w-5 text-primary" />
                        {t("checkout.deliveryOptions")}
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>{t("checkout.deliveryTime")}</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                              >
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "asap" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="asap" id="asap" className="sr-only" />
                                  <label htmlFor="asap" className="flex items-start cursor-pointer">
                                    <div className="shrink-0 mt-1">
                                      <div className={`w-5 h-5 rounded-full border ${field.value === "asap" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                        {field.value === "asap" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="font-medium flex items-center">
                                        <Timer className="h-4 w-4 mr-1" />
                                        {t("checkout.asap")}
                                      </div>
                                      <div className="text-sm text-neutral-500 mt-1">
                                        {t("checkout.asapDescription")}
                                      </div>
                                    </div>
                                  </label>
                                </div>
                                
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "scheduled" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="scheduled" id="scheduled" className="sr-only" />
                                  <label htmlFor="scheduled" className="flex items-start cursor-pointer">
                                    <div className="shrink-0 mt-1">
                                      <div className={`w-5 h-5 rounded-full border ${field.value === "scheduled" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                        {field.value === "scheduled" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <div className="font-medium flex items-center">
                                        <Home className="h-4 w-4 mr-1" />
                                        {t("checkout.scheduled")}
                                      </div>
                                      <div className="text-sm text-neutral-500 mt-1">
                                        {t("checkout.scheduledDescription")}
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("deliveryTime") === "scheduled" && (
                        <div className="mb-6">
                          <FormLabel>{t("checkout.selectTimeSlot")}</FormLabel>
                          <Select defaultValue="slot1">
                            <SelectTrigger>
                              <SelectValue placeholder={t("checkout.selectTimeSlot")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slot1">2:00 PM - 3:00 PM</SelectItem>
                              <SelectItem value="slot2">3:00 PM - 4:00 PM</SelectItem>
                              <SelectItem value="slot3">4:00 PM - 5:00 PM</SelectItem>
                              <SelectItem value="slot4">5:00 PM - 6:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="contactFree"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0 mt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="font-medium block mb-1">
                                {t("checkout.contactFreeDelivery")}
                              </FormLabel>
                              <div className="text-sm text-neutral-500">
                                {t("checkout.contactFreeDescription")}
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("checkout.deliveryNotes")}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={t("checkout.deliveryNotesPlaceholder")}
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Payment Method */}
                    <div className={paymentStep !== "payment" ? "hidden" : ""}>
                      <h2 className="text-lg font-medium mb-4 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-primary" />
                        {t("checkout.paymentMethod")}
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {/* UzCard - National Payment System */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "uzcard" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="uzcard" id="uzcard" className="sr-only" />
                                  <label htmlFor="uzcard" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "uzcard" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "uzcard" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">UzCard</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">UZ</div>
                                      <span className="text-sm text-neutral-500">National</span>
                                    </div>
                                  </label>
                                </div>

                                {/* Humo - Popular Payment System */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "humo" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="humo" id="humo" className="sr-only" />
                                  <label htmlFor="humo" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "humo" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "humo" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">Humo</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-green-600 rounded text-white text-xs font-bold flex items-center justify-center">H</div>
                                      <span className="text-sm text-neutral-500">Contactless</span>
                                    </div>
                                  </label>
                                </div>

                                {/* Click - Mobile Payment */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "click" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="click" id="click" className="sr-only" />
                                  <label htmlFor="click" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "click" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "click" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">Click</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">C</div>
                                      <span className="text-sm text-neutral-500">Mobile</span>
                                    </div>
                                  </label>
                                </div>
                                
                                {/* Payme - Mobile Payment */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "payme" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="payme" id="payme" className="sr-only" />
                                  <label htmlFor="payme" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "payme" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "payme" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">Payme</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-orange-600 rounded text-white text-xs font-bold flex items-center justify-center">P</div>
                                      <span className="text-sm text-neutral-500">Mobile</span>
                                    </div>
                                  </label>
                                </div>
                                
                                {/* International Cards */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "international" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="international" id="international" className="sr-only" />
                                  <label htmlFor="international" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "international" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "international" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">International Cards</div>
                                    </div>
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 w-auto" />
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" className="h-6 w-auto" />
                                    </div>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* UzCard Payment Form */}
                      {form.watch("paymentMethod") === "uzcard" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>UzCard</strong> - National payment system of Uzbekistan
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>UzCard Number</FormLabel>
                              <Input placeholder="•••• •••• •••• ••••" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel>Expiry Date</FormLabel>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div>
                                <FormLabel>CVV</FormLabel>
                                <Input placeholder="•••" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <FormLabel>Cardholder Name</FormLabel>
                            <Input placeholder="Enter cardholder name" />
                          </div>
                        </div>
                      )}

                      {/* Humo Payment Form */}
                      {form.watch("paymentMethod") === "humo" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              <strong>Humo</strong> - Contactless payment system
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Humo Card Number</FormLabel>
                              <Input placeholder="•••• •••• •••• ••••" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel>Expiry Date</FormLabel>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div>
                                <FormLabel>CVV</FormLabel>
                                <Input placeholder="•••" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <FormLabel>Cardholder Name</FormLabel>
                            <Input placeholder="Enter cardholder name" />
                          </div>
                        </div>
                      )}

                      {/* Click Mobile Payment */}
                      {form.watch("paymentMethod") === "click" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm text-purple-800">
                              <strong>Click</strong> - Mobile payment system
                            </p>
                          </div>
                          <div>
                            <FormLabel>Phone Number</FormLabel>
                            <Input placeholder="+998 XX XXX XX XX" />
                          </div>
                          <div>
                            <FormLabel>Click PIN</FormLabel>
                            <Input placeholder="Enter your Click PIN" type="password" />
                          </div>
                        </div>
                      )}

                      {/* Payme Mobile Payment */}
                      {form.watch("paymentMethod") === "payme" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <p className="text-sm text-orange-800">
                              <strong>Payme</strong> - Mobile payment system
                            </p>
                          </div>
                          <div>
                            <FormLabel>Phone Number</FormLabel>
                            <Input placeholder="+998 XX XXX XX XX" />
                          </div>
                          <div>
                            <FormLabel>Payme PIN</FormLabel>
                            <Input placeholder="Enter your Payme PIN" type="password" />
                          </div>
                        </div>
                      )}

                      {/* International Cards */}
                      {form.watch("paymentMethod") === "international" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-800">
                              <strong>International Cards</strong> - Visa, MasterCard
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Card Number</FormLabel>
                              <Input placeholder="•••• •••• •••• ••••" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel>Expiry Date</FormLabel>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div>
                                <FormLabel>CVV</FormLabel>
                                <Input placeholder="•••" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <FormLabel>Cardholder Name</FormLabel>
                            <Input placeholder="Enter cardholder name" />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8">
                        <Button 
                          type="submit" 
                          className="w-full"
                          onClick={async (e) => {
                            e.preventDefault();
                            console.log("🛒 CHECKOUT: Place Order button clicked!");
                            console.log("🛒 CHECKOUT: Form values:", form.getValues());
                            console.log("🛒 CHECKOUT: Form errors:", form.formState.errors);
                            
                            // Trigger validation on all fields
                            const isValid = await form.trigger();
                            console.log("🛒 CHECKOUT: Form is valid:", isValid);
                            
                            if (!isValid) {
                              // Check which step has errors and navigate to it
                              const errors = form.formState.errors;
                              if (errors.fullName || errors.email || errors.phone || errors.address || errors.city || errors.state || errors.zipCode) {
                                console.log("🛒 CHECKOUT: Address errors found, navigating to address step");
                                setPaymentStep("address");
                                return;
                              }
                              if (errors.deliveryTime) {
                                console.log("🛒 CHECKOUT: Delivery errors found, navigating to delivery step");
                                setPaymentStep("delivery");
                                return;
                              }
                              return;
                            }
                            
                            // If valid, submit the form directly (we're on payment step)
                            onSubmitActual(form.getValues());
                          }}
                        >
                          {t("checkout.placeOrder")}
                        </Button>
                        <p className="text-xs text-neutral-500 text-center mt-4">
                          {t("checkout.termsConditionsMessage")}
                        </p>
                      </div>
                    </div>
                    
                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-4 mt-8 border-t border-neutral-200">
                      {paymentStep !== "address" ? (
                        <Button type="button" variant="outline" onClick={handleBack}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t("checkout.back")}
                        </Button>
                      ) : (
                        <Link href="/products">
                          <Button type="button" variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t("checkout.continueShopping")}
                          </Button>
                        </Link>
                      )}
                      
                      {paymentStep !== "payment" && (
                        <Button type="button" onClick={() => handleContinue(paymentStep)}>
                          {paymentStep === "address" ? t("checkout.continueToDelivery") : t("checkout.continueToPayment")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                <div className="p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-heading font-bold">{t("checkout.orderSummary")}</h2>
                </div>
                
                <div className="p-6">
                  <Accordion type="single" collapsible defaultValue="items">
                    <AccordionItem value="items" className="border-none">
                      <AccordionTrigger className="py-2 font-medium">
                        {t("checkout.cartItems", { count: cartItems.length })}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded border border-neutral-200"
                              />
                              <div className="ml-4 flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-neutral-500">
                                  {item.quantity} x {formatCurrency(item.price)}
                                </div>
                              </div>
                              <div className="font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="space-y-3 py-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t("checkout.subtotal")}</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t("checkout.deliveryFee")}</span>
                      <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t("checkout.tip")}</span>
                      <div className="flex space-x-2 rtl:space-x-reverse items-center">
                        <input
                          type="number"
                          className="w-16 text-right border rounded p-1"
                          placeholder="0.00"
                        />
                        <span className="text-primary text-sm">Add</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between py-4 font-bold text-lg">
                    <span>{t("checkout.total")}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  <div className="mt-4">
                    <input
                      type="text"
                      className="w-full border border-neutral-200 rounded-md p-2 text-sm"
                      placeholder={t("checkout.promoCodePlaceholder")}
                    />
                    <div className="text-xs text-neutral-500 mt-2">
                      {t("checkout.promoCodeHint")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
