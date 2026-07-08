import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, CardSkeleton } from "../../../components/DashboardUI";
import { Button, Card, Input, Textarea } from "../../../components/ui";
import { vendorService } from "../../../services/vendorService";

const profileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  storeName: z.string().min(1, "Store name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  phone: z.string().min(10, "Valid mobile number required"),
  businessAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  gstNumber: z.string().optional(),
  fssaiNumber: z.string().optional(),
  businessDescription: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000";

const imgUrl = (path?: string | null) =>
  path ? (path.startsWith("http") ? path : `${BASE}${path}`) : undefined;

export const VendorProfile = () => {
  const queryClient = useQueryClient();
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["vendor", "profile"],
    queryFn: vendorService.getProfile,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          businessName: profile.businessName ?? "",
          storeName: profile.storeName ?? "",
          ownerName: profile.name ?? "",
          phone: profile.phone ?? "",
          businessAddress: profile.businessAddress ?? "",
          city: profile.city ?? "",
          state: profile.state ?? "",
          pincode: profile.pincode ?? "",
          gstNumber: profile.gstNumber ?? "",
          fssaiNumber: profile.fssaiNumber ?? "",
          businessDescription: profile.businessDescription ?? "",
        }
      : undefined,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await vendorService.updateProfile({
        businessName: values.businessName,
        storeName: values.storeName,
        ownerName: values.ownerName,
        phone: values.phone,
        businessAddress: values.businessAddress,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        gstNumber: values.gstNumber ?? "",
        fssaiNumber: values.fssaiNumber ?? "",
        businessDescription: values.businessDescription ?? "",
      });
      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
    } catch {
      // interceptor shows error
    }
  });

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      setLogoPreview(URL.createObjectURL(file));
      await vendorService.uploadLogo(file);
      toast.success("Shop logo updated!");
      await queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
    } catch {
      setLogoPreview(undefined);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      setCoverPreview(URL.createObjectURL(file));
      await vendorService.uploadCover(file);
      toast.success("Cover image updated!");
      await queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
    } catch {
      setCoverPreview(undefined);
    } finally {
      setUploadingCover(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vendor Profile" subtitle="Loading your profile..." />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const currentLogo = logoPreview ?? imgUrl(profile?.shopLogo);
  const currentCover = coverPreview ?? imgUrl(profile?.coverImage);

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Profile" subtitle="Manage your store information, branding, and business details." />

      {/* Cover + Logo */}
      <Card className="overflow-hidden p-0">
        <div className="relative h-40 w-full bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40">
          {currentCover && (
            <img src={currentCover} alt="Cover" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={uploadingCover}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70"
          >
            <Camera className="h-3.5 w-3.5" />
            {uploadingCover ? "Uploading..." : "Change cover"}
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f); }}
          />
        </div>
        <div className="flex items-end gap-4 px-6 pb-5">
          <div className="relative -mt-10">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-primary-100 dark:border-ink-900">
              {currentLogo
                ? <img src={currentLogo} alt="Logo" className="h-full w-full object-cover" />
                : <div className="grid h-full w-full place-items-center text-2xl font-black text-primary-600">{profile?.storeName?.slice(0, 1) ?? "S"}</div>
              }
            </div>
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleLogoUpload(f); }}
            />
          </div>
          <div className="pb-1">
            <p className="font-black text-ink-950 dark:text-white">{profile?.storeName ?? "Your Store"}</p>
            <p className="text-sm muted-copy">{profile?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <form onSubmit={onSubmit}>
        <Card className="p-6">
          <h2 className="mb-5 font-black text-ink-950 dark:text-white">Business Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business Name" error={errors.businessName?.message}>
              <Input {...register("businessName")} placeholder="e.g. Fresh Farms Pvt Ltd" />
            </Field>
            <Field label="Store Name" error={errors.storeName?.message}>
              <Input {...register("storeName")} placeholder="e.g. Fresh Farms Store" />
            </Field>
            <Field label="Owner Name" error={errors.ownerName?.message}>
              <Input {...register("ownerName")} placeholder="Full name" />
            </Field>
            <Field label="Mobile Number" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="10-digit mobile number" />
            </Field>
            <Field label="Email" error={undefined}>
              <Input value={profile?.email ?? ""} disabled className="bg-ink-100 dark:bg-ink-800" />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input {...register("city")} placeholder="City" />
            </Field>
            <Field label="State" error={errors.state?.message}>
              <Input {...register("state")} placeholder="State" />
            </Field>
            <Field label="Pincode" error={errors.pincode?.message}>
              <Input {...register("pincode")} placeholder="6-digit pincode" maxLength={6} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" error={errors.businessAddress?.message}>
                <Input {...register("businessAddress")} placeholder="Street address" />
              </Field>
            </div>
            <Field label="GST Number (Optional)" error={undefined}>
              <Input {...register("gstNumber")} placeholder="e.g. 22AAAAA0000A1Z5" />
            </Field>
            <Field label="FSSAI License Number (Optional)" error={undefined}>
              <Input {...register("fssaiNumber")} placeholder="14-digit FSSAI number" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Business Description (Optional)" error={undefined}>
                <Textarea {...register("businessDescription")} placeholder="Describe your store, products, and specialties..." />
              </Field>
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </Card>
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
