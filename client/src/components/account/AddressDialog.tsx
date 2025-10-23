import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Address } from "@/types";
import { userApi } from "@/hooks/use-api";
import LocationSelector from "@/components/ui/LocationSelector";

const addressSchema = z.object({
  title: z.string().min(1, "Title is required"),
  addressType: z.enum(["home", "work", "other"]),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  address: z.string().min(1, "Address is required"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  onSuccess: () => void;
}

export default function AddressDialog({
  isOpen,
  onClose,
  address,
  onSuccess,
}: AddressDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: "home",
      country: "UZ",
      isDefault: false,
    },
  });

  const addressType = watch("addressType");

  useEffect(() => {
    if (address) {
      // Edit mode - populate form with existing address data
      reset({
        title: address.title,
        addressType: address.addressType,
        fullName: address.fullName,
        phone: address.phone || "", // NEW
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      // Create mode - reset form
      reset({
        title: "",
        addressType: "home",
        fullName: "",
        phone: "", // NEW
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "UZ",
        isDefault: false,
      });
    }
  }, [address, reset]);

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      if (address) {
        // Update existing address
        await userApi.updateAddress(address.id, data);
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      } else {
        // Create new address
        await userApi.createAddress(data);
        toast({
          title: "Success", 
          description: "Address created successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Address save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {address 
              ? "Update your address information below."
              : "Add a new address to your account."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Address Label</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Home, Work"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label>Address Type</Label>
              <RadioGroup
                value={addressType}
                onValueChange={(value) => setValue("addressType", value as "home" | "work" | "other")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home">🏠 Home</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work" id="work" />
                  <Label htmlFor="work">💼 Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">📍 Other</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Your full name"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+998 90 123 4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <LocationSelector
              value={watch("address")}
              onLocationSelect={(location) => {
                setValue("address", location.address);
                setValue("coordinates", {
                  lat: location.coordinates[0],
                  lng: location.coordinates[1]
                });
              }}
              placeholder="Search for your address..."
              className="w-full"
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              {...register("postalCode")}
              placeholder="123456"
              className={errors.postalCode ? "border-red-500" : ""}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500 mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
              placeholder="Country"
              className={errors.country ? "border-red-500" : ""}
            />
            {errors.country && (
              <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={watch("isDefault")}
              onCheckedChange={(checked) => setValue("isDefault", checked as boolean)}
            />
            <Label htmlFor="isDefault">Set as default address</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : address ? "Update Address" : "Add Address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
