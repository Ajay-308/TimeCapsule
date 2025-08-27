"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Clock,
  Lock,
  Unlock,
  Calendar,
  Users,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Bell,
  User,
  Trash2,
  Edit,
  Share2,
  TrendingUp,
  Archive,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Mock data - in real app this would come from API
const mockCapsules = [
  {
    id: "1",
    title: "My College Graduation Dreams",
    message:
      "Dear Future Me, I'm writing this on the eve of starting college...",
    createdAt: "2020-08-15T10:30:00Z",
    unlockDate: "2024-05-15T15:00:00Z",
    isUnlocked: true,
    isPublic: false,
    collaborators: [],
    attachments: 3,
    views: 12,
    likes: 5,
  },
  {
    id: "2",
    title: "New Year Resolutions 2024",
    message:
      "This year I want to focus on health, relationships, and career growth...",
    createdAt: "2024-01-01T00:00:00Z",
    unlockDate: "2025-01-01T00:00:00Z",
    isUnlocked: false,
    isPublic: false,
    collaborators: [],
    attachments: 1,
    views: 0,
    likes: 0,
  },
  {
    id: "3",
    title: "Family Vacation Memories",
    message:
      "What an amazing trip to Japan! I want to remember every detail...",
    createdAt: "2023-07-20T14:30:00Z",
    unlockDate: "2028-07-20T14:30:00Z",
    isUnlocked: false,
    isPublic: true,
    collaborators: ["mom@example.com", "dad@example.com"],
    attachments: 15,
    views: 0,
    likes: 0,
  },
  {
    id: "4",
    title: "Wedding Day Wishes",
    message:
      "To my future married self, I hope you're still as happy as I am today...",
    createdAt: "2023-09-15T16:00:00Z",
    unlockDate: "2024-09-15T16:00:00Z",
    isUnlocked: false,
    isPublic: false,
    collaborators: ["partner@example.com"],
    attachments: 8,
    views: 0,
    likes: 0,
  },
];

const mockStats = {
  totalCapsules: 4,
  unlockedCapsules: 1,
  totalViews: 12,
  totalLikes: 5,
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilUnlock = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = (createdAt: string, unlockDate: string) => {
    const created = new Date(createdAt);
    const unlock = new Date(unlockDate);
    const now = new Date();

    const totalTime = unlock.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();

    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  };

  const filteredCapsules = mockCapsules.filter((capsule) => {
    const matchesSearch = capsule.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unlocked" && capsule.isUnlocked) ||
      (activeTab === "locked" && !capsule.isUnlocked) ||
      (activeTab === "collaborative" && capsule.collaborators.length > 0) ||
      (activeTab === "public" && capsule.isPublic);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              <Clock className="size-4" />
            </div>
            <span>TimeCapsule</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="size-4" />
            </Button>
            <Avatar className="size-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="User"
              />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Your Time Capsules
              </h1>
              <p className="text-muted-foreground">
                Manage and explore your messages across time
              </p>
            </div>
            <Link href="/capsule/create">
              <Button className="rounded-full">
                <Plus className="size-4 mr-2" />
                Create Capsule
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {mockStats.totalCapsules}
                </div>
                <p className="text-sm text-muted-foreground">Total Capsules</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {mockStats.unlockedCapsules}
                </div>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {mockStats.totalViews}
                </div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-500">
                  {mockStats.totalLikes}
                </div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search your time capsules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="rounded-full bg-transparent">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
              <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredCapsules.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="size-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No capsules found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Create your first time capsule to get started"}
                    </p>
                    {!searchQuery && (
                      <Link href="/capsule/create">
                        <Button className="rounded-full">
                          <Plus className="size-4 mr-2" />
                          Create Your First Capsule
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCapsules.map((capsule, index) => (
                    <motion.div
                      key={capsule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">
                                {capsule.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {capsule.isUnlocked ? (
                                  <Badge
                                    variant="default"
                                    className="bg-green-500"
                                  >
                                    <Unlock className="size-3 mr-1" />
                                    Unlocked
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <Lock className="size-3 mr-1" />
                                    {getDaysUntilUnlock(
                                      capsule.unlockDate
                                    )}{" "}
                                    days
                                  </Badge>
                                )}
                                {capsule.collaborators.length > 0 && (
                                  <Badge variant="outline">
                                    <Users className="size-3 mr-1" />
                                    {capsule.collaborators.length + 1}
                                  </Badge>
                                )}
                                {capsule.isPublic && (
                                  <Badge variant="outline">
                                    <Eye className="size-3 mr-1" />
                                    Public
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="size-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Archive className="size-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {capsule.message}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>
                                {Math.round(
                                  getProgressPercentage(
                                    capsule.createdAt,
                                    capsule.unlockDate
                                  )
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={getProgressPercentage(
                                capsule.createdAt,
                                capsule.unlockDate
                              )}
                              className="h-1"
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(capsule.unlockDate)}
                              </span>
                              {capsule.attachments > 0 && (
                                <span>{capsule.attachments} files</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Eye className="size-3" />
                                {capsule.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="size-3" />
                                {capsule.likes}
                              </span>
                            </div>
                          </div>

                          <Link href={`/capsule/${capsule.id}`}>
                            <Button
                              className="w-full rounded-full"
                              variant={
                                capsule.isUnlocked ? "default" : "outline"
                              }
                            >
                              {capsule.isUnlocked
                                ? "View Capsule"
                                : "View Details"}
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/capsule/create">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col gap-2 bg-transparent"
                  >
                    <Plus className="size-6" />
                    <span className="text-sm">Create Capsule</span>
                  </Button>
                </Link>
                <Link href="/public-wall">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col gap-2 bg-transparent"
                  >
                    <Eye className="size-6" />
                    <span className="text-sm">Public Wall</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 bg-transparent"
                >
                  <Archive className="size-6" />
                  <span className="text-sm">Archive</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 bg-transparent"
                >
                  <Settings className="size-6" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
