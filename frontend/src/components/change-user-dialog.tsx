import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface ChangeUserDialogProps {
  open: boolean;
  currentUserId: string;
  onOpenChange: (open: boolean) => void;
  onChangeUserId: (newUserId: string) => void;
}

const ChangeUserDialog: React.FC<ChangeUserDialogProps> = ({
  open,
  currentUserId,
  onOpenChange,
  onChangeUserId,
}) => {
  const [userId, setUserId] = useState(currentUserId);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const content = users.map(user => (
    <SelectItem key={user.id.toString()} value={user.id.toString()}>
      {user.username}
    </SelectItem>
  ));

  useEffect(() => {
    if (!open) return;
    fetch("/api/v1/getUsers")
      .then(res => res.json())
      .then(data => setUsers(data?.users ?? []))
      .catch(err => console.error("Fetch devices error:", err))
  }, [open, currentUserId]);

  React.useEffect(() => {
    if (open) setUserId(currentUserId);
  }, [open, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Switch User</DialogTitle>
          <DialogDescription>
            Select a user to switch to. This will change the current user context.
          </DialogDescription>
          <Label htmlFor="user-select">Select User</Label>
          <Select
            value={userId}
            onValueChange={(value) => {
              setUserId(value);
              onChangeUserId(value);
            }}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {content}
            </SelectContent>
          </Select>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUserDialog;