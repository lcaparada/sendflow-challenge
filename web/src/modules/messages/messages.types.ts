export type MessageStatus = "scheduled" | "sent";

export type MessageType = {
  id: string;
  userId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: Date;
  createdAt: Date;
};
