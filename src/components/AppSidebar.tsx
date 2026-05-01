import { Home, Music, Image, Maximize, Minimize2, Wand2, Shield, Building2, BookOpen, Mail, HelpCircle, AlertTriangle, Cookie, ShieldCheck, Play, FileText, Tag, DollarSign, Calculator } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import logoImg from "@/assets/logo.png";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "YT Video Extractor", url: "/video-downloader", icon: Play },
  { title: "Audio Converter", url: "/audio-converter", icon: Music },
  { title: "Image Tools", url: "/image-tools", icon: Image },
  { title: "AI Upscaler", url: "/upscaler", icon: Maximize },
  { title: "Compressor", url: "/compressor", icon: Minimize2 },
  { title: "AI Thumbnail", url: "/thumbnail-generator", icon: Wand2 },
  { title: "YT Tag Extractor", url: "/yt-tag-extractor", icon: Tag },
  { title: "Monetization Checker", url: "/yt-monetization-checker", icon: DollarSign },
  { title: "Earnings Calculator", url: "/yt-earnings-calculator", icon: Calculator },
  { title: "BG Remover", url: "/bg-remover", icon: Image },
];

const companyItems = [
  { title: "About Us", url: "/about", icon: Building2 },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "Contact", url: "/contact", icon: Mail },
  { title: "Help Center", url: "/help", icon: HelpCircle },
];

const legalItems = [
  { title: "Privacy Policy", url: "/privacy", icon: Shield },
  { title: "Terms of Service", url: "/terms", icon: FileText },
  { title: "Cookie Policy", url: "/cookies", icon: Cookie },
  { title: "GDPR", url: "/gdpr", icon: ShieldCheck },
  { title: "Disclaimer", url: "/disclaimer", icon: AlertTriangle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink to={item.url} end className="transition-all duration-200" activeClassName="bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Ultra Media AI Hub" className="h-8 w-8 rounded-lg flex-shrink-0 object-cover" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-xs gradient-text leading-tight">ULTRA MEDIA</span>
              <span className="font-display font-bold text-[10px] text-muted-foreground leading-tight">AI HUB</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Tools", mainItems)}
        {renderGroup("Company", companyItems)}
        {renderGroup("Legal", legalItems)}
      </SidebarContent>
      {!collapsed && (
        <div className="p-4 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/50 text-center">MUTECH BAAR v2.0</p>
        </div>
      )}
    </Sidebar>
  );
}
