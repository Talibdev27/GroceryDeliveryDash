import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
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
  paymentMethod: z.enum(["creditCard", "paypal", "applePay"]),
  saveAddress: z.boolean().default(false),
  contactFree: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const [paymentStep, setPaymentStep] = useState<"address" | "delivery" | "payment" | "confirmation">("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      deliveryTime: "asap",
      paymentMethod: "creditCard",
      saveAddress: false,
      contactFree: false,
      notes: "",
    },
  });
  
  const onSubmit = (data: FormValues) => {
    // In a real app, this would send the order to an API
    console.log("Order submitted:", data);
    
    // Show order confirmation
    setOrderPlaced(true);
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart();
      setLocation("/");
    }, 5000);
  };
  
  // Determine the next step based on the current step
  const handleContinue = (step: "address" | "delivery" | "payment") => {
    switch (step) {
      case "address":
        form.trigger(["fullName", "email", "phone", "address", "city", "state", "zipCode"]);
        if (
          form.formState.errors.fullName || 
          form.formState.errors.email || 
          form.formState.errors.phone || 
          form.formState.errors.address || 
          form.formState.errors.city || 
          form.formState.errors.state || 
          form.formState.errors.zipCode
        ) {
          return;
        }
        setPaymentStep("delivery");
        break;
      case "delivery":
        setPaymentStep("payment");
        break;
      case "payment":
        form.handleSubmit(onSubmit)();
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Address Information */}
                    <div className={paymentStep !== "address" ? "hidden" : ""}>
                      <h2 className="text-lg font-medium mb-4 flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        {t("checkout.deliveryAddress")}
                      </h2>
                      
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
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "creditCard" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="creditCard" id="creditCard" className="sr-only" />
                                  <label htmlFor="creditCard" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "creditCard" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "creditCard" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">{t("checkout.creditCard")}</div>
                                    </div>
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 w-auto" />
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" className="h-6 w-auto" />
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="Amex" className="h-6 w-auto" />
                                    </div>
                                  </label>
                                </div>
                                
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "paypal" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                  <label htmlFor="paypal" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "paypal" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "paypal" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">PayPal</div>
                                    </div>
                                    <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="PayPal" className="h-6 w-auto" />
                                  </label>
                                </div>
                                
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "applePay" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="applePay" id="applePay" className="sr-only" />
                                  <label htmlFor="applePay" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "applePay" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "applePay" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">Apple Pay</div>
                                    </div>
                                    <img src="https://cdn-icons-png.flaticon.com/512/888/888871.png" alt="Apple Pay" className="h-6 w-auto" />
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("paymentMethod") === "creditCard" && (
                        <div className="mt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <FormLabel>{t("checkout.cardNumber")}</FormLabel>
                              <Input placeholder="•••• •••• •••• ••••" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FormLabel>{t("checkout.expiryDate")}</FormLabel>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div>
                                <FormLabel>{t("checkout.cvv")}</FormLabel>
                                <Input placeholder="•••" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <FormLabel>{t("checkout.nameOnCard")}</FormLabel>
                            <Input placeholder={t("checkout.nameOnCardPlaceholder")} />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8">
                        <Button type="submit" className="w-full">
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
