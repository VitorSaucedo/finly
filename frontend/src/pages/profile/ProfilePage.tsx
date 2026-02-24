import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { User, Lock, Trash2, CheckCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileError(null);
      await userService.update({
        name: data.name,
        email: data.email,
        password: "",
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError("Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordError(null);
      await userService.update({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: data.password,
      });
      resetPassword();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError("Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await userService.delete();
      signOut();
      navigate("/login");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {user?.name}
            </p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <User size={15} className="text-gray-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">
            Personal Information
          </h3>
        </div>

        {profileError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {profileError}
          </div>
        )}

        {profileSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg px-4 py-3 mb-4 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Profile updated successfully
          </div>
        )}

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <Input
            label="Name"
            placeholder="John Doe"
            error={profileErrors.name?.message}
            {...registerProfile("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@email.com"
            error={profileErrors.email?.message}
            {...registerProfile("email")}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={profileSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Password form */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <Lock size={15} className="text-gray-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">
            Change Password
          </h3>
        </div>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg px-4 py-3 mb-4 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Password updated successfully
          </div>
        )}

        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.password?.message}
            {...registerPassword("password")}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword("confirmPassword")}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={passwordSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-red-50 rounded-lg">
            <Trash2 size={15} className="text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Danger Zone</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete Account
        </Button>
      </Card>

      {/* Confirm delete */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your data including transactions, accounts, budgets and goals will be lost forever."
        confirmLabel="Delete Account"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProfilePage;
