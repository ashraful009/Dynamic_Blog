"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthWrapper } from "@/components/ui/AuthWrapper";

export default function UserLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, hydrate } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      const user = data.data.user;
      setAuth(user);
      toast.success("Welcome back! 🎉");
      if (user.role === "ADMIN") {
        router.push("/zibon/dashboard");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title={
        <>
          Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Back</span>
        </>
      }
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkText="Register here"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
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
        
        <Button type="submit" isLoading={isLoading} loadingText="Signing in..." className="w-full">
          Sign In
        </Button>
      </form>
    </AuthWrapper>
  );
}
