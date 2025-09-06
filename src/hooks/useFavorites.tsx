import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "./useTelegramWebApp";
import { useAuth } from "./useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Load favorites from localStorage when user is authenticated
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`job-favorites-${user.id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`job-favorites-${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addToFavorites = (jobId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (!favorites.includes(jobId)) {
      setFavorites(prev => [...prev, jobId]);
      hapticFeedback.notification('success');
      toast({
        title: "ተጨምሯል",
        description: "ስራው ወደ ተወዳጆች ተጨምሯል።",
      });
    }
  };

  const removeFromFavorites = (jobId: string) => {
    if (!user) return;
    
    setFavorites(prev => prev.filter(id => id !== jobId));
    hapticFeedback.impact('light');
    toast({
      title: "ተወግዷል", 
      description: "ስራው ከተወዳጆች ተወግዷል።",
      variant: "destructive",
    });
  };

  const toggleFavorite = (jobId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (favorites.includes(jobId)) {
      removeFromFavorites(jobId);
    } else {
      addToFavorites(jobId);
    }
  };

  const isFavorite = (jobId: string) => {
    return user ? favorites.includes(jobId) : false;
  };

  const clearAllFavorites = () => {
    if (!user) return;
    
    setFavorites([]);
    hapticFeedback.notification('warning');
    toast({
      title: "ተጠረገ",
      description: "ሁሉም ተወዳጆች ተወግደዋል።",
      variant: "destructive",
    });
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length,
    requiresAuth: !user,
  };
}