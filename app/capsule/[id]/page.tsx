"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Download,
  Share2,
  Pause,
  Play,
  Lock,
  Unlock,
  Calendar,
  Users,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Video,
  Music,
  Heart,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface CapsulePageProps {
  params: Promise<{ id: string }>;
}

export default function CapsuleViewPage({ params }: CapsulePageProps) {
  const { id } = use(params);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [copied, setCopied] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const capsule = useQuery(api.capsules.getCapsuleById, {
    id: id as Id<"capsules">,
  });

  const capsuleAccess = useQuery(api.capsules.getCapsule, {
    capsuleId: id as Id<"capsules">,
    userLat: userLocation?.lat,
    userLon: userLocation?.lon,
  });

  const capsuleFiles = useQuery(api.capsules.getCapsuleWithFiles, {
    capsuleId: id as Id<"capsules">,
  });
  const fileCapsuleUrl = capsuleFiles?.capsuleFileUrl;
  console.log("capsule files ", capsuleFiles);

  const unlockCapsule = useMutation(api.capsules.unlockCapsule);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  const handleUnlock = async () => {
    if (capsuleAccess && !capsuleAccess.locked && !isUnlocking) {
      setIsUnlocking(true);
      try {
        await unlockCapsule({ capsuleId: id as Id<"capsules"> });
        setShowUnlockAnimation(true);
        setTimeout(() => setShowUnlockAnimation(false), 3000);
      } catch (error) {
        console.error("Failed to unlock capsule:", error);
      } finally {
        setIsUnlocking(false);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="size-4" />;
    } else if (type.startsWith("video/")) {
      return <Video className="size-4" />;
    } else if (type.startsWith("audio/")) {
      return <Music className="size-4" />;
    } else {
      return <FileText className="size-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const getTimeRemaining = (unlockDate: number) => {
    const now = Date.now();
    const diff = unlockDate - now;

    if (diff <= 0) return "Ready to unlock";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days} days, ${hours} hours`;
  };

  const getProgress = (createdAt: number, unlockDate: number) => {
    const now = Date.now();
    const total = unlockDate - createdAt;
    const elapsed = now - createdAt;
    return Math.min((elapsed / total) * 100, 100);
  };

  // Loading state
  if (!capsule || capsuleAccess === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading capsule...</p>
        </div>
      </div>
    );
  }

  // Check if capsule is unlocked (from the actual database data)
  const isUnlocked = capsuleAccess && !capsuleAccess.locked;
  const canUnlock = isUnlocked && Date.now() >= (capsule.unlockDate || 0);

  if (showUnlockAnimation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="size-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
          >
            <Unlock className="size-12 text-primary-foreground" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Time Capsule Unlocked!</h1>
            <p className="text-muted-foreground">
              Your message from the past is ready to be revealed...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent"
            >
              <Download className="size-4" />
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
          {/* Capsule Header */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
                <div className="relative text-center space-y-4">
                  <div className="size-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    {isUnlocked ? (
                      <Unlock className="size-8 text-primary-foreground" />
                    ) : (
                      <Lock className="size-8 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-balance">
                      {capsule.title || "Untitled Capsule"}
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>Created {formatDate(capsule.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>
                          {capsule.unlockDate && (
                            <>Unlocks {formatDate(capsule.unlockDate)}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isUnlocked ? (
                    <Badge variant="default" className="bg-green-500">
                      <Unlock className="size-3 mr-1" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="size-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isUnlocked
                    ? "Ready to view"
                    : capsuleAccess?.locked
                      ? capsuleAccess.reason
                      : "Waiting for unlock conditions"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="size-4" />
                  <span className="font-medium">Personal</span>
                </div>
                <p className="text-sm text-muted-foreground">Private capsule</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <EyeOff className="size-4" />
                  <span className="font-medium">Private</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only visible to you
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Creator Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">You</h3>
                  <p className="text-sm text-muted-foreground">
                    Created this time capsule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          {isUnlocked ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="size-5" />
                    Message from the Past
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {capsule.content || "No message content available."}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Attachments
                </h2>
                <div className="mt-4 space-y-4">
                  {/* Capsule file */}
                  {fileCapsuleUrl && (
                    <img
                      src={fileCapsuleUrl}
                      alt="Capsule File"
                      className="w-60 h-60 object-cover rounded-lg shadow-md"
                    />
                  )}

                  {/* Other files */}
                  {capsuleFiles?.files?.map((file: any) => {
                    if (file.fileType.startsWith("audio")) {
                      const audioFileRef = useRef<HTMLAudioElement>(null);
                      const [isPlayingFile, setIsPlayingFile] = useState(false);

                      const toggleAudio = () => {
                        if (!audioFileRef.current) return;

                        if (isPlayingFile) {
                          audioFileRef.current.pause();
                        } else {
                          audioFileRef.current.play();
                        }
                        setIsPlayingFile(!isPlayingFile);
                      };

                      return (
                        <div key={file._id} className="flex items-center gap-2">
                          <button
                            onClick={toggleAudio}
                            className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            {isPlayingFile ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <audio ref={audioFileRef} src={file.url} />
                          <span className="text-sm">{file.fileName}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="size-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  This capsule is still locked
                </h3>
                <p className="text-muted-foreground mb-4">
                  {capsuleAccess?.locked
                    ? capsuleAccess.reason
                    : capsule.unlockDate
                      ? `Come back on ${formatDate(capsule.unlockDate)} to read your message from the past.`
                      : "Waiting for unlock conditions to be met."}
                </p>
                {capsule.unlockDate && (
                  <div className="max-w-md mx-auto mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Time remaining</span>
                      <span>{getTimeRemaining(capsule.unlockDate)}</span>
                    </div>
                    <Progress
                      value={getProgress(capsule.createdAt, capsule.unlockDate)}
                      className="h-2"
                    />
                  </div>
                )}
                {canUnlock && (
                  <Button
                    onClick={handleUnlock}
                    className="mt-4"
                    disabled={isUnlocking}
                  >
                    {isUnlocking ? (
                      <>
                        <div className="size-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Unlock className="size-4 mr-2" />
                        Unlock Capsule
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats and Actions */}
          {isUnlocked && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="size-4" />
                      <span>1 view</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="size-4" />
                      <span>0 likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="size-4" />
                      <span>0 comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-transparent"
                    >
                      <Heart className="size-4 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-transparent"
                    >
                      <MessageCircle className="size-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
