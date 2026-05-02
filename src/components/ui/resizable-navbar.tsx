"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-4 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(8px)",
        boxShadow: visible
          ? "0 1px 2px rgba(10, 10, 10, 0.04), 0 8px 24px rgba(10, 10, 10, 0.06)"
          : "0 1px 2px rgba(10, 10, 10, 0.03)",
        width: visible ? "min(820px, 92%)" : "min(960px, 92%)",
        y: visible ? 6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 40,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full border border-black/[0.06] bg-white/80 px-3 py-2 lg:flex",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-[14px] text-neutral-700 transition duration-200 lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative rounded-full px-4 py-2 text-neutral-700 transition-colors hover:text-neutral-950"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-neutral-900/[0.05]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(8px)",
        boxShadow: visible
          ? "0 1px 2px rgba(10, 10, 10, 0.04), 0 8px 24px rgba(10, 10, 10, 0.06)"
          : "0 1px 2px rgba(10, 10, 10, 0.03)",
        width: visible ? "92%" : "calc(100% - 1.5rem)",
        borderRadius: visible ? "1.25rem" : "1.5rem",
        y: visible ? 6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 40,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between border border-black/[0.06] bg-white/80 px-4 py-2.5 lg:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-3 rounded-2xl border border-black/[0.06] bg-white/95 px-5 py-6 shadow-[0_8px_32px_rgba(10,10,10,0.08)] backdrop-blur-md",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="h-5 w-5 text-neutral-900 cursor-pointer" onClick={onClick} />
  ) : (
    <IconMenu2 className="h-5 w-5 text-neutral-900 cursor-pointer" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center gap-2 px-2 py-1 text-sm font-normal"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 via-pink-300 to-amber-300" />
        <span className="absolute inset-[3px] rounded-full bg-white" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Intelbase</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & React.ComponentPropsWithoutRef<"a">) => {
  const baseStyles =
    "px-4 py-2 rounded-full text-[13.5px] font-medium relative cursor-pointer transition-all duration-200 inline-flex items-center justify-center";

  const variantStyles = {
    primary:
      "bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_1px_2px_rgba(10,10,10,0.1),0_4px_12px_rgba(10,10,10,0.08)]",
    secondary: "bg-transparent text-neutral-900 hover:bg-neutral-900/[0.05]",
    dark: "bg-neutral-950 text-white hover:bg-neutral-800",
    gradient:
      "bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 text-white",
  };

  return (
    <a
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </a>
  );
};
