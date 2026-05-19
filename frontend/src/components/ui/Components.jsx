import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
        primary: "bg-white text-black hover:bg-white/90 shadow-lg font-bold rounded-[6px]",
        secondary: "bg-[#1F1F1F] text-white border border-[#1F1F1F] hover:bg-[#2a2a2a] rounded-[6px]",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-[6px]",
        outline: "border border-[#1F1F1F] bg-transparent hover:bg-white/5 text-white rounded-[6px]",
        ghost: "hover:bg-white/5 text-[#A3A3A3] hover:text-white rounded-[6px] transition-colors",
        link: "text-[#F25623] underline-offset-4 hover:underline font-semibold",
    };

    const sizes = {
        default: "h-11 px-6 py-2 text-[13px] tracking-tight",
        sm: "h-8 px-4 rounded-[4px] text-xs",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-11 w-11 rounded-[6px]",
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F25623] disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";

export const Card = ({ className, children, ...props }) => (
    <div className={cn("rounded-xl border border-[#1F1F1F] bg-[#0A0A0A]/80 text-[#FFFFFF] backdrop-blur-xl", className)} {...props}>
        {children}
    </div>
);

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-[6px] border border-[#1F1F1F] bg-[#050505] px-4 py-2 text-sm transition-all placeholder:text-[#4D4D4D] text-white focus:border-[#F25623]/50 outline-none",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export const Badge = ({ className, variant = 'default', ...props }) => {
    const variants = {
        default: "bg-[#F25623]/10 text-[#F25623] border-[#F25623]/20",
        secondary: "bg-[#1F1F1F] text-[#A3A3A3] border-[#1F1F1F]",
        outline: "text-[#4D4D4D] border-[#1F1F1F]",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return (
        <div className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors", variants[variant], className)} {...props} />
    );
};

export const Skeleton = ({ className, ...props }) => {
    return (
        <div className={cn("animate-pulse rounded-md bg-white/5", className)} {...props} />
    );
};
