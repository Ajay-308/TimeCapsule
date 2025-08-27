"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Upload,
  MapPin,
  Users,
  Lock,
  Eye,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function CreateCapsulePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [capsuleType, setCapsuleType] = useState("personal");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [geoLock, setGeoLock] = useState(false);
  const [location, setLocation] = useState("");
  const [oneTimeAccess, setOneTimeAccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addCollaborator = () => {
    if (newCollaborator && !collaborators.includes(newCollaborator)) {
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your time capsule.",
        variant: "destructive",
      });
      return false;
    }

    if (!unlockDate) {
      toast({
        title: "Unlock Date Required",
        description: "Please select when you want your capsule to unlock.",
        variant: "destructive",
      });
      return false;
    }

    const unlockDateTime = new Date(`${unlockDate}T${unlockTime || "00:00"}`);
    if (unlockDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Unlock date must be in the future.",
        variant: "destructive",
      });
      return false;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please write a message for your time capsule.",
        variant: "destructive",
      });
      return false;
    }

    if (capsuleType === "collaborative" && collaborators.length === 0) {
      toast({
        title: "Collaborators Required",
        description:
          "Please add at least one collaborator for a collaborative capsule.",
        variant: "destructive",
      });
      return false;
    }

    if (geoLock && !location.trim()) {
      toast({
        title: "Location Required",
        description: "Please specify a location for geo-locked capsules.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const createCapsule = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("unlockDate", unlockDate);
      formData.append("unlockTime", unlockTime || "00:00");
      formData.append("capsuleType", capsuleType);
      formData.append("isPublic", isPublic.toString());
      formData.append("geoLock", geoLock.toString());
      formData.append("location", location);
      formData.append("oneTimeAccess", oneTimeAccess.toString());
      formData.append("collaborators", JSON.stringify(collaborators));

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const response = await fetch("/api/capsules", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create capsule");
      }

      const capsule = await response.json();

      toast({
        title: "Time Capsule Created!",
        description: `Your capsule "${title}" will unlock on ${new Date(unlockDate).toLocaleDateString()}.`,
      });

      // Redirect to the created capsule or dashboard
      router.push(`/capsule/${capsule.id}`);
    } catch (error) {
      console.error("Error creating capsule:", error);
      toast({
        title: "Creation Failed",
        description:
          "There was an error creating your time capsule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title to save as draft.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const draftData = {
        title,
        message,
        unlockDate,
        unlockTime,
        capsuleType,
        isPublic,
        collaborators,
        geoLock,
        location,
        oneTimeAccess,
        isDraft: true,
      };

      const response = await fetch("/api/capsules/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      toast({
        title: "Draft Saved",
        description: "Your time capsule has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 font-bold">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                <Clock className="size-4" />
              </div>
              <span>TimeCapsule</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="rounded-full bg-transparent"
              onClick={saveDraft}
              disabled={isSaving || isCreating}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button
              className="rounded-full"
              onClick={createCapsule}
              disabled={isCreating || isSaving}
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Capsule"
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Create Your Time Capsule
            </h1>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Craft a message for the future. Choose your unlock date, add
              memories, and let time do the magic.
            </p>
          </div>

          {/* Capsule Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Capsule Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={capsuleType} onValueChange={setCapsuleType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
                  <TabsTrigger value="public">Public</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    A private time capsule just for you. Perfect for personal
                    reflections, goals, and memories.
                  </p>
                </TabsContent>
                <TabsContent value="collaborative" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Invite friends and family to contribute. Everyone can add
                    their own messages before the capsule is sealed.
                  </p>
                </TabsContent>
                <TabsContent value="public" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Share your message with the world. Your capsule will appear
                    on the public wall when it unlocks.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Capsule Title</Label>
                <Input
                  id="title"
                  placeholder="Give your time capsule a memorable name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unlock-date">Unlock Date</Label>
                  <Input
                    id="unlock-date"
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unlock-time">Unlock Time</Label>
                  <Input
                    id="unlock-time"
                    type="time"
                    value={unlockTime}
                    onChange={(e) => setUnlockTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message to the future..."
                  className="min-h-[200px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length}/5000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators (if collaborative) */}
          {capsuleType === "collaborative" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address..."
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCollaborator()}
                  />
                  <Button onClick={addCollaborator} size="icon">
                    <Plus className="size-4" />
                  </Button>
                </div>
                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map((email, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {email}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-4 p-0 hover:bg-transparent"
                          onClick={() => removeCollaborator(email)}
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="size-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="size-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Geo-lock */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <Label>Location-Based Unlock</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Require being at a specific location to unlock this capsule
                  </p>
                </div>
                <Switch checked={geoLock} onCheckedChange={setGeoLock} />
              </div>
              {geoLock && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter address or coordinates..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}

              {/* One-time access */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4" />
                    <Label>One-Time Access</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capsule can only be opened once, then it's permanently
                    sealed
                  </p>
                </div>
                <Switch
                  checked={oneTimeAccess}
                  onCheckedChange={setOneTimeAccess}
                />
              </div>

              {/* Public visibility */}
              {capsuleType !== "public" && (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <Label>Make Public After Unlock</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see this capsule on the public wall after
                      it unlocks
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full bg-transparent"
              onClick={saveDraft}
              disabled={isSaving || isCreating}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving Draft...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              size="lg"
              className="rounded-full"
              onClick={createCapsule}
              disabled={isCreating || isSaving}
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating Time Capsule...
                </>
              ) : (
                "Create Time Capsule"
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
