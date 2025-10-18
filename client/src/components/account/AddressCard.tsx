import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Home, 
  Briefcase, 
  MapPin,
  CheckCircle,
  Circle,
  CheckCircle2
} from "lucide-react";
import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  mode: 'management' | 'selection';
  isSelected?: boolean;
  onEdit?: (address: Address) => void;
  onDelete?: (id: number) => void;
  onSetDefault?: (id: number) => void;
  onSelect?: (address: Address) => void;
}

const addressIcons = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

const addressColors = {
  home: "text-blue-600",
  work: "text-green-600", 
  other: "text-purple-600",
};

export default function AddressCard({
  address,
  mode,
  isSelected = false,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
}: AddressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const IconComponent = addressIcons[address.addressType];
  const iconColor = addressColors[address.addressType];

  const handleCardClick = () => {
    if (mode === 'selection' && onSelect) {
      onSelect(address);
    }
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetDefault) {
      onSetDefault(address.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(address);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(address.id);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        mode === 'selection' 
          ? isSelected 
            ? 'ring-2 ring-primary bg-primary/5' 
            : 'hover:ring-1 hover:ring-gray-300'
          : 'hover:shadow-md'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {mode === 'selection' && (
              <div className="mt-1">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{address.title}</h3>
                  {address.isDefault && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mt-1">
                  <p className="font-medium">{address.fullName}</p>
                  {address.phone && (
                    <p className="text-primary">{address.phone}</p>
                  )}
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mode === 'management' && (
              <>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetDefault}
                    className="text-xs"
                  >
                    Set as Default
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
