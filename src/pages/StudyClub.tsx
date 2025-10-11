import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, MessageCircle, Calendar, Trophy, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  created_by: string;
  member_count?: number;
  is_member?: boolean;
}

const StudyClub = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubject, setNewGroupSubject] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchGroups();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchGroups();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchGroups = async () => {
    setLoading(true);
    const { data: groupsData, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members(count)
      `);

    if (error) {
      toast({
        title: "Error loading groups",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const enrichedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: memberData } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', group.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          return {
            ...group,
            member_count: group.group_members?.[0]?.count || 0,
            is_member: !!memberData,
          };
        })
      );
      setGroups(enrichedGroups);
    }
    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroupName || !newGroupSubject || !user) return;

    const { data, error } = await supabase
      .from('study_groups')
      .insert([{
        name: newGroupName,
        subject: newGroupSubject,
        description: newGroupDescription,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await supabase
        .from('group_members')
        .insert([{ group_id: data.id, user_id: user.id }]);

      setNewGroupName("");
      setNewGroupSubject("");
      setNewGroupDescription("");
      setDialogOpen(false);
      fetchGroups();
      toast({ title: "Group Created!", description: "Your study group is ready." });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: user.id }]);

    if (error) {
      toast({
        title: "Error joining group",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchGroups();
      toast({ title: "Joined!", description: "You're now a member of this study group." });
    }
  };

  const totalMembers = groups.reduce((sum, group) => sum + (group.member_count || 0), 0);

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Study Club
          </h1>
          <p className="text-muted-foreground">Join study groups and collaborate with peers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 gradient-card shadow-card border-primary/20">
            <Users className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-2xl mb-1">{totalMembers}</h3>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card border-secondary/20">
            <MessageCircle className="w-12 h-12 text-secondary mb-3" />
            <h3 className="font-bold text-2xl mb-1">{groups.length}</h3>
            <p className="text-sm text-muted-foreground">Study Groups</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card border-accent/20">
            <Trophy className="w-12 h-12 text-accent mb-3" />
            <h3 className="font-bold text-2xl mb-1">{groups.filter(g => g.is_member).length}</h3>
            <p className="text-sm text-muted-foreground">Your Groups</p>
          </Card>
        </div>

        <Card className="p-6 gradient-card shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Study Groups</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-accent">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="gradient-card">
                <DialogHeader>
                  <DialogTitle>Create New Study Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Advanced Calculus Study Group"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newGroupSubject}
                      onChange={(e) => setNewGroupSubject(e.target.value)}
                      placeholder="e.g., Mathematics"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="What will your group focus on?"
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={createGroup} className="w-full shadow-accent">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No study groups yet. Create the first one!</p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <Card key={group.id} className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.member_count} members
                        </span>
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-md">
                          {group.subject}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {group.is_member ? (
                        <Button variant="outline" className="border-primary text-primary">
                          Joined
                        </Button>
                      ) : (
                        <Button onClick={() => joinGroup(group.id)} className="shadow-accent">
                          Join Group
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudyClub;
