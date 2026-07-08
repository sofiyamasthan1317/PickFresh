import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { PageHeader, CardSkeleton } from "../../../components/DashboardUI";
import { Button, Card, Input, Textarea } from "../../../components/ui";
import { adminService } from "../../../services/adminService";

const settingsSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  supportEmail: z.string().email("Valid email required"),
  supportPhone: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  deliveryCharge: z.coerce.number().min(0, "Must be >= 0"),
  minimumOrderAmount: z.coerce.number().min(0, "Must be >= 0"),
  platformCommission: z.coerce.number().min(0).max(100, "Must be 0-100"),
  taxPercentage: z.coerce.number().min(0).max(100, "Must be 0-100"),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  allowVendorRegistration: z.boolean(),
  allowCustomerRegistration: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export const AdminSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminService.getSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema as any),
    defaultValues: {
      platformName: "",
      supportEmail: "",
      supportPhone: "",
      currency: "INR",
      deliveryCharge: 40,
      minimumOrderAmount: 100,
      platformCommission: 10,
      taxPercentage: 5,
      maintenanceMode: false,
      maintenanceMessage: "",
      allowVendorRegistration: true,
      allowCustomerRegistration: true,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        platformName: settings.platformName ?? "",
        supportEmail: settings.supportEmail ?? "",
        supportPhone: settings.supportPhone ?? "",
        currency: settings.currency ?? "INR",
        deliveryCharge: settings.deliveryCharge ?? 40,
        minimumOrderAmount: settings.minimumOrderAmount ?? 100,
        platformCommission: settings.platformCommission ?? 10,
        taxPercentage: settings.taxPercentage ?? 5,
        maintenanceMode: settings.maintenanceMode ?? false,
        maintenanceMessage: settings.maintenanceMessage ?? "",
        allowVendorRegistration: settings.allowVendorRegistration ?? true,
        allowCustomerRegistration: settings.allowCustomerRegistration ?? true,
      });
    }
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminService.updateSettings(values);
      toast.success("Platform settings saved!");
      await queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    } catch {
      // interceptor shows error
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Settings" subtitle="Loading settings..." />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const maintenanceMode = watch("maintenanceMode");
  const allowVendor = watch("allowVendorRegistration");
  const allowCustomer = watch("allowCustomerRegistration");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        subtitle="Configure platform-wide settings, fees, registration controls, and maintenance mode."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* General */}
        <Card className="p-6">
          <h2 className="mb-5 font-black text-ink-950 dark:text-white">General</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform Name" error={errors.platformName?.message}>
              <Input {...register("platformName")} placeholder="PickFresh" />
            </Field>
            <Field label="Currency" error={errors.currency?.message}>
              <Input {...register("currency")} placeholder="INR" />
            </Field>
            <Field label="Support Email" error={errors.supportEmail?.message}>
              <Input {...register("supportEmail")} type="email" placeholder="support@pickfresh.local" />
            </Field>
            <Field label="Support Phone" error={undefined}>
              <Input {...register("supportPhone")} placeholder="+91 XXXXX XXXXX" />
            </Field>
          </div>
        </Card>

        {/* Fees & Charges */}
        <Card className="p-6">
          <h2 className="mb-5 font-black text-ink-950 dark:text-white">Fees & Charges</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Delivery Charge (₹)" error={errors.deliveryCharge?.message}>
              <Input {...register("deliveryCharge")} type="number" min={0} step={0.01} />
            </Field>
            <Field label="Minimum Order Amount (₹)" error={errors.minimumOrderAmount?.message}>
              <Input {...register("minimumOrderAmount")} type="number" min={0} step={0.01} />
            </Field>
            <Field label="Platform Commission (%)" error={errors.platformCommission?.message}>
              <Input {...register("platformCommission")} type="number" min={0} max={100} step={0.01} />
            </Field>
            <Field label="Tax Percentage (%)" error={errors.taxPercentage?.message}>
              <Input {...register("taxPercentage")} type="number" min={0} max={100} step={0.01} />
            </Field>
          </div>
        </Card>

        {/* Registration Controls */}
        <Card className="p-6">
          <h2 className="mb-5 font-black text-ink-950 dark:text-white">Registration Controls</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle
              label="Allow Vendor Registration"
              description="New vendors can register on the platform"
              enabled={allowVendor}
              onChange={(v) => setValue("allowVendorRegistration", v)}
            />
            <Toggle
              label="Allow Customer Registration"
              description="New customers can create accounts"
              enabled={allowCustomer}
              onChange={(v) => setValue("allowCustomerRegistration", v)}
            />
          </div>
        </Card>

        {/* Maintenance Mode */}
        <Card className="p-6">
          <h2 className="mb-5 font-black text-ink-950 dark:text-white">Maintenance Mode</h2>
          <div className="space-y-4">
            <Toggle
              label="Enable Maintenance Mode"
              description="Show maintenance page to all users"
              enabled={maintenanceMode}
              onChange={(v) => setValue("maintenanceMode", v)}
              danger
            />
            {maintenanceMode && (
              <Field label="Maintenance Message" error={undefined}>
                <Textarea
                  {...register("maintenanceMessage")}
                  placeholder="We are under maintenance. Please check back soon."
                />
              </Field>
            )}
          </div>
        </Card>

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-ink-500 dark:text-ink-100/60">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const Toggle = ({
  label,
  description,
  enabled,
  onChange,
  danger = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-200 p-4 dark:border-white/10">
    <div>
      <p className="text-sm font-semibold text-ink-950 dark:text-white">{label}</p>
      <p className="text-xs muted-copy">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled
          ? danger
            ? "bg-red-500"
            : "bg-primary-600"
          : "bg-ink-200 dark:bg-white/20"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);
