import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { messages as messagesApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const TenantMessages = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ["tenant-conversations"],
    queryFn: messagesApi.listConversations,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: () => messagesApi.listMessages(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { conversation: string; content: string }) => messagesApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      setMessage("");
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedConversation) return;
    sendMutation.mutate({ conversation: selectedConversation, content: message });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("messages.title")}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations list */}
        <Card className="glass-strong border-border/30">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground mb-3">{t("messages.lease")}</p>
            {conversationsLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : conversationsData && conversationsData.length > 0 ? conversationsData.map((conversation: any) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(String(conversation.id))}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-colors",
                  selectedConversation === String(conversation.id)
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50"
                )}
              >
                <p className="font-semibold text-sm text-foreground">
                  {conversation.property_title || `${t("common.property")} #${conversation.property_id}`}
                </p>
                <p className="text-xs text-muted-foreground">{conversation.landlord_name || t("propertyDetails.owner")}</p>
              </button>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">{t("messages.noMessages")}</p>
            )}
          </CardContent>
        </Card>

        {/* Messages area */}
        <Card className="md:col-span-2 glass-strong border-border/30 flex flex-col">
          {selectedConversation ? (
            <>
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-3/4" />)}</div>
                ) : messagesData && messagesData.length > 0 ? (
                  <div className="space-y-3">
                    {messagesData.map((msg: any) => {
                      const isMe = String(msg.sender_id) === user?.id;
                      return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                            isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            <p>{msg.content}</p>
                            <p className={cn("text-[10px] mt-1", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("messages.noMessages")}</p>
                )}
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder={t("messages.placeholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button size="icon" onClick={handleSend} disabled={sendMutation.isPending || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">{t("messages.selectConversation")}</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TenantMessages;
