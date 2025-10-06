"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Search,
  TrendingUp,
  Calendar,
  Globe,
  Star,
  MapPin,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

const categories = [
  "All Categories",
  "Personal Growth",
  "Love & Relationships",
  "Career & Business",
  "Family & Heritage",
  "Goals & Resolutions",
  "Historical",
  "Travel & Adventure",
];

export default function PublicWallPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "views">(
    "recent"
  );
  const { data, isLoading } = trpc.publicWall.getAllPublicCapsules.useQuery({
    category: selectedCategory,
    sortBy,
  });
  const capsules = (data?.capsules ?? []).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatNumber = (num: number) =>
    num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString();

  // ✅ Apply search filter locally
  const filteredCapsules = capsules.filter((capsule) => {
    const matchesSearch =
      capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.tags?.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All Categories" ||
      capsule.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredCapsules = filteredCapsules.filter((c) => c.featured);
  const regularCapsules = filteredCapsules.filter((c) => !c.featured);

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
          <Link href="/capsule/create">
            <Button className="rounded-full">Create Capsule</Button>
          </Link>
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
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="size-8 text-primary" />
              <Sparkles className="size-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Public Time Capsule Wall
            </h1>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Discover inspiring messages from the past. Read stories, memories,
              and wisdom shared by people around the world.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search time capsules, stories, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) =>
                  setSortBy(v as "recent" | "popular" | "views")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Loading public capsules...
            </div>
          )}

          {/* Featured Capsules */}
          {!isLoading && featuredCapsules.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500" />
                <h2 className="text-xl font-bold">Featured Stories</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredCapsules.map((capsule, index) => (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardHeader className="pb-3">
                        <Badge className="bg-yellow-500 text-yellow-50 mb-2 flex items-center gap-1">
                          <Star className="size-3" />
                          Featured
                        </Badge>
                        <CardTitle className="text-xl leading-tight">
                          {capsule.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{capsule.category}</Badge>
                          {capsule.tags?.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground line-clamp-3">
                          {capsule.excerpt}
                        </p>

                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={capsule.author.image || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {capsule.author?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {capsule.author.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3" />
                              <span>{capsule.author.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>
                              Unlocked {formatDate(capsule.unlockedAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {formatNumber(capsule.stats.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {formatNumber(capsule.stats.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="size-3" />
                              {capsule.stats.comments ?? 0}
                            </span>
                          </div>
                        </div>

                        <Link href={`/capsule/${capsule.id}`}>
                          <Button className="w-full rounded-full">
                            Read Full Story
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Capsules */}
          {!isLoading && filteredCapsules.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                <h2 className="text-xl font-bold">All Stories</h2>
                <span className="text-sm text-muted-foreground">
                  ({regularCapsules.length} capsules)
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularCapsules.map((capsule, index) => (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <Badge variant="outline">{capsule.category}</Badge>
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {capsule.title}
                        </CardTitle>
                        <div className="flex gap-1 flex-wrap">
                          {capsule.tags?.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {capsule.excerpt}
                        </p>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={capsule.author.image || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {capsule.author?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {capsule.author.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3" />
                              <span>{capsule.author.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{formatDate(capsule.unlockedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="size-3" />{" "}
                            {formatNumber(capsule.stats.views)}
                            <Heart className="size-3" />{" "}
                            {formatNumber(capsule.stats.likes)}
                          </div>
                        </div>

                        <Link href={`/capsule/${capsule.id}`}>
                          <Button
                            variant="outline"
                            className="w-full rounded-full bg-transparent"
                          >
                            Read Story
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCapsules.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="size-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No capsules found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== "All Categories"
                    ? "Try adjusting your search or filter criteria"
                    : "Be the first to share your story with the world"}
                </p>
                <Link href="/capsule/create">
                  <Button className="rounded-full">
                    Create Public Capsule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
