import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Video, Search } from "lucide-react"
import CommunityForum from "@/components/caregiver/community-forum"
import GroupTherapy from "@/components/caregiver/group-therapy"
import OnlineConsultation from "@/components/caregiver/online-consultation"

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Community Support</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input type="search" placeholder="Search community..." className="w-[250px] pl-8" />
          </div>
          <Button>Create Post</Button>
        </div>
      </div>

      <Tabs defaultValue="forum">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forum" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="group-therapy" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Group Therapy
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex items-center">
            <Video className="mr-2 h-4 w-4" />
            Online Consultation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Caregiver Forum</CardTitle>
                  <CardDescription>Connect with other caregivers, share experiences, and get advice</CardDescription>
                </CardHeader>
                <CardContent>
                  <CommunityForum />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Medication Management</h4>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">24 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Daily Care Routines</h4>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">18 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Dealing with Memory Loss</h4>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">15 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Self-Care for Caregivers</h4>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">12 posts</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View All Topics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Start a Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <Input placeholder="Topic title" />
                    <Textarea placeholder="Share your thoughts, questions, or experiences..." />
                    <Button className="w-full">Post Discussion</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="group-therapy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Therapy Sessions</CardTitle>
              <CardDescription>Join virtual support groups led by healthcare professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupTherapy />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Online Consultation</CardTitle>
              <CardDescription>Schedule one-on-one consultations with specialists</CardDescription>
            </CardHeader>
            <CardContent>
              <OnlineConsultation />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

