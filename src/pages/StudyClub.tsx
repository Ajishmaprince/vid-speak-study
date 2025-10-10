import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Calendar, Trophy } from "lucide-react";

const StudyClub = () => {
  const groups = [
    { name: "Math Study Group", members: 24, subject: "Mathematics", next: "Today, 4:00 PM" },
    { name: "Biology Prep", members: 18, subject: "Biology", next: "Tomorrow, 6:00 PM" },
    { name: "Physics Masters", members: 15, subject: "Physics", next: "Friday, 5:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Study Club</h1>
          <p className="text-muted-foreground">Join study groups and collaborate with peers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 gradient-card shadow-card">
            <Users className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-2xl mb-1">156</h3>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card">
            <MessageCircle className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="font-bold text-2xl mb-1">12</h3>
            <p className="text-sm text-muted-foreground">Study Groups</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card">
            <Trophy className="w-12 h-12 text-yellow-500 mb-3" />
            <h3 className="font-bold text-2xl mb-1">48</h3>
            <p className="text-sm text-muted-foreground">Group Sessions</p>
          </Card>
        </div>

        <Card className="p-6 gradient-card shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Study Groups</h2>
            <Button>Create New Group</Button>
          </div>
          
          <div className="space-y-4">
            {groups.map((group, index) => (
              <Card key={index} className="p-6 bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {group.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Next: {group.next}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">View</Button>
                    <Button>Join</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudyClub;
