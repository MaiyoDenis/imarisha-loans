import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, User, Phone, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [messageContent, setMessageContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: contacts = [], isLoading: contactsLoading } = useQuery({
        queryKey: ["contacts"],
        queryFn: api.getContacts,
    });

    const { data: conversation = [], isLoading: conversationLoading } = useQuery({
        queryKey: ["conversation", selectedContact?.id],
        queryFn: () => api.getConversation(selectedContact.id),
        enabled: !!selectedContact,
        refetchInterval: 5000, // Poll for new messages every 5 seconds
    });

    const sendMutation = useMutation({
        mutationFn: (data) => api.sendMessage(data),
        onSuccess: () => {
            setMessageContent("");
            queryClient.invalidateQueries(["conversation", selectedContact?.id]);
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversation]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageContent.trim() || !selectedContact) return;

        sendMutation.mutate({
            recipientId: selectedContact.id,
            content: messageContent.trim(),
        });
    };

    const filteredContacts = contacts.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    return (
        <Layout>
            <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
                {/* Contacts Sidebar */}
                <Card className="w-80 flex flex-col">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-xl font-bold">Messages</CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts..."
                                className="pl-8 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {contactsLoading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading contacts...</div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No contacts found</div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className={cn(
                                                "flex items-center gap-3 p-4 cursor-pointer transition hover:bg-muted/50",
                                                selectedContact?.id === contact.id && "bg-muted"
                                            )}
                                            onClick={() => setSelectedContact(contact)}
                                        >
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                                                    {contact.firstName[0]}{contact.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-sm truncate">
                                                        {contact.firstName} {contact.lastName}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {contact.role?.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col relative overflow-hidden">
                    {selectedContact ? (
                        <>
                            <CardHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm z-10">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                                            {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm">
                                            {selectedContact.firstName} {selectedContact.lastName}
                                        </p>
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden bg-muted/5">
                                <div className="h-full flex flex-col">
                                    <div 
                                        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                                        ref={scrollRef}
                                    >
                                        {conversationLoading ? (
                                            <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                                                Loading conversation...
                                            </div>
                                        ) : conversation.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-medium">No messages yet</p>
                                                <p className="text-xs">Start the conversation by sending a message below.</p>
                                            </div>
                                        ) : (
                                            conversation.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        "flex flex-col max-w-[80%]",
                                                        msg.senderId === currentUser?.id ? "ml-auto items-end" : "mr-auto items-start"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                                            msg.senderId === currentUser?.id
                                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                : "bg-card border border-border rounded-tl-none"
                                                        )}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-4 border-t bg-background shrink-0">
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <Input
                                                placeholder="Type a message..."
                                                className="flex-1"
                                                value={messageContent}
                                                onChange={(e) => setMessageContent(e.target.value)}
                                                disabled={sendMutation.isPending}
                                            />
                                            <Button type="submit" disabled={!messageContent.trim() || sendMutation.isPending}>
                                                {sendMutation.isPending ? (
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50 p-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="h-10 w-10 text-primary" />
                            </div>
                            <div className="max-w-xs space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Your Messages</h3>
                                <p className="text-sm">Select a contact from the sidebar to start a conversation or view history.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
}
