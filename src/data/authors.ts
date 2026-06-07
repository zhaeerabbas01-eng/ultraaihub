import founderPhoto from "@/assets/founder-usman.png.asset.json";

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  email?: string;
  initials: string;
  image?: string;
}

export const authors: Author[] = [
  {
    slug: "usman-zaheer",
    name: "Muhammad Usman Zaheer",
    role: "Founder & Editor-in-Chief",
    bio: "Muhammad Usman Zaheer is the founder of MUTECH BAAR and editor-in-chief of Ultra Media AI Hub. With years of hands-on experience building creator tools, AI workflows, and content systems, he leads product direction, editorial standards, and quality assurance across every guide and tool published on the platform.",
    expertise: [
      "AI Tools & Workflow Automation",
      "YouTube Growth & Monetization",
      "Image & Video Processing",
      "Technical SEO & EEAT",
      "Product & UX Design",
    ],
    email: "zhaeerabbas01@gmail.com",
    initials: "UZ",
    image: founderPhoto.url,
  },
  {
    slug: "editorial-team",
    name: "Ultra Media AI Hub Editorial Team",
    role: "Editors, Researchers & Fact-checkers",
    bio: "Our editorial team reviews every article published on Ultra Media AI Hub. Each guide is researched, drafted by domain practitioners, fact-checked against primary sources, and re-reviewed every 90 days to keep information accurate and up to date.",
    expertise: ["Content Research", "Fact Checking", "Editorial Review", "Accessibility & Readability"],
    initials: "ET",
  },
];

export function getAuthor(slug: string) {
  return authors.find(a => a.slug === slug) ?? authors[0];
}
