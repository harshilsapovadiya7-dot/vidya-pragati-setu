import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Notifications & Alerts"
        description="Official communications regarding application statuses, document queries, and scheme disbursals."
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No notifications</p>
            <p className="text-xs text-muted-foreground">You are all caught up!</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`border transition-all ${
                n.isRead ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/40 shadow-xs'
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-950">{n.title}</h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-saffron-600" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {n.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        markAsRead(n.id);
                        navigate(n.link!);
                      }}
                      className="text-xs text-navy-900 hover:bg-slate-100 flex items-center gap-1 h-8"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-navy-900"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
