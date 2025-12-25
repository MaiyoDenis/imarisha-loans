import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddAppointmentModal({ open, onOpenChange, onSuccess }) {
    const [groupId, setGroupId] = useState("");
    const [visitDate, setVisitDate] = useState(new Date());
    const [notes, setNotes] = useState("");
    const [time, setTime] = useState("10:00");
    const { toast } = useToast();

    const { data: groups = [] } = useQuery({
        queryKey: ["field-officer-groups"],
        queryFn: api.getFieldOfficerGroups,
    });

    const mutation = useMutation({
        mutationFn: (data) => api.createGroupVisit(data.groupId, {
            visitDate: data.visitDate,
            notes: data.notes
        }),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Appointment scheduled successfully",
            });
            setGroupId("");
            setVisitDate(new Date());
            setNotes("");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to schedule appointment",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupId) {
            toast({
                title: "Validation Error",
                description: "Please select a group",
                variant: "destructive",
            });
            return;
        }

        // Send as simple date string YYYY-MM-DD to be safe with all Python versions
        const formattedDate = format(visitDate, 'yyyy-MM-dd');

        mutation.mutate({
            groupId,
            visitDate: formattedDate,
            notes: notes || `Scheduled visit at ${time}`
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a new group visit or appointment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="group">Group</Label>
                        <Select value={groupId} onValueChange={setGroupId} disabled={mutation.isPending}>
                            <SelectTrigger id="group">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !visitDate && "text-muted-foreground"
                                        )}
                                        disabled={mutation.isPending}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {visitDate ? format(visitDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={visitDate}
                                        onSelect={(date) => date && setVisitDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="time"
                                    type="time"
                                    className="pl-8"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    disabled={mutation.isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            placeholder="Additional notes for the visit..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={mutation.isPending}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
