import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { timeAgo, getInitials } from "@/lib/utils";

export default function CommunityForum() {
  const [newDiscussion, setNewDiscussion] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["/api/forum/posts"],
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/forum/posts", {
        title: content.length > 50 ? `${content.slice(0, 47)}...` : content,
        content,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewDiscussion("");
      toast({
        title: "Post created",
        description: "Your discussion has been posted to the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handlePostDiscussion = () => {
    if (!newDiscussion.trim()) {
      toast({
        title: "Empty discussion",
        description: "Please enter some content for your discussion.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(newDiscussion);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Community Health Forum</h3>
        <Link href="/community" className="text-sm text-primary-600 hover:underline">
          Browse All
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h4 className="font-medium text-lg mb-2">Recent Discussions</h4>
            <p className="text-sm text-slate-500">Join conversations about health topics</p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {postsData?.posts?.slice(0, 2).map((post: any) => (
                <div key={post.id} className="border-b border-slate-100 pb-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 mr-3">
                      {getInitials(post.user.fullName)}
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">{post.title}</h5>
                      <p className="text-xs text-slate-500 mb-2">
                        Started by {post.user.fullName} • {timeAgo(post.createdAt)}
                      </p>
                      <p className="text-sm text-slate-700 mb-2">{post.content}</p>
                      <div className="flex items-center space-x-3 text-xs">
                        <Link href={`/community/${post.id}`} className="flex items-center text-slate-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.replies?.length || 0} replies
                        </Link>
                        <Link href={`/community/${post.id}`} className="text-primary-600 hover:underline cursor-pointer">
                          Reply
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center w-full">
            <Input
              type="text"
              placeholder="Start a new discussion..."
              className="flex-1 mr-2"
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              disabled={!user || mutation.isPending}
            />
            <Button onClick={handlePostDiscussion} disabled={!user || mutation.isPending}>
              Post
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
