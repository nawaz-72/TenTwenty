"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";

// Form validation schema with descriptive errors
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/timesheet",
        email: data.email,
        password: data.password
      });

      if (!result?.ok) {
        setErrorMsg("Invalid email or password. Try admin@ticktock.com / Password123!");
        setIsLoading(false);
      } else {
        window.location.assign("/timesheet");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* Left side: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo shown on mobile only */}
          <div className="lg:hidden mb-8 flex items-center justify-start">
            <span className="text-3xl font-black tracking-tight text-blue-600">ticktock</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Please log in to manage your timesheets.
          </p>

          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="name@example.com"
                className={`block w-full rounded-lg border px-4 py-3 text-sm text-slate-900 shadow-xs transition duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden ${
                  errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                type="password"
                placeholder="••••••••••••"
                className={`block w-full rounded-lg border px-4 py-3 text-sm text-slate-900 shadow-xs transition duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden ${
                  errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"
                }`}
              />
              {errors.password && (
                <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm text-slate-500 select-none">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Quick login helper info */}
          <div className="mt-8 rounded-lg bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-1">Testing Credentials:</h4>
            <p className="text-xs text-slate-500">Email: <span className="font-mono font-medium text-slate-700">admin@ticktock.com</span></p>
            <p className="text-xs text-slate-500">Password: <span className="font-mono font-medium text-slate-700">Password123!</span></p>
          </div>
        </div>
      </div>

      {/* Right side: Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-blue-600 px-12 text-white relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6">
            ticktock
          </h1>
          <p className="text-lg leading-relaxed text-blue-100 font-light">
            Introducing ticktock, our cutting-edge timesheet web application designed to
            revolutionize how you manage employee work hours. With ticktock, you
            can effortlessly track and monitor employee attendance and productivity
            from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
