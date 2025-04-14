
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, PenLine, Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileSectionProps {
  className?: string;
  size?: "default" | "compact";
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ className, size = "default" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: ""
  });
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const isCompact = size === "compact";

  return (
    <Card className={`shadow-md dark:shadow-none dark:border-gray-800 transition-all duration-300 hover:shadow-lg ${isCompact ? "max-w-[180px]" : ""} ${className}`}>
      <CardHeader className={`pb-1 ${isCompact ? "px-2 py-1.5" : ""}`}>
        <CardTitle className={`${isCompact ? "text-xs" : "text-lg"} flex items-center justify-between`}>
          <span>Profile</span>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleEdit} className={isCompact ? "h-5 w-5 p-0" : ""}>
              <PenLine className={`${isCompact ? "h-3 w-3" : "h-4 w-4"}`} />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isCompact ? "px-2 py-1.5 space-y-1.5" : ""}`}>
        <div className="flex flex-col items-center space-y-2">
          <Avatar className={isCompact ? "h-8 w-8" : "h-16 w-16"}>
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <User className={isCompact ? "h-4 w-4" : "h-8 w-8"} />
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="space-y-2 w-full">
              <div className="space-y-1">
                <Label htmlFor="name" className={isCompact ? "text-xs" : ""}>Name</Label>
                <Input 
                  id="name" 
                  value={tempProfile.name} 
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className={isCompact ? "h-6 text-xs py-0" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className={isCompact ? "text-xs" : ""}>Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={tempProfile.email} 
                  onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                  className={isCompact ? "h-6 text-xs py-0" : ""}
                />
              </div>
              <div className="flex space-x-1 pt-1">
                <Button onClick={handleSave} size={isCompact ? "sm" : "sm"} className="flex-1 h-6 text-xs">
                  <Save className={`${isCompact ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size={isCompact ? "sm" : "sm"} className="flex-1 h-6 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-medium ${isCompact ? "text-xs" : "text-base"}`}>{profile.name}</p>
              <p className={`${isCompact ? "text-[10px]" : "text-sm"} text-gray-500 dark:text-gray-400`}>{profile.email}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
