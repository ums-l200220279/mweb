import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const blogPosts = [
  {
    title: "Understanding Alzheimer's: Early Signs and Symptoms",
    excerpt: "Learn about the early warning signs of Alzheimer's disease and when to seek professional help.",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3",
    date: "May 15, 2024",
    author: "Dr. Jane Smith",
  },
  {
    title: "The Role of AI in Cognitive Health Monitoring",
    excerpt:
      "Discover how artificial intelligence is revolutionizing the way we monitor and maintain cognitive health.",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    date: "May 10, 2024",
    author: "Dr. John Doe",
  },
  {
    title: "5 Brain-Boosting Activities for Seniors",
    excerpt: "Explore fun and engaging activities that can help seniors maintain and improve their cognitive function.",
    image:
      "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    date: "May 5, 2024",
    author: "Sarah Johnson, Occupational Therapist",
  },
  {
    title: "Nutrition and Brain Health: Foods That Boost Cognitive Function",
    excerpt: "Learn about the best foods to eat for optimal brain health and improved cognitive performance.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2053&ixlib=rb-4.0.3",
    date: "April 30, 2024",
    author: "Dr. Michael Brown, Nutritionist",
  },
  {
    title: "The Impact of Sleep on Cognitive Health",
    excerpt: "Understand the crucial role of quality sleep in maintaining and improving cognitive function.",
    image:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=2060&ixlib=rb-4.0.3",
    date: "April 25, 2024",
    author: "Dr. Emily Chen, Sleep Specialist",
  },
  {
    title: "Caregiving Tips: Supporting a Loved One with Dementia",
    excerpt:
      "Practical advice and strategies for caregivers to provide the best support for individuals with dementia.",
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2078&ixlib=rb-4.0.3",
    date: "April 20, 2024",
    author: "Lisa Patel, Geriatric Care Manager",
  },
]

export default function BlogPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Memoright Blog</h1>
      <p className="text-xl text-center text-muted-foreground mb-12">
        Stay informed with the latest insights on cognitive health and dementia care
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <Card key={index} className="flex flex-col">
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
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button variant="outline" asChild>
                <Link href={`/blog/${index + 1}`}>Read More</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

