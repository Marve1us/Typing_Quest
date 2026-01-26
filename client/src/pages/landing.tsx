import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AvatarDisplay, AvatarSelector } from "@/components/avatar-display";
import { useProfile } from "@/contexts/profile-context";
import { Rocket, Play, User, Star, Trophy, Zap, Flame, Target, ArrowRight } from "lucide-react";
import type { Avatar, Profile } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { profile, setProfile, setGuestMode } = useProfile();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>("rocket");
  const queryClient = useQueryClient();

  const createProfileMutation = useMutation({
    mutationFn: async (data: { nickname: string; avatar: Avatar }): Promise<Profile> => {
      const response = await apiRequest("POST", "/api/profiles", data);
      return response as Profile;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      navigate("/play");
    },
  });

  const handleGuestPlay = () => {
    setGuestMode(true);
    navigate("/play");
  };

  const handleContinue = () => {
    navigate("/play");
  };

  const handleCreateProfile = () => {
    if (nickname.trim()) {
      createProfileMutation.mutate({
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl shadow-xl animate-float neon-glow-cyan">
              <Rocket size={48} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4 neon-text-cyan">
            Typing Quest
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
            Explore the galaxy through typing! Race through stars, defend planets, and become a typing champion.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {profile ? (
            <Card className="space-glass rounded-2xl border-2 border-cyan-500/30 neon-border-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <AvatarDisplay avatar={profile.avatar as Avatar} size="lg" />
                  <div>
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <p className="text-2xl font-bold text-cyan-400" data-testid="text-profile-nickname">
                      {profile.nickname}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-muted-foreground">Level {profile.level}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full rounded-full neon-glow-cyan"
                  onClick={handleContinue}
                  data-testid="button-continue"
                >
                  Continue Playing
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button 
                size="lg" 
                className="w-full text-lg py-6 rounded-full neon-glow-cyan"
                onClick={handleGuestPlay}
                data-testid="button-guest-play"
              >
                <Play size={24} className="mr-3" />
                Play as Guest
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="w-full text-lg py-6 rounded-full border-2 border-pink-500/50 hover:border-pink-400 neon-border-glow"
                onClick={() => setShowCreateProfile(true)}
                data-testid="button-create-profile"
              >
                <User size={24} className="mr-3" />
                Create Profile
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-2xl">
          <FeatureCard 
            icon={Zap} 
            title="Fun Games" 
            description="Race, defend & more!"
            color="text-cyan-400"
          />
          <FeatureCard 
            icon={Target} 
            title="Build Skills" 
            description="20-30 WPM goal"
            color="text-green-400"
          />
          <FeatureCard 
            icon={Trophy} 
            title="Earn Badges" 
            description="Collect rewards"
            color="text-purple-400"
          />
          <FeatureCard 
            icon={Flame} 
            title="Daily Streaks" 
            description="Keep practicing!"
            color="text-pink-400"
          />
        </div>
      </div>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>15 minutes a day to explore the typing galaxy!</p>
      </footer>

      <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
        <DialogContent className="sm:max-w-md space-glass rounded-2xl border border-purple-500/40">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text neon-text-cyan">Create Your Profile</DialogTitle>
            <DialogDescription>
              Choose a nickname and avatar to join the typing galaxy!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-cyan-300">Nickname</Label>
              <Input
                id="nickname"
                placeholder="Enter your cosmic name..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="rounded-xl bg-background/50 border-purple-500/30 focus:border-cyan-500"
                data-testid="input-nickname"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-300">Choose Your Avatar</Label>
              <AvatarSelector 
                selected={selectedAvatar}
                onSelect={setSelectedAvatar}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              className="rounded-full border-pink-500/50"
              onClick={() => setShowCreateProfile(false)}
            >
              Cancel
            </Button>
            <Button 
              className="rounded-full neon-glow-cyan"
              onClick={handleCreateProfile}
              disabled={!nickname.trim() || createProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {createProfileMutation.isPending ? "Creating..." : "Launch Adventure!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="space-glass rounded-2xl border border-purple-500/30 hover-elevate neon-border-glow">
      <CardContent className="p-4 text-center">
        <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
