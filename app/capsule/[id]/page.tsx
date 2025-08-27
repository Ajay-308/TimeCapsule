"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Download,
  Share2,
  Lock,
  Unlock,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Play,
  Pause,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mock data - in real app this would come from API
const mockCapsule = {
  id: "1",
  title: "My College Graduation Dreams",
  message: `Dear Future Me,

I'm writing this on the eve of starting college, filled with so many dreams and hopes. I wonder if you remember how nervous and excited I was? I hope by the time you read this, you've achieved at least some of the goals I'm setting today.

My biggest dreams right now:
- Graduate with honors in Computer Science
- Land a job at a tech company I admire
- Travel to at least 5 new countries
- Learn to play the guitar (I just bought one!)
- Stay close with my high school friends

I'm scared about leaving home, but I'm also so excited about the independence and all the new people I'll meet. I hope you're proud of how far we've come.

Remember to always stay curious and kind.

Love,
Past You

P.S. - I hope you still have that weird obsession with late-night pizza!`,
  createdAt: "2020-08-15T10:30:00Z",
  unlockDate: "2024-05-15T15:00:00Z",
  isUnlocked: true,
  isPublic: false,
  oneTimeAccess: false,
  hasBeenViewed: false,
  geoLocked: false,
  location: null,
  creator: {
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  collaborators: [],
  attachments: [
    {
      id: "1",
      name: "college-acceptance-letter.pdf",
      type: "document",
      size: "2.4 MB",
      url: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "2",
      name: "family-photo.jpg",
      type: "image",
      size: "1.8 MB",
      url: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "3",
      name: "graduation-song.mp3",
      type: "audio",
      size: "4.2 MB",
      url: "#",
    },
  ],
  stats: {
    views: 1,
    likes: 0,
    comments: 0,
  },
};

export default function CapsuleViewPage({
  params,
}: {
  params: { id: string };
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [copied, setCopied] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const capsule = mockCapsule; // In real app, fetch by params.id

  useEffect(() => {
    if (capsule.isUnlocked && !capsule.hasBeenViewed) {
      setShowUnlockAnimation(true);
      setTimeout(() => setShowUnlockAnimation(false), 3000);
    }
  }, [capsule.isUnlocked, capsule.hasBeenViewed]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
    switch (type) {
      case "image":
        return <ImageIcon className="size-4" />;
      case "video":
        return <Video className="size-4" />;
      case "audio":
        return <Music className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

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
                    {capsule.isUnlocked ? (
                      <Unlock className="size-8 text-primary-foreground" />
                    ) : (
                      <Lock className="size-8 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {capsule.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>Created {formatDate(capsule.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>Unlocks {formatDate(capsule.unlockDate)}</span>
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
                  {capsule.isUnlocked ? (
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
                  {capsule.isUnlocked
                    ? "Ready to view"
                    : "Waiting for unlock date"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="size-4" />
                  <span className="font-medium">
                    {capsule.collaborators.length === 0
                      ? "Personal"
                      : `${capsule.collaborators.length + 1} People`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {capsule.collaborators.length === 0
                    ? "Private capsule"
                    : "Collaborative capsule"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {capsule.isPublic ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  <span className="font-medium">
                    {capsule.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {capsule.isPublic
                    ? "Visible to everyone"
                    : "Only visible to you"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Creator Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarImage
                    src={capsule.creator.avatar || "/placeholder.svg"}
                    alt={capsule.creator.name}
                  />
                  <AvatarFallback>
                    {capsule.creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{capsule.creator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created this time capsule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          {capsule.isUnlocked ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="size-5" />
                  Message from the Past
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {capsule.message}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="size-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  This capsule is still locked
                </h3>
                <p className="text-muted-foreground mb-4">
                  Come back on {formatDate(capsule.unlockDate)} to read your
                  message from the past.
                </p>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Time remaining</span>
                    <span>42 days, 15 hours</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {capsule.isUnlocked && capsule.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="size-5" />
                  Attachments ({capsule.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {capsule.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {attachment.size}
                      </p>
                    </div>
                    {attachment.type === "image" && (
                      <div className="size-16 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={attachment.url || "/placeholder.svg"}
                          alt={attachment.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {attachment.type === "audio" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 bg-transparent"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="size-4" />
                          ) : (
                            <Play className="size-4" />
                          )}
                        </Button>
                        <div className="w-24">
                          <Progress
                            value={(currentTime / duration) * 100}
                            className="h-1"
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 bg-transparent"
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stats and Actions */}
          {capsule.isUnlocked && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="size-4" />
                      <span>{capsule.stats.views} views</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="size-4" />
                      <span>{capsule.stats.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="size-4" />
                      <span>{capsule.stats.comments} comments</span>
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
