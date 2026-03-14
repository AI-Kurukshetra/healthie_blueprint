"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createClinicalNote, updateClinicalNote } from "@/app/(dashboard)/provider/appointments/actions";
import { generateSOAPNote } from "@/app/(dashboard)/provider/appointments/ai-actions";
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

function generateTemplate(appointmentType: AppointmentType, summary: string) {
  const context = summary.trim() || "Virtual care follow-up visit.";

  if (appointmentType === "initial") {
    return {
      subjective: `Patient presents for initial evaluation. ${context}\nPatient reports symptom onset over recent weeks with impact on daily function. No acute red-flag symptoms reported during visit.`,
      objective:
        "Telehealth assessment completed. Patient alert and oriented, speaking in full sentences, no visible respiratory distress. Available home vitals reviewed where provided.",
      assessment:
        "Initial clinical assessment suggests a stable chronic/acute condition requiring structured care plan, baseline workup, and symptom monitoring.",
      plan:
        "1) Establish baseline labs/diagnostic review as indicated.\n2) Start conservative first-line management and lifestyle guidance.\n3) Return precautions reviewed.\n4) Follow-up in 2-4 weeks.",
    };
  }

  if (appointmentType === "follow_up") {
    return {
      subjective: `Patient seen for follow-up visit. ${context}\nPatient reports interval change since last encounter and discusses adherence/tolerance with current plan.`,
      objective:
        "Follow-up telehealth assessment completed. Overall appearance stable from prior visit. Relevant symptom trend and available home monitoring values reviewed.",
      assessment:
        "Condition demonstrates partial improvement but remains under active management. No urgent escalation indicators identified at this time.",
      plan:
        "1) Continue current regimen with minor adjustments as discussed.\n2) Reinforce adherence and self-monitoring.\n3) Repeat targeted testing only if symptoms persist/worsen.\n4) Follow-up in 2-6 weeks.",
    };
  }

  return {
    subjective: `Consultation visit completed. ${context}\nPatient seeking specialist guidance regarding diagnosis and treatment options.`,
    objective:
      "Consultative review performed via telehealth. Prior records, current symptoms, and medication history discussed. No immediate instability observed.",
    assessment:
      "Consultation supports a focused differential and management pathway. Findings are consistent with a non-emergent course requiring coordinated follow-through.",
    plan:
      "1) Provide consultation recommendations to primary care team.\n2) Initiate or adjust targeted therapy as appropriate.\n3) Educate patient on warning signs and escalation criteria.\n4) Schedule specialist follow-up as needed.",
  };
}

export function ClinicalNoteEditor({ appointmentId, appointmentType, existingNote, patientId }: ClinicalNoteEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!existingNote);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [visitSummary, setVisitSummary] = useState("");
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
        {isEmptySoap ? (
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Need a draft quickly?</p>
                <p className="text-xs text-muted-foreground">Generate a SOAP template based on appointment type.</p>
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
                  placeholder="Briefly describe the visit..."
                  rows={3}
                  value={visitSummary}
                />
                <Button
                  disabled={isGenerating}
                  onClick={async () => {
                    setIsGenerating(true);
                    const result = await generateSOAPNote(appointmentType, visitSummary);
                    setIsGenerating(false);

                    if (result.success && result.data) {
                      form.setValue("subjective", result.data.subjective, { shouldDirty: true });
                      form.setValue("objective", result.data.objective, { shouldDirty: true });
                      form.setValue("assessment", result.data.assessment, { shouldDirty: true });
                      form.setValue("plan", result.data.plan, { shouldDirty: true });
                    } else {
                      const template = generateTemplate(appointmentType, visitSummary);
                      form.setValue("subjective", template.subjective, { shouldDirty: true });
                      form.setValue("objective", template.objective, { shouldDirty: true });
                      form.setValue("assessment", template.assessment, { shouldDirty: true });
                      form.setValue("plan", template.plan, { shouldDirty: true });
                      toast.warning("AI unavailable — used template instead");
                    }
                    setShowAIGenerator(false);
                  }}
                  type="button"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
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
