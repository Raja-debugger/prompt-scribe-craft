
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
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ className }) => {
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

  return (
    <Card className={`shadow-md dark:shadow-none dark:border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Profile</span>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <PenLine className="h-4 w-4" />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="space-y-3 w-full">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={tempProfile.name} 
                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={tempProfile.email} 
                  onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium text-base">{profile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
