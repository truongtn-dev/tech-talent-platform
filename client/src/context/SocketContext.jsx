import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { notification } from 'antd';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        if (user && user.userId) {
            fetchNotifications();

            const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
            setSocket(newSocket);

            newSocket.emit('join', user.userId);

            newSocket.on('NEW_NOTIFICATION', (data) => {
                setUnreadCount(prev => prev + 1);
                setNotifications(prev => [data, ...prev].slice(0, 20));

                notification.info({
                    message: data.title,
                    description: data.message,
                    placement: 'bottomRight',
                });
            });

            return () => newSocket.close();
        } else {
            setSocket(null);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const markAllRead = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllRead, fetchNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
