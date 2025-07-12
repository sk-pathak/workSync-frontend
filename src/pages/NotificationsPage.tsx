import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { notificationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const NotificationsPage = () => {
  const { notifications, setNotifications, markAsRead } = useNotificationStore();
  const { toast } = useToast();

  useEffect(() => {
    notificationsApi.getAll().then(res => setNotifications(res.content));
  }, [setNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      markAsRead(id);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const handleJoinRequest = async (id: string, accept: boolean) => {
    try {
      await notificationsApi.respondToJoinRequest(id, accept);
      toast({
        title: accept ? 'Request accepted' : 'Request rejected',
        description: 'Join request has been processed.',
      });
      notificationsApi.getAll().then(res => setNotifications(res.content));
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to process join request', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dark min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-primary drop-shadow">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <Card key={n.id} className="neu-card">
              <CardHeader>
                <CardTitle>{n.type.replace('_', ' ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div>
                    {(() => {
                      try {
                        const payloadObj = n.payload ? JSON.parse(n.payload) : null;
                        if (payloadObj && typeof payloadObj === 'object' && 'message' in payloadObj) {
                          return payloadObj.message;
                        }
                      } catch (e) {}
                      return n.payload || n.type;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {n.status !== 'READ' && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(n.id)} className="neu-btn">
                        Mark as read
                      </Button>
                    )}
                    {n.type === 'JOIN_REQUEST' && n.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => handleJoinRequest(n.id, true)} className="neu-btn">
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleJoinRequest(n.id, false)} className="neu-btn">
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}