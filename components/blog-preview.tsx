import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const blogPosts = [
  {
    id: 1,
    title: "Understanding Alzheimer's: Early Signs and Symptoms",
    excerpt: "Learn about the early warning signs of Alzheimer's disease and when to seek professional help.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3",
    date: "May 15, 2024",
    author: "Dr. Jane Smith",
  },
  {
    id: 2,
    title: "The Role of AI in Cognitive Health Monitoring",
    excerpt:
      "Discover how artificial intelligence is revolutionizing the way we monitor and maintain cognitive health.",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    date: "May 10, 2024",
    author: "Dr. John Doe",
  },
  {
    id: 3,
    title: "5 Brain-Boosting Activities for Seniors",
    excerpt: "Explore fun and engaging activities that can help seniors maintain and improve their cognitive function.",
    image:
      "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    date: "May 5, 2024",
    author: "Sarah Johnson, Occupational Therapist",
  },
]

export default function BlogPreview() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {blogPosts.map((post) => (
        <Card key={post.id}>
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>
              {post.date} | {post.author}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href={`/blog/${post.id}`}>Read More</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

