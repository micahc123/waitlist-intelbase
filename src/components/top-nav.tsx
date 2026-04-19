"use client";

import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Services", link: "/#services" },
  { name: "Pricing", link: "/#pricing" },
  { name: "Showcase", link: "/showcase" },
  { name: "Courses", link: "/courses", hidden: true },
  { name: "Contact", link: "/#contact" },
];

const visibleNavItems = navItems.filter((item) => !item.hidden);

export function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={visibleNavItems} />
          <div className="flex items-center gap-4">
            <NavbarButton href="https://cal.com/intelbase/discovery-call" target="_blank" rel="noopener noreferrer" variant="primary">
              Free Discovery Call
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {visibleNavItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-400 hover:text-white"
              >
                {item.name}
              </a>
            ))}
            <NavbarButton
              href="https://cal.com/intelbase/discovery-call" target="_blank" rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              className="w-full"
            >
              Free Discovery Call
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
