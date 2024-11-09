// EventEditModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { PlotEvent } from "@/types/IPlot";

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingEvent: { plotLineId: string; event: PlotEvent } | null;
  setEditingEvent: (
    event: { plotLineId: string; event: PlotEvent } | null
  ) => void;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  setEditingEvent,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        {editingEvent && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="event"
                className="block text-sm font-medium text-gray-700"
              >
                Event
              </label>
              <Input
                id="event"
                value={editingEvent.event.name}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    event: { ...editingEvent.event, name: e.target.value },
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <Textarea
                id="content"
                value={editingEvent.event.content}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    event: { ...editingEvent.event, content: e.target.value },
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
