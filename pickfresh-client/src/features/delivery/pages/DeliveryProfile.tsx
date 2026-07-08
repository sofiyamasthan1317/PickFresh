import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { deliveryService } from "../../../services/deliveryService";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";
import { PageHeader } from "../../../components/DashboardUI";
import { Button, Card, Input, Select, Avatar } from "../../../components/ui";

export const DeliveryProfile = () => {
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { vehicleType: "bike", vehicleNumber: "", phone: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => deliveryService.updateProfile(data),
    onSuccess: () => toast.success("Profile updated successfully"),
  });

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Driver Profile" subtitle="Update your vehicle details and contact information." />
      <Card className="p-6 border border-ink-200/60 dark:border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name ?? "D"} src={user?.avatar} />
          <div>
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm muted-copy">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Phone Number</label>
            <Input {...register("phone")} placeholder="+91 XXXXXXXXXX" />
          </div>
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Vehicle Type</label>
            <Select
              value={watch("vehicleType")}
              onValueChange={(v) => setValue("vehicleType", v)}
              options={["bike", "scooter", "bicycle", "car"]}
              placeholder="Select vehicle type"
            />
          </div>
          <div>
            <label className="text-xs font-semibold muted-copy block mb-1">Vehicle Number Plate</label>
            <Input {...register("vehicleNumber")} placeholder="e.g. MH 12 AB 1234" className="uppercase" />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
