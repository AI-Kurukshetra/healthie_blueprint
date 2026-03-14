"use client";

import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { sendMessage } from "@/app/(dashboard)/messages/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendMessageSchema } from "@/lib/validations/message";

interface ThreadMessage {
  content: string;
  created_at: string;
  id: string;
  receiver_id: string;
  sender_id: string;
}

export interface MessageThreadProps {
  currentUserId: string;
  messages: ThreadMessage[];
  receiverId: string;
  receiverName: string;
}

const messageFormSchema = sendMessageSchema.pick({ content: true });
type MessageFormInput = z.infer<typeof messageFormSchema>;

export function MessageThread({ currentUserId, messages, receiverId, receiverName }: MessageThreadProps) {
  const router = useRouter();

  const form = useForm<MessageFormInput>({
    defaultValues: { content: "" },
    resolver: zodResolver(messageFormSchema),
  });

  const onSubmit = async (values: MessageFormInput) => {
    const result = await sendMessage({ content: values.content, receiver_id: receiverId });
    if (!result.success) {
      form.setError("root", { message: result.error ?? "Unable to send message." });
      toast.error(result.error ?? "Unable to send message.");
      return;
    }

    form.reset({ content: "" });
    toast.success("Message sent");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{receiverName}</h2>
          <p className="text-xs text-muted-foreground">Secure thread</p>
        </div>
        <Button onClick={() => router.refresh()} size="sm" type="button" variant="outline">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="h-[420px] space-y-3 overflow-y-auto rounded-xl bg-muted/20 p-4 shadow-sm">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
        ) : (
          messages.map((message) => {
            const isCurrentUserSender = message.sender_id === currentUserId;

            return (
              <div
                className={cn(
                  "max-w-[85%] space-y-1 rounded-xl px-3 py-2 text-sm",
                  isCurrentUserSender
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-background text-foreground"
                )}
                key={message.id}
              >
                <p>{message.content}</p>
                <p
                  className={cn(
                    "text-[11px]",
                    isCurrentUserSender ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {format(new Date(message.created_at), "MMM d, h:mm a")}
                </p>
              </div>
            );
          })
        )}
      </div>

      <Form {...form}>
        <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (required)</FormLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <FormControl>
                    <Input maxLength={2000} placeholder="Type your message..." {...field} />
                  </FormControl>
                  <Button className="w-full sm:w-auto" disabled={form.formState.isSubmitting} type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Sending..." : "Send"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root?.message ? (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
        </form>
      </Form>
    </div>
  );
}
