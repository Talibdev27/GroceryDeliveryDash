import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/hooks/use-api";
import { Address } from "@/types";
import AddressCard from "./AddressCard";
import AddressDialog from "./AddressDialog";

interface AddressManagerProps {
  mode: 'management' | 'selection';
  onSelect?: (address: Address) => void;
  selectedAddressId?: number;
}

const INITIAL_DISPLAY_COUNT = 2;

export default function AddressManager({ 
  mode, 
  onSelect, 
  selectedAddressId 
}: AddressManagerProps) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAddresses();
      setAddresses(data.addresses || []);
    } catch (err: any) {
      setError(err.message || "Failed to load addresses");
      console.error("Fetch addresses error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (addresses.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one address",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await userApi.deleteAddress(addressId);
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        fetchAddresses();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to delete address",
          variant: "destructive",
        });
      }
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      if (!address) return;

      await userApi.updateAddress(addressId, { isDefault: true });
      toast({
        title: "Success",
        description: "Default address updated",
      });
      fetchAddresses();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to set default address",
        variant: "destructive",
      });
    }
  };

  const handleSelectAddress = (address: Address) => {
    if (onSelect) {
      onSelect(address);
    }
  };

  const handleDialogSuccess = () => {
    fetchAddresses();
  };

  const displayedAddresses = showAll ? addresses : addresses.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreAddresses = addresses.length > INITIAL_DISPLAY_COUNT;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAddresses}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {mode === 'management' ? 'Saved Addresses' : 'Select Address'}
        </h3>
        {mode === 'management' && (
          <Button onClick={handleCreateAddress} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Address</span>
          </Button>
        )}
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No addresses saved yet</p>
          {mode === 'management' && (
            <Button onClick={handleCreateAddress}>
              Add Your First Address
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                mode={mode}
                isSelected={mode === 'selection' && selectedAddressId === address.id}
                onEdit={mode === 'management' ? handleEditAddress : undefined}
                onDelete={mode === 'management' ? handleDeleteAddress : undefined}
                onSetDefault={mode === 'management' ? handleSetDefault : undefined}
                onSelect={mode === 'selection' ? handleSelectAddress : undefined}
              />
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasMoreAddresses && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center space-x-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show More ({addresses.length - INITIAL_DISPLAY_COUNT} more)</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add New Address Prompt */}
      {mode === 'management' && addresses.length > 0 && (
        <div className="text-center pt-4 border-t">
          <p className="text-gray-600 mb-2">Or fill in a new address below:</p>
          <Button variant="outline" onClick={handleCreateAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>
      )}

      {/* Address Dialog */}
      <AddressDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        address={editingAddress}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
