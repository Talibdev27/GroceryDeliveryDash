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
import { validateDeliveryAddress } from "@/lib/delivery-zone";
import { Address, Order } from "@/types";
import AddressManager from "@/components/account/AddressManager";
import LocationSelector from "@/components/ui/LocationSelector";
import DeliveryZoneBanner from "@/components/ui/DeliveryZoneBanner";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Home,
  MapPin, 
  Timer, 
  Truck,
  Loader2,
  Package
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
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  deliveryTime: z.string(),
  paymentMethod: z.enum(["uzcard", "humo", "click", "payme", "international", "cash"]),
  saveAddress: z.boolean().default(false),
  contactFree: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [paymentStep, setPaymentStep] = useState<"address" | "delivery" | "payment" | "confirmation">("address");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryZoneStatus, setDeliveryZoneStatus] = useState<{ isValid: boolean; message: string } | null>(null);

  // Initialize form BEFORE any conditional returns (Rules of Hooks)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: "",
      coordinates: undefined,
      deliveryTime: "asap",
      paymentMethod: "uzcard",
      saveAddress: false,
      contactFree: false,
      notes: "",
    },
  });

  // Debug current step
  console.log("🛒 CHECKOUT: Current step:", paymentStep);

  // Debug user data for form
  console.log('🔍 User data for form:', {
    user,
    email: user?.email,
    phone: user?.phone,
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    authLoading
  });

  // Require authentication for checkout
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("🛒 CHECKOUT: User not authenticated, redirecting to login");
      setLocation("/auth?returnUrl=/checkout");
    }
  }, [user, authLoading, setLocation]);

  // Re-populate form fields when user data loads
  useEffect(() => {
    if (user && !authLoading) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const currentFullName = form.getValues('fullName');
      const currentEmail = form.getValues('email');
      const currentPhone = form.getValues('phone');
      
      // Only set if field is empty or matches user data (to handle initial load)
      if (fullName && (!currentFullName || currentFullName === `${user.firstName || ""} ${user.lastName || ""}`.trim())) {
        form.setValue('fullName', fullName);
      }
      if (user.email && (!currentEmail || currentEmail === user.email)) {
        form.setValue('email', user.email);
      }
      if (user.phone && (!currentPhone || currentPhone === user.phone)) {
        form.setValue('phone', user.phone);
      }
    }
  }, [user, authLoading, form]);

  const fillFormWithAddress = (address: Address) => {
    setSelectedAddress(address);
    form.setValue("fullName", address.fullName);
    form.setValue("address", address.address);
    if (address.latitude && address.longitude) {
      form.setValue("coordinates", {
        lat: parseFloat(address.latitude.toString()),
        lng: parseFloat(address.longitude.toString())
      });
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t("checkout.loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  // Don't render checkout if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Auto-advance removed - user must manually progress through steps
  
  const onError = (errors: any) => {
    console.log("🛒 CHECKOUT: Form validation errors:", errors);
    // Navigate to the first step with errors
    if (errors.fullName || errors.email || errors.phone || errors.address) {
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
    
    // Validate delivery zone before proceeding
    // Extract district from multiple sources: selected address state, address text, or coordinates
    const addressText = (data.address || '').toLowerCase();
    
    // Comprehensive keyword list for Yunusabad district
    const yunusabadKeywords = [
      'yunusabad', 'yunusobod', 'юнусабад', 'юнусобод',
      'yunusobod tumani', 'yunusobod dahasi', 'yunusabad district',
      'yunusabad tumani', 'yunusabad dahasi',
      'yunus abad', 'yunus obod', // With spaces
      'mavze', // Neighborhood indicator (13-mavze, etc.)
    ];
    
    // Priority 1: Use district from selected address (most reliable)
    // Check both state and city fields for district keywords (case-insensitive)
    let district: string | undefined;
    if (selectedAddress) {
      const stateLower = (selectedAddress.state || '').toLowerCase();
      const cityLower = (selectedAddress.city || '').toLowerCase();
      
      // Check if state or city contains district keywords
      const stateHasKeyword = yunusabadKeywords.some(keyword => 
        stateLower.includes(keyword.toLowerCase())
      );
      const cityHasKeyword = yunusabadKeywords.some(keyword => 
        cityLower.includes(keyword.toLowerCase())
      );
      
      if (stateHasKeyword) {
        district = selectedAddress.state;
      } else if (cityHasKeyword) {
        district = selectedAddress.city;
      } else if (selectedAddress.state) {
        district = selectedAddress.state; // Use state even if no keyword match
      } else if (selectedAddress.city) {
        district = selectedAddress.city; // Use city even if no keyword match
      }
    }
    
    // Priority 2: Check if address text contains Yunusabad keywords
    const hasYunusabadKeyword = yunusabadKeywords.some(keyword => 
      addressText.includes(keyword.toLowerCase())
    );
    
    // Priority 3: Extract district from address parts if available
    if (!district && data.address) {
      const addressParts = data.address.split(',').map((p: string) => p.trim());
      
      // Find part that contains district keywords
      const districtPart = addressParts.find((p: string) => {
        const partLower = p.toLowerCase();
        return yunusabadKeywords.some(keyword => 
          partLower.includes(keyword.toLowerCase())
        ) || partLower.includes('tumani') || partLower.includes('dahasi');
      });
      
      if (districtPart) {
        district = districtPart;
      }
    }
    
    // Priority 4: If address contains keyword but no district extracted, set it explicitly
    if (!district && hasYunusabadKeyword) {
      district = 'Yunusabad'; // Set explicit district for validation
    }
    
    // Priority 5: If coordinates exist and are in Tashkent area, pass them for validation
    // (The lenient validation will handle coordinates even without district)
    
    console.log("📍 Delivery zone validation:", {
      address: data.address,
      selectedAddressState: selectedAddress?.state,
      selectedAddressCity: selectedAddress?.city,
      district,
      hasKeyword: hasYunusabadKeyword,
      coordinates: data.coordinates
    });
    
    const zoneValidation = validateDeliveryAddress(
      data.coordinates, 
      data.address,
      undefined, // subtitle not available in form data
      district || (hasYunusabadKeyword ? 'Yunusabad' : undefined)
    );
    if (!zoneValidation.isValid) {
      setPaymentStep("address");
      setDeliveryZoneStatus(zoneValidation);
      form.setError("coordinates", {
        type: "manual",
        message: t("deliveryZone.outOfZoneMessage")
      });
      toast({
        title: t("checkout.errors.deliveryZone"),
        description: zoneValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save address if requested and create order
      let addressId = selectedAddressId;
      
      // If save address is checked or no address is selected, try to create a new one
      if (data.saveAddress || !addressId) {
        try {
        const addressResponse = await userApi.createAddress({
          title: "Home",
          addressType: "home",
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: "Tashkent", // Default city
          state: "Tashkent", // Default state
          postalCode: "100000", // Default postal code for Tashkent
          country: "Uzbekistan",
          latitude: data.coordinates?.lat,
          longitude: data.coordinates?.lng,
          isDefault: false, // Don't auto-set as default
        });
        addressId = addressResponse.address.id;
        } catch (addressError: any) {
          // Handle duplicate address error gracefully
          console.log("📍 Address creation error caught:", addressError);
          
          const errorMessage = addressError instanceof Error 
            ? addressError.message 
            : (addressError?.error || String(addressError) || "Unknown error");
          
          console.log("📍 Error message:", errorMessage);
          
          // Check for duplicate address error (case-insensitive, various formats)
          const isDuplicateError = errorMessage.toLowerCase().includes("already exists") || 
                                   errorMessage.toLowerCase().includes("duplicate") ||
                                   errorMessage.includes("This address already exists");
          
          if (isDuplicateError) {
            // Address already exists - find and reuse it
            console.log("📍 Address already exists, finding existing address...");
            
            try {
              const addressesResponse = await userApi.getAddresses();
              const existingAddresses = addressesResponse.addresses || [];
              console.log("📍 Found", existingAddresses.length, "existing addresses");
              
              // Find matching address by comparing address, city, and postalCode
              const matchingAddress = existingAddresses.find((addr: Address) => {
                const addrMatch = addr.address.toLowerCase().trim() === data.address.toLowerCase().trim();
                const cityMatch = addr.city.toLowerCase().trim() === "Tashkent".toLowerCase().trim();
                const postalMatch = addr.postalCode === "100000" || !addr.postalCode; // Allow missing postal code
                return addrMatch && cityMatch && postalMatch;
              });
              
              if (matchingAddress) {
                addressId = matchingAddress.id;
                console.log("✅ Found existing address, reusing ID:", addressId);
                toast({
                  title: t("checkout.addressReused"),
                  description: t("checkout.addressReusedMessage"),
                  variant: "default",
                });
              } else if (existingAddresses.length > 0) {
                // Couldn't find exact match, but address exists - use first address
                addressId = existingAddresses[0].id;
                console.log("⚠️ Using first available address (no exact match):", addressId);
                toast({
                  title: t("checkout.addressReused"),
                  description: t("checkout.addressReusedMessage"),
                  variant: "default",
                });
              } else {
                // No addresses found - try to proceed without saving address
                console.log("⚠️ No existing addresses found, proceeding without saving address");
                // Don't throw error - just proceed without addressId (backend might handle it)
                // But we need an addressId for the order, so this is a problem
                // Let's use selectedAddressId if available, otherwise we need to handle this
                if (!addressId && selectedAddressId) {
                  addressId = selectedAddressId;
                  console.log("✅ Using previously selected address:", addressId);
                }
              }
            } catch (lookupError) {
              console.error("❌ Error looking up existing addresses:", lookupError);
              // If lookup fails, try to use selectedAddressId if available
              if (!addressId && selectedAddressId) {
                addressId = selectedAddressId;
                console.log("✅ Fallback: Using previously selected address:", addressId);
              }
              // If still no addressId, we'll let the order creation fail with a clear error
            }
          } else {
            // Other address creation errors - log and rethrow to be handled by outer catch
            console.error("❌ Address creation failed with non-duplicate error:", errorMessage);
            throw addressError;
          }
        }
      }
      
      // Ensure we have an addressId before creating order
      if (!addressId) {
        console.error("❌ No addressId available for order creation");
        setIsSubmitting(false);
        toast({
          title: t("checkout.errors.orderFailed"),
          description: t("checkout.errors.addressRequired"),
          variant: "destructive",
        });
        return;
      }
      
      console.log("✅ Using addressId for order:", addressId);
      
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price,
        salePrice: item.salePrice,
        sale: item.sale || false,
      }));
      
      // Create the order
      console.log("🛒 Creating order with:", {
        itemsCount: orderItems.length,
        addressId,
        paymentMethod: data.paymentMethod
      });
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies for authentication
        body: JSON.stringify({
          items: orderItems,
          addressId,
          paymentMethod: data.paymentMethod,
        }),
      });
      
      console.log("🛒 Order API response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        console.error("❌ Order creation failed:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }
      
      const result = await response.json();
      console.log("✅ Order API response:", result);
      
      // Validate that we got an order back
      if (!result || !result.order) {
        console.error("❌ Order response missing order data:", result);
        throw new Error(t("checkout.errors.generic"));
      }
      
      // Store the actual order data
      setOrderData(result.order);
      console.log("✅ Order stored:", result.order.id);
      
      // Show success toast
      toast({
        title: t("checkout.orderConfirmed"),
        description: t("checkout.orderSuccessMessage"),
      });
      
      // Show order confirmation
      setOrderPlaced(true);
      setIsSubmitting(false);
      
      // Clear cart after successful order
        clearCart();
      
      console.log("✅ Order flow completed successfully");
      
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      setIsSubmitting(false);
      
      // Show detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'string' ? error : t("checkout.errors.generic"));
      
      console.error("❌ Error message to show:", errorMessage);
      
      // Only show error if it's not already handled (e.g., duplicate address was handled above)
      // Check if this is a network/order creation error vs address error
      const isAddressError = errorMessage.toLowerCase().includes("address") && 
        (errorMessage.toLowerCase().includes("already exists") || 
         errorMessage.toLowerCase().includes("address"));
      
      // Don't show duplicate address errors again if we already handled them
      const isHandledDuplicate = isAddressError && errorMessage.toLowerCase().includes("already exists");
      
      if (!isHandledDuplicate) {
        toast({
          title: t("checkout.errors.orderFailed"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };
  
  // Wrapper to ensure we only submit on the payment step, otherwise advance
  const onSubmit = (data: FormValues) => {
    if (paymentStep !== "payment" && paymentStep !== "confirmation") {
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
        const addressValid = await form.trigger(["fullName", "email", "phone", "address"]);
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

  // Shared Place Order button click handler
  const handlePlaceOrderClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("🛒 CHECKOUT: Place Order button clicked!");
    console.log("🛒 CHECKOUT: Form values:", form.getValues());
    console.log("🛒 CHECKOUT: Form errors:", form.formState.errors);
    
    // Ensure we're on payment step
    if (paymentStep !== "payment") {
      console.log("🛒 CHECKOUT: Not on payment step, navigating to payment step");
      setPaymentStep("payment");
      return;
    }
    
    // Trigger validation on all fields
    const isValid = await form.trigger();
    console.log("🛒 CHECKOUT: Form is valid:", isValid);
    
    if (!isValid) {
      // Check which step has errors and navigate to it
      const errors = form.formState.errors;
      if (errors.fullName || errors.email || errors.phone || errors.address || errors.coordinates) {
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
    
    // If valid, submit the form using handleSubmit to ensure proper validation
    form.handleSubmit(onSubmitActual, onError)();
  };
  
  if (orderPlaced) {
    const orderId = orderData?.id || "N/A";
    const orderTotal = orderData?.total 
      ? (typeof orderData.total === 'string' ? parseFloat(orderData.total) : orderData.total)
      : total;
    const orderSubtotal = orderData?.subtotal 
      ? (typeof orderData.subtotal === 'string' ? parseFloat(orderData.subtotal) : orderData.subtotal)
      : subtotal;
    const orderDeliveryFee = orderData?.deliveryFee 
      ? (typeof orderData.deliveryFee === 'string' ? parseFloat(orderData.deliveryFee) : orderData.deliveryFee)
      : deliveryFee;
    
    // Handle order items - API might return items differently
    let orderItems: Array<{ product?: any; quantity: number; price: number; productName?: string; productImage?: string }> = [];
    
    if (orderData?.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
      // If items have product property (from types)
      if (orderData.items[0]?.product) {
        orderItems = orderData.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity || 1,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }));
      } else {
        // If items are from API response (with productName, productImage)
        orderItems = orderData.items.map((item: any) => ({
          product: {
            name: item.productName || 'Product',
            image: item.productImage || '',
          },
          quantity: item.quantity || 1,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }));
      }
    } else {
      // Fallback to cart items
      orderItems = cartItems.map(item => ({
        product: item,
        quantity: item.quantity || 1,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
      }));
    }
    
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-primary" />
          </div>
            <h1 className="text-3xl font-heading font-bold mb-3">{t("checkout.orderConfirmed")}</h1>
            <p className="text-neutral-600 text-lg">{t("checkout.orderConfirmedMessage")}</p>
          </div>

          {/* Order Number */}
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mb-6 text-center">
            <p className="text-sm text-neutral-600 mb-2">{t("checkout.orderNumber")}</p>
            <p className="text-2xl font-bold text-primary">#{orderId}</p>
          </div>

          {/* Order Summary */}
          <div className="border border-neutral-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              {t("checkout.orderSummary")}
            </h2>
            
            <div className="space-y-3 mb-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center flex-1">
                    {item.product?.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded border border-neutral-200 mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name || "Product"}</p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">{t("checkout.subtotal")}</span>
                <span>{formatCurrency(orderSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">{t("checkout.deliveryFee")}</span>
                <span>{formatCurrency(orderDeliveryFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t("checkout.total")}</span>
                <span className="text-primary">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {orderData?.address && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-2">{t("checkout.deliveryAddress")}</p>
              <p className="text-sm text-neutral-600">{orderData.address.address}</p>
              {orderData.address.city && (
                <p className="text-sm text-neutral-600">{orderData.address.city}, {orderData.address.country}</p>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>{t("checkout.nextSteps")}</strong> {t("checkout.nextStepsMessage")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/orders" className="flex-1">
              <Button className="w-full" variant="default">
                {t("checkout.viewOrderDetails")}
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full" variant="outline">
              {t("checkout.backToHome")}
            </Button>
          </Link>
          </div>
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
      
      <div className="bg-neutral-50 py-8 pb-28 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <h1 className="text-2xl font-heading font-bold">{t("checkout.title")}</h1>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, onError)} className="p-6 space-y-6">
                    {/* Delivery Zone Banner */}
                    <DeliveryZoneBanner variant="info" className="mb-4" />
                    
                    {/* Address Information */}
                    <div className={paymentStep !== "address" ? "hidden" : ""}>
                      <h2 className="text-lg font-medium mb-4 flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        {t("checkout.deliveryAddress")}
                      </h2>
                      
                      {/* Address Selection */}
                      {user && (
                        <div className="mb-6">
                          <AddressManager 
                            mode="selection"
                            selectedAddressId={selectedAddressId ?? undefined}
                            onSelect={(address) => {
                              setSelectedAddressId(address.id);
                              fillFormWithAddress(address);
                            }}
                          />
                        </div>
                      )}
                      {!user && (
                        <div className="mb-6 text-sm text-neutral-600">
                          {t("checkout.guestNotice")}
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
                              <div className="flex items-center justify-between">
                                <FormLabel>{t("checkout.email")}</FormLabel>
                                {user?.email && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    From account
                                  </span>
                                )}
                              </div>
                              <FormControl>
                                <Input 
                                  placeholder={t("checkout.emailPlaceholder")} 
                                  {...field}
                                  className={user?.email ? "bg-gray-50" : ""}
                                />
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
                              <div className="flex items-center justify-between">
                                <FormLabel>{t("checkout.phone")}</FormLabel>
                                {user?.phone && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    From account
                                  </span>
                                )}
                              </div>
                              <FormControl>
                                <Input 
                                  placeholder={t("checkout.phonePlaceholder")} 
                                  inputMode="tel"
                                  autoComplete="tel"
                                  maxLength={19}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    const digits = raw.replace(/\D/g, "");
                                    let formatted = raw;
                                    if (digits.startsWith("998") || raw.startsWith("+998")) {
                                      const rest = digits.replace(/^998/, "");
                                      const p1 = rest.slice(0, 2);
                                      const p2 = rest.slice(2, 5);
                                      const p3 = rest.slice(5, 7);
                                      const p4 = rest.slice(7, 9);
                                      formatted = "+998" + (p1 ? ` ${p1}` : "") + (p2 ? ` ${p2}` : "") + (p3 ? ` ${p3}` : "") + (p4 ? ` ${p4}` : "");
                                    }
                                    field.onChange(formatted);
                                  }}
                                  value={field.value}
                                  className={user?.phone ? "bg-gray-50" : ""}
                                />
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
                                <LocationSelector
                                  value={field.value}
                                  onLocationSelect={(location) => {
                                    field.onChange(location.address);
                                    const coords = {
                                      lat: location.coordinates[0],
                                      lng: location.coordinates[1]
                                    };
                                    form.setValue("coordinates", coords);
                                    
                                    // Real-time validation - extract district from location
                                    const district = location.state || location.city; // District might be in state or city
                                    const validation = validateDeliveryAddress(
                                      coords, 
                                      location.address,
                                      undefined, // subtitle not available from MapPicker
                                      district
                                    );
                                    setDeliveryZoneStatus(validation);
                                    if (!validation.isValid) {
                                      form.setError("coordinates", {
                                        type: "manual",
                                        message: t("deliveryZone.outOfZoneMessage")
                                      });
                                    } else {
                                      form.clearErrors("coordinates");
                                    }
                                  }}
                                  placeholder={t("checkout.addressPlaceholder")}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                              {/* Delivery zone status is shown by LocationSelector component, no need to duplicate here */}
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
                              <SelectItem value="slot1">14:00 - 15:00</SelectItem>
                              <SelectItem value="slot2">15:00 - 16:00</SelectItem>
                              <SelectItem value="slot3">16:00 - 17:00</SelectItem>
                              <SelectItem value="slot4">17:00 - 18:00</SelectItem>
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
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.uzcard")}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">UZ</div>
                                      <span className="text-sm text-neutral-500">{t("checkout.paymentMethods.uzcardLabel")}</span>
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
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.humo")}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-green-600 rounded text-white text-xs font-bold flex items-center justify-center">H</div>
                                      <span className="text-sm text-neutral-500">{t("checkout.paymentMethods.humoLabel")}</span>
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
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.click")}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">C</div>
                                      <span className="text-sm text-neutral-500">{t("checkout.paymentMethods.mobileLabel")}</span>
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
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.payme")}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-orange-600 rounded text-white text-xs font-bold flex items-center justify-center">P</div>
                                      <span className="text-sm text-neutral-500">{t("checkout.paymentMethods.mobileLabel")}</span>
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
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.international")}</div>
                                    </div>
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 w-auto" />
                                      <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" className="h-6 w-auto" />
                                    </div>
                                  </label>
                                </div>
                                
                                {/* Cash - Pay on Delivery */}
                                <div className={`border rounded-lg p-4 cursor-pointer ${field.value === "cash" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                                  <RadioGroupItem value="cash" id="cash" className="sr-only" />
                                  <label htmlFor="cash" className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center">
                                      <div className="shrink-0">
                                        <div className={`w-5 h-5 rounded-full border ${field.value === "cash" ? "border-primary" : "border-neutral-300"} flex items-center justify-center`}>
                                          {field.value === "cash" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                        </div>
                                      </div>
                                      <div className="ml-3 font-medium">{t("checkout.paymentMethods.cash")}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-6 bg-emerald-600 rounded text-white text-xs font-bold flex items-center justify-center">💵</div>
                                      <span className="text-sm text-neutral-500">{t("checkout.paymentMethods.cashDescription")}</span>
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

                      {/* Cash on Delivery */}
                      {form.watch("paymentMethod") === "cash" && (
                        <div className="mt-6 space-y-4">
                          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <p className="text-sm text-emerald-800">
                              <strong>{t("checkout.paymentMethods.cashTitle")}</strong>
                            </p>
                            <p className="text-xs text-emerald-700 mt-2">
                              {t("checkout.paymentMethods.cashRiderMessage")}
                            </p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              💡 <strong>{t("checkout.paymentMethods.cashNote")}</strong>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Desktop Place Order Button - Hidden on Mobile */}
                      <div className="mt-8 hidden md:block">
                        <Button 
                          type="button" 
                          className="w-full"
                          disabled={isSubmitting}
                          onClick={handlePlaceOrderClick}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("checkout.processingOrder")}
                            </>
                          ) : (
                            t("checkout.placeOrder")
                          )}
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
                      
                      {paymentStep !== "payment" && paymentStep !== "confirmation" && (
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
                                  {item.quantity} x {formatCurrency(typeof item.price === 'string' ? parseFloat(item.price) : item.price)}
                                </div>
                              </div>
                              <div className="font-medium">
                                {formatCurrency((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
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

      {/* 🔥 MOBILE STICKY BUTTON - Only visible on mobile when on payment step */}
      {paymentStep === "payment" && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white border-t border-neutral-200 shadow-lg safe-area-bottom">
          <div className="px-4 py-3 pb-safe">
            <Button 
              type="button" 
              className="w-full min-h-[48px] h-12 text-base font-semibold shadow-sm active:scale-[0.98] transition-transform"
              disabled={isSubmitting}
              onClick={handlePlaceOrderClick}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("checkout.processingOrder")}</span>
                </div>
              ) : (
                <>
                  {t("checkout.placeOrder")} · {formatCurrency(total)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
