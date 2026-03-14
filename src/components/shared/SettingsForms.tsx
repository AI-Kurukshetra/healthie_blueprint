"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  changePassword,
  updatePatientSettings,
  updateProfileSettings,
  updateProviderSettings,
} from "@/app/(dashboard)/settings/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  changePasswordSchema,
  updatePatientDetailsSchema,
  updateProfileSchema,
  updateProviderDetailsSchema,
  type ChangePasswordInput,
  type ProfileRole,
  type UpdatePatientDetailsInput,
  type UpdateProfileInput,
  type UpdateProviderDetailsInput,
} from "@/lib/validations/profile";

interface ProfileSettings {
  avatar_url: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
}

interface ProviderDetailsSettings {
  bio: string | null;
  license_number: string | null;
  specialization: string | null;
}

interface PatientDetailsSettings {
  blood_type: string | null;
  emergency_contact: string | null;
  insurance_id: string | null;
  insurance_provider: string | null;
}

export interface SettingsFormsProps {
  patientDetails: PatientDetailsSettings | null;
  profile: ProfileSettings;
  providerDetails: ProviderDetailsSettings | null;
  role: ProfileRole;
}

export function SettingsForms({ patientDetails, profile, providerDetails, role }: SettingsFormsProps) {
  const router = useRouter();

  const profileForm = useForm<UpdateProfileInput>({
    defaultValues: {
      avatar_url: profile.avatar_url || "",
      full_name: profile.full_name || "",
      phone: profile.phone || "",
    },
    resolver: zodResolver(updateProfileSchema),
  });

  const providerForm = useForm<UpdateProviderDetailsInput>({
    defaultValues: {
      bio: providerDetails?.bio || "",
      license_number: providerDetails?.license_number || "",
      specialization: providerDetails?.specialization || "",
    },
    resolver: zodResolver(updateProviderDetailsSchema),
  });

  const patientForm = useForm<UpdatePatientDetailsInput>({
    defaultValues: {
      blood_type: patientDetails?.blood_type || "",
      emergency_contact: patientDetails?.emergency_contact || "",
      insurance_id: patientDetails?.insurance_id || "",
      insurance_provider: patientDetails?.insurance_provider || "",
    },
    resolver: zodResolver(updatePatientDetailsSchema),
  });

  const passwordForm = useForm<ChangePasswordInput>({
    defaultValues: {
      confirm_password: "",
      new_password: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitProfile = async (values: UpdateProfileInput) => {
    const formData = new FormData();
    formData.set("full_name", values.full_name);
    formData.set("phone", values.phone || "");
    formData.set("avatar_url", values.avatar_url || "");

    const result = await updateProfileSettings(formData);
    if (!result.success) {
      profileForm.setError("root", { message: result.error ?? "Unable to save profile." });
      toast.error(result.error ?? "Unable to save profile.");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  };

  const onSubmitProvider = async (values: UpdateProviderDetailsInput) => {
    const formData = new FormData();
    formData.set("specialization", values.specialization || "");
    formData.set("license_number", values.license_number || "");
    formData.set("bio", values.bio || "");

    const result = await updateProviderSettings(formData);
    if (!result.success) {
      providerForm.setError("root", { message: result.error ?? "Unable to save provider details." });
      toast.error(result.error ?? "Unable to save provider details.");
      return;
    }

    toast.success("Provider details updated");
    router.refresh();
  };

  const onSubmitPatient = async (values: UpdatePatientDetailsInput) => {
    const formData = new FormData();
    formData.set("blood_type", values.blood_type || "");
    formData.set("emergency_contact", values.emergency_contact || "");
    formData.set("insurance_provider", values.insurance_provider || "");
    formData.set("insurance_id", values.insurance_id || "");

    const result = await updatePatientSettings(formData);
    if (!result.success) {
      patientForm.setError("root", { message: result.error ?? "Unable to save patient details." });
      toast.error(result.error ?? "Unable to save patient details.");
      return;
    }

    toast.success("Patient details updated");
    router.refresh();
  };

  const onSubmitPassword = async (values: ChangePasswordInput) => {
    const formData = new FormData();
    formData.set("new_password", values.new_password);
    formData.set("confirm_password", values.confirm_password);

    const result = await changePassword(formData);
    if (!result.success) {
      passwordForm.setError("root", { message: result.error ?? "Unable to change password." });
      toast.error(result.error ?? "Unable to change password.");
      return;
    }

    toast.success("Password updated");
    passwordForm.reset({ confirm_password: "", new_password: "" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form className="space-y-4" onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (required)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input defaultValue={profile.email} disabled />
                  </FormControl>
                </FormItem>

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {profileForm.formState.errors.root?.message ? (
                <Alert variant="destructive">
                  <AlertTitle>Profile Update Failed</AlertTitle>
                  <AlertDescription>{profileForm.formState.errors.root.message}</AlertDescription>
                </Alert>
              ) : null}
              <Button disabled={profileForm.formState.isSubmitting} type="submit">
                {profileForm.formState.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {role === "provider" ? (
        <Card>
          <CardHeader>
            <CardTitle>Provider Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...providerForm}>
              <form className="space-y-4" onSubmit={providerForm.handleSubmit(onSubmitProvider)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={providerForm.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={providerForm.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={providerForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {providerForm.formState.errors.root?.message ? (
                  <Alert variant="destructive">
                    <AlertTitle>Provider Details Update Failed</AlertTitle>
                    <AlertDescription>{providerForm.formState.errors.root.message}</AlertDescription>
                  </Alert>
                ) : null}
                <Button disabled={providerForm.formState.isSubmitting} type="submit">
                  {providerForm.formState.isSubmitting ? "Saving..." : "Save Provider Details"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {role === "patient" ? (
        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...patientForm}>
              <form className="space-y-4" onSubmit={patientForm.handleSubmit(onSubmitPatient)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={patientForm.control}
                    name="blood_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={patientForm.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={patientForm.control}
                    name="insurance_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={patientForm.control}
                    name="insurance_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance ID</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {patientForm.formState.errors.root?.message ? (
                  <Alert variant="destructive">
                    <AlertTitle>Patient Details Update Failed</AlertTitle>
                    <AlertDescription>{patientForm.formState.errors.root.message}</AlertDescription>
                  </Alert>
                ) : null}
                <Button disabled={patientForm.formState.isSubmitting} type="submit">
                  {patientForm.formState.isSubmitting ? "Saving..." : "Save Patient Details"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...passwordForm}>
            <form className="max-w-md space-y-4" onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (required)</FormLabel>
                    <FormControl>
                      <Input minLength={8} type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password (required)</FormLabel>
                    <FormControl>
                      <Input minLength={8} type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {passwordForm.formState.errors.root?.message ? (
                <Alert variant="destructive">
                  <AlertTitle>Password Update Failed</AlertTitle>
                  <AlertDescription>{passwordForm.formState.errors.root.message}</AlertDescription>
                </Alert>
              ) : null}
              <Button disabled={passwordForm.formState.isSubmitting} type="submit" variant="outline">
                {passwordForm.formState.isSubmitting ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </Form>

          <div className="rounded-md border border-destructive/40 p-4">
            <p className="text-sm font-medium">Danger Zone</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Account deletion is not yet available in this build.
            </p>
            <Button className="mt-3" disabled type="button" variant="destructive">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
