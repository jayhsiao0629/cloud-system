import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface DeviceReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReserve: (reservation: {
    deviceId: string;
    testName: string;
    startTime: string;
    endTime: string;
  }) => void;
  devices: { id: string; name: string }[];
}

const DeviceReservationDialog: React.FC<DeviceReservationDialogProps> = ({
  open,
  onOpenChange,
  onReserve,
  devices,
}) => {
  const [deviceId, setDeviceId] = useState('');
  const [testName, setTestName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleReserve = () => {
    if (deviceId && testName && startTime && endTime) {
      onReserve({ deviceId, testName, startTime, endTime });
      setDeviceId('');
      setTestName('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDeviceId('');
      setTestName('');
      setStartTime('');
      setEndTime('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
      <DialogTitle>Reserve Device for Test</DialogTitle>
        <DialogDescription>
          Reserve a device for your test.
        </DialogDescription>
        <Label>Device</Label>
        <Select
          value={deviceId}
          onValueChange={(v) => setDeviceId(v as string)}
        >
          <SelectTrigger id="device-select">
            <SelectValue placeholder="Select a device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
      <DialogFooter>
        <Button onClick={() => handleOpenChange(false)}>Cancel</Button>
        <Button
          onClick={handleReserve}
          variant="default"
          disabled={!deviceId || !testName || !startTime || !endTime}
        >
          Reserve
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeviceReservationDialog;