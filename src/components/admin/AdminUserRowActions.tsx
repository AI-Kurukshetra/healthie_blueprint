"use client";

import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { setUserActive, updateUserRole } from "@/app/(dashboard)/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileRoleSchema, type ProfileRole } from "@/lib/validations/profile";

interface AdminUserRowActionsProps {
  currentRole: ProfileRole;
  isActive: boolean;
  userId: string;
}

const roleFormSchema = z.object({
  role: profileRoleSchema,
});

type RoleFormInput = z.infer<typeof roleFormSchema>;

export function AdminUserRowActions({ currentRole, isActive, userId }: AdminUserRowActionsProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const roleForm = useForm<RoleFormInput>({
    defaultValues: { role: currentRole },
    resolver: zodResolver(roleFormSchema),
  });

  useEffect(() => {
    roleForm.reset({ role: currentRole });
  }, [currentRole, roleForm]);

  const onSaveRole = (values: RoleFormInput) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, values.role);
      if (!result.success) {
        roleForm.setError("root", { message: result.error ?? "Unable to update role." });
        toast.error(result.error ?? "Unable to update role.");
        return;
      }

      toast.success("Role updated");
      setIsDialogOpen(false);
      router.refresh();
    });
  };

  const onToggleActive = () => {
    startTransition(async () => {
      const result = await setUserActive(userId, !isActive);
      if (!result.success) {
        toast.error(result.error ?? "Unable to update user status.");
        return;
      }

      toast.success(isActive ? "User deactivated" : "User activated");
      router.refresh();
    });
  };

  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open user actions" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toast.info("Profile detail view will be added in a later phase.")}>
            View profile
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>Change role</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={onToggleActive}>
            {isActive ? "Deactivate user" : "Activate user"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>Update this user&apos;s access level. This takes effect immediately.</DialogDescription>
        </DialogHeader>
        <Form {...roleForm}>
          <form className="space-y-4" onSubmit={roleForm.handleSubmit(onSaveRole)}>
            <FormField
              control={roleForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (required)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {roleForm.formState.errors.root?.message ? (
              <p className="text-sm font-medium text-destructive">{roleForm.formState.errors.root.message}</p>
            ) : null}
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isPending || roleForm.formState.isSubmitting} type="submit">
                {isPending || roleForm.formState.isSubmitting ? "Saving..." : "Confirm"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
