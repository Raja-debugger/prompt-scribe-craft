
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
    <Card className={`shadow-md dark:shadow-none dark:border-gray-800 ${isCompact ? "max-w-[220px]" : ""} ${className}`}>
      <CardHeader className={`pb-2 ${isCompact ? "px-3 py-2" : ""}`}>
        <CardTitle className={`${isCompact ? "text-sm" : "text-lg"} flex items-center justify-between`}>
          <span>Profile</span>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleEdit} className={isCompact ? "h-6 w-6" : ""}>
              <PenLine className={`${isCompact ? "h-3 w-3" : "h-4 w-4"}`} />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isCompact ? "px-3 py-2 space-y-2" : ""}`}>
        <div className="flex flex-col items-center space-y-3">
          <Avatar className={isCompact ? "h-12 w-12" : "h-16 w-16"}>
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <User className={isCompact ? "h-6 w-6" : "h-8 w-8"} />
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="space-y-3 w-full">
              <div className="space-y-1">
                <Label htmlFor="name" className={isCompact ? "text-xs" : ""}>Name</Label>
                <Input 
                  id="name" 
                  value={tempProfile.name} 
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                  className={isCompact ? "h-7 text-sm" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className={isCompact ? "text-xs" : ""}>Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={tempProfile.email} 
                  onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                  className={isCompact ? "h-7 text-sm" : ""}
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button onClick={handleSave} size={isCompact ? "sm" : "sm"} className="flex-1">
                  <Save className={`${isCompact ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size={isCompact ? "sm" : "sm"} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-medium ${isCompact ? "text-sm" : "text-base"}`}>{profile.name}</p>
              <p className={`${isCompact ? "text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}>{profile.email}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
