"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generateSOAPNote } from "@/app/(dashboard)/provider/appointments/ai-actions";
import { createClinicalNote, updateClinicalNote } from "@/app/(dashboard)/provider/appointments/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentType } from "@/lib/validations/appointment";
import { createClinicalNoteSchema } from "@/lib/validations/clinical-note";

interface ClinicalNote {
  assessment: string | null;
  id: string;
  objective: string | null;
  plan: string | null;
  subjective: string;
}

interface ClinicalNoteEditorProps {
  appointmentId: string;
  appointmentType: AppointmentType;
  existingNote: ClinicalNote | null;
  patientId: string;
}

const clinicalNoteFormSchema = createClinicalNoteSchema.pick({
  assessment: true,
  objective: true,
  plan: true,
  subjective: true,
});

type ClinicalNoteFormInput = z.infer<typeof clinicalNoteFormSchema>;

export function ClinicalNoteEditor({ appointmentId, appointmentType, existingNote, patientId }: ClinicalNoteEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!existingNote);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [visitSummary, setVisitSummary] = useState("");
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ClinicalNoteFormInput>({
    defaultValues: {
      assessment: existingNote?.assessment ?? "",
      objective: existingNote?.objective ?? "",
      plan: existingNote?.plan ?? "",
      subjective: existingNote?.subjective ?? "",
    },
    resolver: zodResolver(clinicalNoteFormSchema),
  });
  const [subjective, objective, assessment, plan] = form.watch([
    "subjective",
    "objective",
    "assessment",
    "plan",
  ]);
  const isEmptySoap = !subjective?.trim() && !objective?.trim() && !assessment?.trim() && !plan?.trim();

  if (existingNote && !isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3">
          <div>
            <p className="text-sm font-medium">Subjective</p>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{existingNote.subjective}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Objective</p>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{existingNote.objective || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Assessment</p>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{existingNote.assessment || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Plan</p>
            <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{existingNote.plan || "-"}</p>
          </div>
        </div>

        <Button
          onClick={() => {
            form.reset({
              assessment: existingNote.assessment ?? "",
              objective: existingNote.objective ?? "",
              plan: existingNote.plan ?? "",
              subjective: existingNote.subjective,
            });
            setIsEditing(true);
          }}
          type="button"
          variant="outline"
        >
          Edit
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: ClinicalNoteFormInput) => {
    if (existingNote) {
      const shouldContinue = window.confirm("Update this clinical note?");
      if (!shouldContinue) {
        return;
      }
    }

    const formData = new FormData();
    formData.set("appointment_id", appointmentId);
    formData.set("patient_id", patientId);
    formData.set("subjective", values.subjective);
    formData.set("objective", values.objective ?? "");
    formData.set("assessment", values.assessment ?? "");
    formData.set("plan", values.plan ?? "");

    const result = existingNote
      ? await updateClinicalNote(existingNote.id, formData)
      : await createClinicalNote(formData);

    if (!result.success) {
      form.setError("root", { message: result.error ?? "Unable to save note." });
      toast.error(result.error ?? "Unable to save note.");
      return;
    }

    toast.success("Clinical note saved");
    setIsAIGenerated(false);
    router.refresh();

    if (existingNote) {
      setIsEditing(false);
    } else {
      form.reset({
        assessment: "",
        objective: "",
        plan: "",
        subjective: "",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {isAIGenerated && (
          <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Sparkles className="mr-1 h-3 w-3" />
                AI Generated
              </Badge>
              <span className="text-xs text-muted-foreground">Review and edit before saving</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={isGenerating}
                onClick={async () => {
                  setIsGenerating(true);
                  const result = await generateSOAPNote(appointmentType, visitSummary);
                  setIsGenerating(false);
                  if (!result.success || !result.data) {
                    toast.error(result.error ?? "AI generation failed. Please try again.");
                    return;
                  }
                  form.setValue("subjective", result.data.subjective, { shouldDirty: true });
                  form.setValue("objective", result.data.objective, { shouldDirty: true });
                  form.setValue("assessment", result.data.assessment, { shouldDirty: true });
                  form.setValue("plan", result.data.plan, { shouldDirty: true });
                  toast.success("Note regenerated");
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                {isGenerating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />}
                Regenerate
              </Button>
              <Button
                disabled={isGenerating}
                onClick={() => {
                  form.reset({
                    assessment: existingNote?.assessment ?? "",
                    objective: existingNote?.objective ?? "",
                    plan: existingNote?.plan ?? "",
                    subjective: existingNote?.subjective ?? "",
                  });
                  setIsAIGenerated(false);
                  setVisitSummary("");
                  toast.info("AI content cleared");
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {!isAIGenerated && isEmptySoap ? (
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Need a draft quickly?</p>
                <p className="text-xs text-muted-foreground">Generate a SOAP note using AI based on your visit summary.</p>
              </div>
              <Button onClick={() => setShowAIGenerator((prev) => !prev)} type="button" variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate Note
              </Button>
            </div>

            {showAIGenerator ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="visit_summary">
                  Briefly describe the visit
                </label>
                <Textarea
                  id="visit_summary"
                  onChange={(event) => setVisitSummary(event.target.value)}
                  placeholder="e.g. Patient reports persistent headaches for 2 weeks, worse in mornings..."
                  rows={3}
                  value={visitSummary}
                />
                <Button
                  disabled={isGenerating}
                  onClick={async () => {
                    setIsGenerating(true);
                    const result = await generateSOAPNote(appointmentType, visitSummary);
                    setIsGenerating(false);
                    if (!result.success || !result.data) {
                      toast.error(result.error ?? "AI generation failed. Please try again.");
                      return;
                    }
                    form.setValue("subjective", result.data.subjective, { shouldDirty: true });
                    form.setValue("objective", result.data.objective, { shouldDirty: true });
                    form.setValue("assessment", result.data.assessment, { shouldDirty: true });
                    form.setValue("plan", result.data.plan, { shouldDirty: true });
                    setIsAIGenerated(true);
                    setShowAIGenerator(false);
                    toast.success("AI note generated — review before saving");
                  }}
                  type="button"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="subjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjective (required)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objective</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assessment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessment</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message ? (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        ) : null}

        <div className="flex items-center gap-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Note"}
          </Button>
          {existingNote ? (
            <Button
              disabled={form.formState.isSubmitting}
              onClick={() => setIsEditing(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
