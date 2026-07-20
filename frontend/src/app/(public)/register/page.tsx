"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthWrapper } from "@/components/ui/AuthWrapper";

export default function UserRegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, hydrate } = useAuthStore();
  const [name, setName] = useState("");
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
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await authApi.register({ name, email, password });
      setAuth(data.data.user);
      toast.success("Registration successful! 🎉");
      router.push("/");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title={
        <>
          Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ZibonVlog</span>
        </>
      }
      subtitle="Create an account to get started"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit}>
        <Input
          id="register-name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          id="register-email"
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          id="register-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Choose a secure password"
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
        
        <Button type="submit" isLoading={isLoading} loadingText="Creating account..." className="w-full">
          Sign Up
        </Button>
      </form>
    </AuthWrapper>
  );
}
