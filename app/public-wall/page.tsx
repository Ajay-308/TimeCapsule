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

// Mock data for public capsules
const mockPublicCapsules = [
  {
    id: "1",
    title: "Letter to My Future Self - College Graduate",
    excerpt:
      "Four years ago, I wrote this letter before starting college. Today I'm reading it as a graduate...",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "San Francisco, CA",
    },
    unlockedAt: "2024-05-15T15:00:00Z",
    createdAt: "2020-08-15T10:30:00Z",
    category: "Personal Growth",
    stats: {
      views: 1247,
      likes: 89,
      comments: 23,
    },
    featured: true,
    tags: ["college", "dreams", "goals"],
  },
  {
    id: "2",
    title: "Time Capsule from the Pandemic",
    excerpt:
      "Writing this during lockdown in 2020. I wonder what the world will look like when this opens...",
    author: {
      name: "Michael Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "New York, NY",
    },
    unlockedAt: "2024-03-20T12:00:00Z",
    createdAt: "2020-03-20T12:00:00Z",
    category: "Historical",
    stats: {
      views: 2156,
      likes: 156,
      comments: 67,
    },
    featured: true,
    tags: ["pandemic", "history", "hope"],
  },
  {
    id: "3",
    title: "Wedding Day Wishes",
    excerpt:
      "To anyone reading this - love is the most beautiful thing in the world. Cherish every moment...",
    author: {
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Austin, TX",
    },
    unlockedAt: "2024-01-10T18:30:00Z",
    createdAt: "2023-01-10T18:30:00Z",
    category: "Love & Relationships",
    stats: {
      views: 892,
      likes: 67,
      comments: 34,
    },
    featured: false,
    tags: ["wedding", "love", "marriage"],
  },
  {
    id: "4",
    title: "New Year Resolutions Check-in",
    excerpt:
      "Last year I promised myself I'd learn guitar, travel more, and be kinder. Here's how it went...",
    author: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Seattle, WA",
    },
    unlockedAt: "2024-01-01T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    category: "Goals & Resolutions",
    stats: {
      views: 634,
      likes: 45,
      comments: 18,
    },
    featured: false,
    tags: ["resolutions", "goals", "reflection"],
  },
  {
    id: "5",
    title: "Grandma's Recipe Collection",
    excerpt:
      "Before she passed, my grandmother shared her secret recipes with me. I'm sharing them with the world...",
    author: {
      name: "Lisa Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Chicago, IL",
    },
    unlockedAt: "2023-12-25T16:00:00Z",
    createdAt: "2022-12-25T16:00:00Z",
    category: "Family & Heritage",
    stats: {
      views: 1834,
      likes: 234,
      comments: 89,
    },
    featured: false,
    tags: ["family", "recipes", "heritage"],
  },
  {
    id: "6",
    title: "Startup Journey - 5 Years Later",
    excerpt:
      "Five years ago I quit my job to start a company. Here's what I learned about entrepreneurship...",
    author: {
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Boston, MA",
    },
    unlockedAt: "2023-11-15T09:00:00Z",
    createdAt: "2018-11-15T09:00:00Z",
    category: "Career & Business",
    stats: {
      views: 3421,
      likes: 287,
      comments: 156,
    },
    featured: false,
    tags: ["startup", "entrepreneurship", "business"],
  },
];

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
  const [sortBy, setSortBy] = useState("recent");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const filteredCapsules = mockPublicCapsules
    .filter((capsule) => {
      const matchesSearch =
        capsule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        capsule.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        capsule.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        capsule.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.stats.likes - a.stats.likes;
        case "views":
          return b.stats.views - a.stats.views;
        case "recent":
        default:
          return (
            new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
          );
      }
    });

  const featuredCapsules = filteredCapsules.filter(
    (capsule) => capsule.featured
  );
  const regularCapsules = filteredCapsules.filter(
    (capsule) => !capsule.featured
  );

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
          <div className="flex items-center gap-4">
            <Link href="/capsule/create">
              <Button className="rounded-full">Create Capsule</Button>
            </Link>
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

          {/* Search and Filters */}
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
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

          {/* Featured Capsules */}
          {featuredCapsules.length > 0 && (
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
                        <div className="flex items-start justify-between">
                          <Badge className="bg-yellow-500 text-yellow-50 mb-2">
                            <Star className="size-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">
                          {capsule.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{capsule.category}</Badge>
                          <div className="flex gap-1">
                            {capsule.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground line-clamp-3">
                          {capsule.excerpt}
                        </p>

                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={capsule.author.avatar || "/placeholder.svg"}
                              alt={capsule.author.name}
                            />
                            <AvatarFallback>
                              {capsule.author.name.charAt(0)}
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
                              {capsule.stats.comments}
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
          <div className="space-y-6">
            {featuredCapsules.length > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                <h2 className="text-xl font-bold">All Stories</h2>
                <span className="text-sm text-muted-foreground">
                  ({regularCapsules.length} capsules)
                </span>
              </div>
            )}

            {filteredCapsules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Globe className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    No capsules found
                  </h3>
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
            ) : (
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
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{capsule.category}</Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {capsule.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          {capsule.tags.slice(0, 3).map((tag) => (
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
                              src={capsule.author.avatar || "/placeholder.svg"}
                              alt={capsule.author.name}
                            />
                            <AvatarFallback>
                              {capsule.author.name.charAt(0)}
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
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {formatNumber(capsule.stats.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {formatNumber(capsule.stats.likes)}
                            </span>
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
            )}
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="size-6 text-primary" />
                  <h3 className="text-xl font-bold">Share Your Story</h3>
                </div>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create a public time capsule and inspire others with your
                  journey, wisdom, or memories.
                </p>
                <Link href="/capsule/create">
                  <Button size="lg" className="rounded-full">
                    Create Public Capsule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
