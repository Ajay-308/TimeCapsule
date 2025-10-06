"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
import { trpc } from "@/lib/trpc";
import { error } from "console";

export default function CreateCapsulePage() {
  const router = useRouter();
  const createCapsuleMutation = trpc.capsule.create.useMutation();
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
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [radius, setRadius] = useState(100);
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

  // Get current location for geo-locking
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation(
            `${position.coords.latitude.toFixed(
              6
            )}, ${position.coords.longitude.toFixed(6)}`
          );
          toast.success("Location Set", {
            description: "Current location has been set for geo-locking.",
          });
        },
        (error) => {
          toast.error("Location Error", {
            description:
              "Failed to get current location. Please enter manually.",
          });
        }
      );
    } else {
      toast("Geolocation is not supported by this browser.");
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Title Required", {
        description: "Please enter a title for your time capsule.",
      });
      return false;
    }

    if (!unlockDate) {
      toast.error("Unlock Date Required", {
        description: "Please select when you want your capsule to unlock.",
      });
      return false;
    }

    const unlockDateTime = new Date(`${unlockDate}T${unlockTime || "00:00"}`);
    if (unlockDateTime <= new Date()) {
      toast.error("Invalid Date", {
        description: "Unlock date must be in the future.",
      });
      return false;
    }

    if (!message.trim()) {
      toast.error("Message Required", {
        description: "Please write a message for your time capsule.",
      });
      return false;
    }

    if (capsuleType === "collaborative" && collaborators.length === 0) {
      toast.error("Collaborators Required", {
        description:
          "Please add at least one collaborator for a collaborative capsule.",
      });
      return false;
    }

    if (geoLock && (!latitude || !longitude)) {
      toast.error("Location Required", {
        description: "Please set a location for geo-locked capsules.",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("uploading file ", file.name);
      console.log("formData", formData.get("file"));

      const res = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Upload failed with status:");
      }

      if (!res.ok) throw new Error("Upload failed");

      const { storageId } = await res.json();
      return storageId;
    } catch (error) {
      console.error("File upload error:", error);

      toast.error("Upload Failed", {
        description: `Failed to upload ${file.name}`,
      });
      return null;
    }
  };

  const createCapsule = async () => {
    console.log("call create function");
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      // Generate encryption key
      const encryptionKey = crypto
        .getRandomValues(new Uint8Array(32))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

      // Upload files if any
      let fileId: string | undefined;
      if (attachments.length > 0) {
        // For simplicity, upload only the first file
        // You can modify this to handle multiple files
        const uploadedFileId = await uploadFile(attachments[0]);
        if (uploadedFileId) {
          fileId = uploadedFileId;
        }
      }

      // Prepare unlock timestamp
      const unlockTimestamp = new Date(
        `${unlockDate}T${unlockTime || "00:00"}`
      ).getTime();

      // Prepare location data
      const locationData =
        geoLock && latitude && longitude
          ? {
              latitude,
              longitude,
              radius,
              placeName: location,
            }
          : undefined;

      // Create capsule
      const result = await createCapsuleMutation.mutateAsync({
        title: title.trim(),
        content: message.trim(),
        fileId: fileId ? (fileId as string) : undefined,
        encryptionKey,
        unlockDate: unlockTimestamp,
        location: locationData,
        isOneTimeAccess: oneTimeAccess,
        isPublic: capsuleType === "public" ? true : isPublic,
      });

      toast.success("Time Capsule Created!", {
        description: `Your capsule "${title}" will unlock on ${new Date(
          unlockTimestamp
        ).toLocaleDateString()}.`,
      });

      // Redirect to the created capsule or dashboard
      router.push(`/capsule/${result.capsuleId}`);
    } catch (error) {
      console.error("Error creating capsule:", error);
      toast.error("Creation Failed", {
        description:
          (error as Error)?.message ||
          "There was an error creating your time capsule. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      toast.error("Title Required", {
        description: "Please enter a title to save as draft.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // For now, we'll save draft data to localStorage
      // You can create a separate drafts table in your schema later
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
        latitude,
        longitude,
        radius,
        oneTimeAccess,
        isDraft: true,
        savedAt: Date.now(),
      };

      localStorage.setItem(
        `capsule_draft_${Date.now()}`,
        JSON.stringify(draftData)
      );
      toast.success("Draft Saved", {
        description: "Your time capsule has been saved as a draft locally.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Save Failed", {
        description: "There was an error saving your draft. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background ml-18">
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
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      Note: Collaborative features are coming soon. For now, you
                      can create the capsule and share it manually.
                    </p>
                  </div>
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
                  maxLength={100}
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
                    min={new Date().toISOString().split("T")[0]}
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => setMessage(e.target.value)}
                  maxLength={5000}
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
                    type="email"
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
                <p className="text-xs text-muted-foreground mb-4">
                  Currently supports one file at a time (Max 10MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
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
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Description</Label>
                    <Input
                      id="location"
                      placeholder="e.g., My childhood home, Central Park..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="40.7128"
                        value={latitude || ""}
                        onChange={(e) =>
                          setLatitude(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        value={longitude || ""}
                        onChange={(e) =>
                          setLongitude(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Unlock Radius (meters)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="1"
                      max="10000"
                      value={radius}
                      onChange={(e) =>
                        setRadius(parseInt(e.target.value) || 100)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Distance from the location where the capsule can be
                      unlocked
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="size-4 mr-2" />
                    Use Current Location
                  </Button>
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
                    Capsule can only be opened once, then it&#39;s permanently
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
