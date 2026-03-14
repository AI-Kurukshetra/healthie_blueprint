import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MessageThread } from "@/components/shared/MessageThread";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";

const partnerIdSchema = z.string().uuid();

interface ProviderMessagesPageProps {
  searchParams?: {
    with?: string;
  };
}

interface AppointmentPatientRow {
  patient_id: string;
}

interface MessageRow {
  content: string;
  created_at: string;
  id: string;
  read_at: string | null;
  receiver_id: string;
  sender_id: string;
}

interface ProfileRow {
  full_name: string | null;
  id: string;
}

interface ConversationItem {
  id: string;
  latestMessageAt: string | null;
  latestMessagePreview: string | null;
  name: string;
  unreadCount: number;
}

export default async function ProviderMessagesPage({ searchParams }: ProviderMessagesPageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: patientRefs, error: patientRefsError }, { data: messages, error: messagesError }] =
    await Promise.all([
      supabase.from("appointments").select("patient_id").eq("provider_id", user.id).returns<AppointmentPatientRow[]>(),
      supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, read_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true })
        .returns<MessageRow[]>(),
    ]);

  if (patientRefsError) {
    throw new Error(patientRefsError.message);
  }

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const patientIdsFromAppointments = (patientRefs ?? []).map((item) => item.patient_id);
  const patientIdsFromMessages = (messages ?? [])
    .map((message) => (message.sender_id === user.id ? message.receiver_id : message.sender_id))
    .filter((id) => id !== user.id);
  const patientIds = Array.from(new Set([...patientIdsFromAppointments, ...patientIdsFromMessages]));

  let patientProfiles: ProfileRow[] = [];
  if (patientIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", patientIds)
      .returns<ProfileRow[]>();

    if (profileError) {
      throw new Error(profileError.message);
    }

    patientProfiles = profileRows ?? [];
  }

  const patientNameById = new Map(patientProfiles.map((profile) => [profile.id, profile.full_name || "Patient"]));
  const conversationsMap = new Map<string, ConversationItem>();

  for (const patientId of patientIds) {
    conversationsMap.set(patientId, {
      id: patientId,
      latestMessageAt: null,
      latestMessagePreview: null,
      name: patientNameById.get(patientId) || "Patient",
      unreadCount: 0,
    });
  }

  for (const message of messages ?? []) {
    const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
    if (partnerId === user.id) {
      continue;
    }

    const existing = conversationsMap.get(partnerId);
    if (!existing) {
      continue;
    }

    existing.latestMessageAt = message.created_at;
    existing.latestMessagePreview = message.content;

    if (message.receiver_id === user.id && !message.read_at) {
      existing.unreadCount += 1;
    }
  }

  const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
    if (!a.latestMessageAt && !b.latestMessageAt) {
      return a.name.localeCompare(b.name);
    }
    if (!a.latestMessageAt) {
      return 1;
    }
    if (!b.latestMessageAt) {
      return -1;
    }

    return b.latestMessageAt.localeCompare(a.latestMessageAt);
  });

  const withPartner = searchParams?.with;
  const parsedPartner = withPartner ? partnerIdSchema.safeParse(withPartner) : null;
  const selectedPartnerId = parsedPartner?.success ? parsedPartner.data : conversations[0]?.id;
  const selectedConversation = selectedPartnerId ? conversations.find((conversation) => conversation.id === selectedPartnerId) : null;

  const threadMessages =
    selectedPartnerId && messages
      ? messages.filter((message) => {
          return (
            (message.sender_id === user.id && message.receiver_id === selectedPartnerId) ||
            (message.sender_id === selectedPartnerId && message.receiver_id === user.id)
          );
        })
      : [];

  if (selectedPartnerId) {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .eq("sender_id", selectedPartnerId)
      .is("read_at", null);
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        description="No patient conversations yet. Messages appear after patient outreach."
        icon={MessageSquare}
        title="No conversations"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Secure conversation threads with your patients.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conversation) => (
              <Button
                asChild
                className="h-auto w-full justify-start px-3 py-2 text-left"
                key={conversation.id}
                variant={conversation.id === selectedPartnerId ? "secondary" : "ghost"}
              >
                <Link href={`/provider/messages?with=${conversation.id}`}>
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{conversation.name}</p>
                      {conversation.unreadCount > 0 ? (
                        <Badge variant="secondary">{conversation.unreadCount}</Badge>
                      ) : null}
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {conversation.latestMessagePreview || "No messages yet"}
                    </p>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {selectedConversation ? (
              <MessageThread
                currentUserId={user.id}
                messages={threadMessages}
                receiverId={selectedConversation.id}
                receiverName={selectedConversation.name}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a conversation.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
