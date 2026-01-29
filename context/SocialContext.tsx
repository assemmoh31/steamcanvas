
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AppNotification } from '../types';

interface SocialContextType {
  following: string[];
  notifications: AppNotification[];
  unreadCount: number;
  toggleFollow: (artistName: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [following, setFollowing] = useState<string[]>(['CyberSage', 'TechLord']);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      type: 'rank_up',
      artistName: 'CyberSage',
      artistAvatar: 'https://picsum.photos/seed/sage/100/100',
      message: 'just reached Level 4: Master Status!',
      timestamp: Date.now() - 3600000,
      isRead: false
    },
    {
      id: '2',
      type: 'upload',
      artistName: 'TechLord',
      artistAvatar: 'https://picsum.photos/seed/tech/100/100',
      message: 'uploaded a new item: "Plasma Core V2"',
      timestamp: Date.now() - 172800000,
      isRead: true
    }
  ]);

  const toggleFollow = useCallback((artistName: string) => {
    setFollowing(prev => 
      prev.includes(artistName) 
        ? prev.filter(a => a !== artistName) 
        : [...prev, artistName]
    );
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      isRead: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SocialContext.Provider value={{ 
      following, 
      notifications, 
      unreadCount, 
      toggleFollow, 
      markAsRead, 
      markAllAsRead, 
      addNotification 
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
