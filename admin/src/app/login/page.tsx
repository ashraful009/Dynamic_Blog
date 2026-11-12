"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      const loggedUser = data.data.user;
      if (loggedUser.role !== "ADMIN") {
        toast.error("Unauthorized access. Admin credentials required.");
        return;
      }
      setAuth(loggedUser);
      toast.success("Welcome back, Admin!");
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Invalid email or password.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-[60px] px-5 flex items-center justify-center min-h-screen bg-bg">
      <div className="bg-bg-elevated/50 backdrop-blur-md border border-border rounded-2xl shadow-glass w-full max-w-[440px] p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-primary">
            <Shield size={28} color="white" />
          </div>
          <h1 className="text-[26px] font-extrabold font-display mb-2 text-text">
            Admin Portal
          </h1>
          <p className="text-sm text-text-muted">
            Sign in with your administrator credentials
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            id="admin-login-email"
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="admin-login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            containerClassName="mb-7"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Authenticating..."
            className="w-full"
          >
            Sign In to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}

