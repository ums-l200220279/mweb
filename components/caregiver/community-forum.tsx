import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Share2, Flag, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const forumPosts = [
  {
    id: 1,
    author: "Jane Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Caregiver",
    time: "2 hours ago",
    content:
      "Does anyone have tips for managing sundowning behavior? My father gets very agitated in the evenings and it's becoming harder to calm him down.",
    likes: 12,
    comments: 8,
    isLiked: false,
  },
  {
    id: 2,
    author: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Caregiver",
    time: "Yesterday",
    content:
      "I've found that creating a structured daily routine has really helped my mother with her memory issues. She seems less anxious when she knows what to expect throughout the day. Has anyone else experienced this?",
    likes: 24,
    comments: 15,
    isLiked: true,
  },
  {
    id: 3,
    author: "Dr. Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Neurologist",
    time: "2 days ago",
    content:
      "I wanted to share a new research paper on cognitive exercises that have shown promising results for early-stage Alzheimer's patients. The key finding is that consistent, daily mental stimulation can help maintain cognitive function longer.",
    likes: 45,
    comments: 12,
    isLiked: false,
  },
]

export default function CommunityForum() {
  return (
    <div className="space-y-6">
      {forumPosts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex space-x-4">
            <Avatar>
              <AvatarImage src={post.avatar} alt={post.author} />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{post.author}</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full mr-2">{post.role}</span>
                    <span>{post.time}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      <span>Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-sm">{post.content}</p>
              <div className="mt-4 flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="flex items-center text-slate-500">
                  <ThumbsUp className={`mr-1 h-4 w-4 ${post.isLiked ? "fill-current text-turquoise-500" : ""}`} />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center text-slate-500">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center text-slate-500">
                  <Share2 className="mr-1 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      <Button variant="outline" className="w-full">
        Load More Posts
      </Button>
    </div>
  )
}

