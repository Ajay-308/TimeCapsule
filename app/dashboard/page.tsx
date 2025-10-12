/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Trash2,
  Edit,
  Share2,
  TrendingUp,
  Archive,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/dashboardSkeleton";
import Navbar from "@/components/navbar";
import { trpc } from "@/lib/trpc";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch data from tRPC
  const { data: capsules } = trpc.capsule.listUserCapsules.useQuery();
  const { data: stats } = trpc.capsule.userStats.useQuery();
  const utils = trpc.useUtils();
  const archiveMutation = trpc.capsule.archiveCapsule.useMutation({
    onSuccess: () => {
      utils.capsule.listUserCapsules.invalidate(); // refresh list
    },
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilUnlock = (unlockTimestamp: number) => {
    const now = new Date();
    const unlock = new Date(unlockTimestamp);
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = (createdAt: number, unlockDate: number) => {
    const created = new Date(createdAt);
    const unlock = new Date(unlockDate);
    const now = new Date();

    const totalTime = unlock.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();

    return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
  };

  const getCollaboratorCount = (capsuleId: string) => {
    // This would need a separate query for collaborative capsules
    // For now, returning 0 but you can add this query later
    console.log("Get collaborator count for capsule:", capsuleId);
    return 0;
  };

  const filteredCapsules =
    capsules?.filter((capsule: any) => {
      if (capsule.isArchived) return false;
      const matchesSearch = capsule.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const collaboratorCount = getCollaboratorCount(capsule.id);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "unlocked" && capsule.isUnlocked) ||
        (activeTab === "locked" && !capsule.isUnlocked) ||
        (activeTab === "collaborative" && collaboratorCount > 0) ||
        (activeTab === "public" && capsule.isPublic);

      return matchesSearch && matchesTab;
    }) || [];

  if (capsules === undefined || stats === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 ml-18">
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
                  {stats.totalCapsules}
                </div>
                <p className="text-sm text-muted-foreground">Total Capsules</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {stats.unlockedCapsules}
                </div>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {stats.totalViews}
                </div>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-500">
                  {stats.totalLikes}
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
                  {filteredCapsules.map((capsule: any, index: any) => {
                    const collaboratorCount = getCollaboratorCount(capsule.id);
                    const daysUntilUnlock = getDaysUntilUnlock(
                      capsule.unlockDate
                    );
                    const progress = getProgressPercentage(
                      capsule.createdAt,
                      capsule.unlockDate
                    );

                    return (
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
                                      {daysUntilUnlock} days
                                    </Badge>
                                  )}
                                  {collaboratorCount > 0 && (
                                    <Badge variant="outline">
                                      <Users className="size-3 mr-1" />
                                      {collaboratorCount + 1}
                                    </Badge>
                                  )}
                                  {capsule.isPublic && (
                                    <Badge variant="outline">
                                      <Eye className="size-3 mr-1" />
                                      Public
                                    </Badge>
                                  )}
                                  {capsule.location && (
                                    <Badge variant="outline">
                                      <MapPin className="size-3 mr-1" />
                                      Location
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
                                  <DropdownMenuItem
                                    onClick={() =>
                                      archiveMutation.mutate({
                                        capsuleId: capsule.id,
                                      })
                                    }
                                  >
                                    <Archive className="size-4 mr-2" />
                                    {archiveMutation.isPending
                                      ? "Archiving..."
                                      : "Archive"}
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
                              {capsule.content ||
                                "No content preview available"}
                            </p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-1" />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  {formatDate(capsule.unlockDate)}
                                </span>
                                {capsule.fileId && <span>1 file</span>}
                                {capsule.location?.placeName && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {capsule.location.placeName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="size-3" />
                                  {capsule.accessCount || 0}
                                </span>
                              </div>
                            </div>

                            {/* One-time access indicator */}
                            {capsule.isOneTimeAccess && !capsule.isAccessed && (
                              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                ⚠️ One-time access only
                              </div>
                            )}

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
                    );
                  })}
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
                <Link href="/archive">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col gap-2 bg-transparent"
                  >
                    <Archive className="size-6" />
                    <span className="text-sm">Archive</span>
                  </Button>
                </Link>
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
