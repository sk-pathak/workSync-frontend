import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNotificationStore } from '@/stores/notificationStore';
import { notificationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Bell,
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  Trash,
  FolderOpen,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPage = () => {
  const {
    notifications,
    dismissedNotifications,
    setNotifications,
    setDismissedNotifications,
    markAsRead,
    removeNotification,
    markAllAsRead,
    dismissAll,
    setUnreadCount,
    unreadCount,
  } = useNotificationStore();
  const [tab, setTab] = useState<'active' | 'dismissed'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    notificationsApi.getAll().then(res => setNotifications(res.content));
    notificationsApi.getDismissed().then(res => setDismissedNotifications(res.content));
    notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
  }, [setNotifications, setDismissedNotifications, setUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      markAsRead(id);
      toast.success('Marked as read', {
        description: 'Notification has been marked as read.',
      });
      notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
    } catch (e) {
      toast.error('Failed to mark as read', {
        description: 'Please try again later.',
      });
    }
  };

  const handleRemoveNotification = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      await notificationsApi.dismiss(id);
      removeNotification(id);
      toast.success('Notification removed', {
        description: 'Notification has been removed.',
      });
      notificationsApi.getDismissed().then(res => setDismissedNotifications(res.content));
      notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
    } catch (e) {
      toast.error('Failed to remove notification', {
        description: 'Please try again later.',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllAsRead();
      markAllAsRead();
      toast.success('All notifications marked as read');
      notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
    } catch (e) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAll = async () => {
    setLoading(true);
    try {
      // Mark all as read before dismissing all
      await notificationsApi.markAllAsRead();
      await notificationsApi.dismissAll();
      dismissAll();
      toast.success('All notifications dismissed');
      notificationsApi.getDismissed().then(res => setDismissedNotifications(res.content));
      notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
    } catch (e) {
      toast.error('Failed to dismiss all notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (id: string, accept: boolean) => {
    try {
      await notificationsApi.respondToJoinRequest(id, accept);
      toast.success(accept ? 'Request accepted' : 'Request rejected', {
        description: `Join request has been ${accept ? 'accepted' : 'rejected'}.`,
      });
      notificationsApi.getAll().then(res => setNotifications(res.content));
      notificationsApi.getUnreadCount().then(count => setUnreadCount(count));
    } catch (e) {
      toast.error('Failed to process join request', {
        description: 'Please try again later.',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'JOIN_REQUEST':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'TASK_ASSIGNED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'PROJECT_UPDATE':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'SYSTEM_MESSAGE':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-accent" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'JOIN_REQUEST':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'TASK_ASSIGNED':
        return 'border-green-500/30 bg-green-500/10';
      case 'PROJECT_UPDATE':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'SYSTEM_MESSAGE':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-accent/30 bg-accent/10';
    }
  };

  const getNotificationMessage = (notification: any) => {
    let payloadObj = null;
    try {
      payloadObj = notification.payload ? JSON.parse(notification.payload) : null;
    } catch (e) { }

    // JOIN_REQUEST
    if (notification.type === 'JOIN_REQUEST') {
      if (payloadObj && payloadObj.message) {
        return payloadObj.message;
      }
      if (notification.sender) {
        return `${notification.sender.name || notification.sender.username} requested to join your project.`;
      }
      return 'Someone requested to join your project.';
    }

    // JOIN_APPROVED
    if (notification.type === 'JOIN_APPROVED') {
      if (notification.project) {
        return `Your request to join project "${notification.project.name}" was approved.`;
      }
      return 'Your join request was approved.';
    }

    // JOIN_REJECTED
    if (notification.type === 'JOIN_REJECTED') {
      if (notification.project) {
        return `Your request to join project "${notification.project.name}" was rejected.`;
      }
      return 'Your join request was rejected.';
    }

    // MEMBER_REMOVED
    if (notification.type === 'MEMBER_REMOVED') {
      if (notification.project) {
        return `You were removed from project "${notification.project.name}".`;
      }
      return 'You were removed from a project.';
    }

    // TASK_ASSIGNED
    if (notification.type === 'TASK_ASSIGNED') {
      if (payloadObj && payloadObj.title) {
        return `You have been assigned a new task: "${payloadObj.title}"`;
      }
      return 'You have been assigned a new task.';
    }

    // TASK_STATUS_CHANGED
    if (notification.type === 'TASK_STATUS_CHANGED') {
      if (payloadObj && payloadObj.title && payloadObj.newStatus) {
        return `The status of task "${payloadObj.title}" was changed to "${payloadObj.newStatus}".`;
      }
      return 'A task status was changed.';
    }

    // TASK_DUE_SOON
    if (notification.type === 'TASK_DUE_SOON') {
      if (payloadObj && payloadObj.title && payloadObj.dueDate) {
        return `Task "${payloadObj.title}" is due soon (${payloadObj.dueDate}).`;
      }
      return 'A task is due soon.';
    }

    // TASK_OVERDUE
    if (notification.type === 'TASK_OVERDUE') {
      if (payloadObj && payloadObj.title && payloadObj.dueDate) {
        return `Task "${payloadObj.title}" is overdue (was due ${payloadObj.dueDate}).`;
      }
      return 'A task is overdue.';
    }

    // PROJECT_UPDATED
    if (notification.type === 'PROJECT_UPDATED') {
      if (payloadObj && payloadObj.message) {
        return payloadObj.message;
      }
      if (notification.project) {
        return `Project "${notification.project.name}" was updated.`;
      }
      return 'A project you are part of was updated.';
    }

    // PROJECT_STATUS_CHANGED
    if (notification.type === 'PROJECT_STATUS_CHANGED') {
      if (notification.project && payloadObj && payloadObj.newStatus) {
        return `Project "${notification.project.name}" status changed to "${payloadObj.newStatus}".`;
      }
      return 'A project status was changed.';
    }

    // TASK_COMMENTED
    if (notification.type === 'TASK_COMMENTED') {
      if (payloadObj && payloadObj.title && payloadObj.commentText) {
        return `New comment on task "${payloadObj.title}": ${payloadObj.commentText}`;
      }
      return 'A new comment was added to a task.';
    }

    // MENTIONED_IN_COMMENT
    if (notification.type === 'MENTIONED_IN_COMMENT') {
      if (payloadObj && payloadObj.title && payloadObj.commentText) {
        return `You were mentioned in a comment on task "${payloadObj.title}": ${payloadObj.commentText}`;
      }
      return 'You were mentioned in a comment.';
    }

    // FALLBACK: If payload has a message
    if (payloadObj && typeof payloadObj === 'object' && 'message' in payloadObj) {
      return payloadObj.message;
    }

    // Default: prettify type
    return notification.type.replace('_', ' ');
  };

  const getNotificationDetails = (notification: any) => {
    const details = [];

    if (notification.project) {
      details.push({
        icon: <FolderOpen className="w-3 h-3" />,
        text: notification.project.name,
        color: 'text-blue-400'
      });
    }

    if (notification.sender) {
      details.push({
        icon: <User className="w-3 h-3" />,
        text: notification.sender.name || notification.sender.username,
        color: 'text-green-400'
      });
    }

    return details;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gradient-dark min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-primary">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-primary">Notifications</h1>
            <p className="text-text-secondary text-lg">
              Stay updated with your project activities
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-accent text-white px-3 py-1 text-sm">
            {unreadCount} unread
          </Badge>
          <Button
            onClick={handleMarkAllAsRead}
            className="glass-button bg-blue-500/20 border-blue-400 text-blue-100 hover:bg-blue-400/30 hover:border-blue-300"
            disabled={loading || unreadCount === 0}
          >
            Mark All as Read
          </Button>
          <Button
            onClick={handleDismissAll}
            className="glass-button bg-red-500/20 border-red-400 text-red-100 hover:bg-red-400/30 hover:border-red-300"
            disabled={loading || notifications.length === 0}
          >
            Dismiss All
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'active' ? 'bg-surface/80 text-accent' : 'bg-surface/40 text-text-secondary'}`}
          onClick={() => setTab('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'dismissed' ? 'bg-surface/80 text-accent' : 'bg-surface/40 text-text-secondary'}`}
          onClick={() => setTab('dismissed')}
        >
          Dismissed
        </button>
      </div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {tab === 'active' ? (
          notifications.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">No notifications</h3>
                  <p className="text-text-secondary">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification, index) => {
              const details = getNotificationDetails(notification);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`glass-card border-l-4 ${getNotificationColor(notification.type)} ${notification.status !== 'READ' ? 'ring-2 ring-accent/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-lg bg-surface/50 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-semibold text-text-primary capitalize">
                                {notification.type.replace('_', ' ')}
                              </h3>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-text-secondary" />
                                <span className="text-xs text-text-secondary">
                                  {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt)) : ''} ago
                                </span>
                              </div>
                              {notification.status !== 'READ' && (
                                <Badge className="bg-accent/20 text-accent text-xs">
                                  New
                                </Badge>
                              )}
                            </div>

                            {/* Notification details (project, user, etc.) */}
                            {details.length > 0 && (
                              <div className="flex items-center space-x-4 mb-2">
                                {details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center space-x-1">
                                    <span className={detail.color}>{detail.icon}</span>
                                    <span className="text-xs text-text-secondary">{detail.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Sender avatar for join requests */}
                            {notification.type === 'JOIN_REQUEST' && notification.sender && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={notification.sender.avatarUrl} />
                                  <AvatarFallback className="text-xs bg-accent/20 text-accent">
                                    {notification.sender.name?.charAt(0) || notification.sender.username?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-text-secondary">
                                  {notification.sender.name || notification.sender.username} wants to join
                                </span>
                              </div>
                            )}

                            <p className="text-sm text-text-primary line-clamp-2">
                              {getNotificationMessage(notification)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-3">
                          {notification.status !== 'READ' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="glass-button text-xs p-2 h-8 w-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveNotification(notification.id)}
                            className="glass-button text-xs p-2 h-8 w-8 bg-red-500/20 border-red-400 text-red-100 hover:bg-red-400/30 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Action buttons for join requests */}
                      {notification.type === 'JOIN_REQUEST' && notification.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-white/10">
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(notification.id, true)}
                            className="glass-button bg-green-500/20 border-green-400 text-green-100 hover:bg-green-400/30 hover:border-green-300 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(notification.id, false)}
                            className="glass-button bg-red-500/20 border-red-400 text-red-100 hover:bg-red-400/30 hover:border-red-300 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )
        ) : (
          dismissedNotifications.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <Trash className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 text-text-primary">No dismissed notifications</h3>
                  <p className="text-text-secondary">
                    Dismissed notifications will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            dismissedNotifications.map((notification, index) => {
              const details = getNotificationDetails(notification);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`glass-card border-l-4 ${getNotificationColor(notification.type)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-lg bg-surface/50 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-semibold text-text-primary capitalize">
                                {notification.type.replace('_', ' ')}
                              </h3>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-text-secondary" />
                                <span className="text-xs text-text-secondary">
                                  {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt)) : ''} ago
                                </span>
                              </div>
                            </div>

                            {/* Notification details (project, user, etc.) */}
                            {details.length > 0 && (
                              <div className="flex items-center space-x-4 mb-2">
                                {details.map((detail, idx) => (
                                  <div key={idx} className="flex items-center space-x-1">
                                    <span className={detail.color}>{detail.icon}</span>
                                    <span className="text-xs text-text-secondary">{detail.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Sender avatar for join requests */}
                            {notification.type === 'JOIN_REQUEST' && notification.sender && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={notification.sender.avatarUrl} />
                                  <AvatarFallback className="text-xs bg-accent/20 text-accent">
                                    {notification.sender.name?.charAt(0) || notification.sender.username?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-text-secondary">
                                  {notification.sender.name || notification.sender.username} wants to join
                                </span>
                              </div>
                            )}

                            <p className="text-sm text-text-primary line-clamp-2">
                              {getNotificationMessage(notification)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-3">
                          {/* Remove the eye button for dismissed notifications */}
                        </div>
                      </div>

                      {/* Action buttons for join requests */}
                      {notification.type === 'JOIN_REQUEST' && notification.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-white/10">
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(notification.id, true)}
                            className="glass-button bg-green-500/20 border-green-400 text-green-100 hover:bg-green-400/30 hover:border-green-300 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleJoinRequest(notification.id, false)}
                            className="glass-button bg-red-500/20 border-red-400 text-red-100 hover:bg-red-400/30 hover:border-red-300 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )
        )}
      </motion.div>
    </div>
  );
};