import { format } from "date-fns";
import Link from "next/link";
import { Download, Search, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminUserRowActions } from "@/components/admin/AdminUserRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/validations/profile";

interface AdminUsersPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

interface ProfileRow {
  created_at: string;
  email: string | null;
  full_name: string | null;
  id: string;
  is_active: boolean | null;
  role: ProfileRole | null;
}

const ROLE_CLASSES: Record<ProfileRole, string> = {
  admin: "border-transparent bg-muted text-foreground",
  patient: "border-transparent bg-primary/15 text-primary",
  provider: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export default async function AdminUsersPage({ searchParams: searchParamsPromise }: AdminUsersPageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfileError) {
    throw new Error(currentProfileError.message);
  }

  if (currentProfile.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const search = searchParams?.search?.trim() ?? "";
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, is_active")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error } = await query.returns<ProfileRow[]>();
  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage user roles and account status across the platform.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users/export">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      <form action="/admin/users" className="relative max-w-md" method="get">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" defaultValue={search} name="search" placeholder="Search by name or email" />
      </form>

      {!users?.length ? (
        <EmptyState
          description="No users match your current search."
          icon={Users}
          title="No users found"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Signup Date</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((profile) => {
                const role = profile.role ?? "patient";
                const isActive = profile.is_active ?? true;

                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name || "Unnamed User"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{profile.email || "-"}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_CLASSES[role]} variant="outline">
                        {role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(profile.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={isActive ? "border-transparent bg-primary/15 text-primary" : "border-transparent bg-muted text-muted-foreground"} variant="outline">
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminUserRowActions currentRole={role} isActive={isActive} userId={profile.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
