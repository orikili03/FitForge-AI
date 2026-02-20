import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  movementConstraints: string[];
  injuryFlags: string[];
}

export function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (update: Partial<Profile>) => {
      const res = await apiClient.put("/users/me", update);
      return res.data.data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const { register, handleSubmit, reset } = useForm<{
    fitnessLevel: "beginner" | "intermediate" | "advanced";
    goals: string;
    movementConstraints: string;
    injuryFlags: string;
  }>({
    values: profileQuery.data
      ? {
          fitnessLevel: profileQuery.data.fitnessLevel,
          goals: profileQuery.data.goals.join(", "),
          movementConstraints: profileQuery.data.movementConstraints.join(", "),
          injuryFlags: profileQuery.data.injuryFlags.join(", "),
        }
      : undefined,
  });

  const onSubmit = (values: any) => {
    mutation.mutate({
      fitnessLevel: values.fitnessLevel,
      goals: values.goals ? values.goals.split(",").map((v: string) => v.trim()) : [],
      movementConstraints: values.movementConstraints
        ? values.movementConstraints.split(",").map((v: string) => v.trim())
        : [],
      injuryFlags: values.injuryFlags
        ? values.injuryFlags.split(",").map((v: string) => v.trim())
        : [],
    } as any);
  };

  const handleReset = () => {
    if (profileQuery.data) {
      reset({
        fitnessLevel: profileQuery.data.fitnessLevel,
        goals: profileQuery.data.goals.join(", "),
        movementConstraints: profileQuery.data.movementConstraints.join(", "),
        injuryFlags: profileQuery.data.injuryFlags.join(", "),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ds-text">Profile</h1>
        <p className="text-sm text-ds-text-muted">
          Update your capabilities and constraints. Equipment is managed in its own dedicated tab.
        </p>
      </div>
      <div className="card">
        {profileQuery.isLoading && <p className="text-sm text-ds-text-muted">Loading...</p>}
        {profileQuery.data && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
            <div>
              <label className="block mb-1">Email</label>
              <input
                disabled
                className="w-full rounded-md bg-ds-surface-subtle border border-ds-border px-3 py-2 text-xs text-ds-text-muted"
                value={profileQuery.data.email}
              />
            </div>
            <div>
              <label className="block mb-1">Fitness level</label>
              <select
                className="w-full rounded-md bg-ds-surface-subtle border border-ds-border rounded-[20px] text-ds-text px-3 py-2"
                {...register("fitnessLevel")}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Goals</label>
              <input
                className="w-full rounded-md bg-ds-surface-subtle border border-ds-border rounded-[20px] text-ds-text px-3 py-2"
                {...register("goals")}
              />
              <p className="text-xs text-ds-text-muted mt-1">Comma separated: strength, engine, gymnastics...</p>
            </div>
            <div>
              <label className="block mb-1">Equipment</label>
              <div className="text-xs text-ds-text-muted">
                Manage equipment in the{" "}
                <Link to="/equipment" className="text-brand hover:text-brand-dark">
                  Equipment tab
                </Link>
                .
              </div>
            </div>
            <div>
              <label className="block mb-1">Movement constraints</label>
              <input
                className="w-full rounded-md bg-ds-surface-subtle border border-ds-border rounded-[20px] text-ds-text px-3 py-2"
                {...register("movementConstraints")}
              />
            </div>
            <div>
              <label className="block mb-1">Injury flags</label>
              <input
                className="w-full rounded-md bg-ds-surface-subtle border border-ds-border rounded-[20px] text-ds-text px-3 py-2"
                {...register("injuryFlags")}
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-ds-text-muted hover:text-ds-text"
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

