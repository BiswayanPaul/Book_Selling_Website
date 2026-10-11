export const SETTINGS_ID = 1;

export type SiteContent = {
  storeName: string;
  storeTagline: string;
  headerNote: string;
  bookEdition: string;
  bookTitle: string;
  bookTitleHighlight: string;
  bookDescription: string;
  authors: string;
  coverImageUrl: string;
  highlightsEyebrow: string;
  highlightsHeading: string;
  audienceEyebrow: string;
  audienceHeading: string;
  audienceTags: string[];
  footerTagline: string;
};

// Used until an admin saves the content page for the first time.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  storeName: "Your Store Name",
  storeTagline: "Medical Books & Resources",
  headerNote: "Secure Online Purchase",
  bookEdition: "2025 Edition",
  bookTitle: "All-in-One Quick",
  bookTitleHighlight: "Medical Review",
  bookDescription:
    "A quick-revision medical review book designed for nurses, medical and paramedical students, with high-yield topics, mnemonics and exam-focused revision.",
  authors: "Dr. Debjit Sarkar · Dr. Subir Dutta · Poli Paul · Mahananda Paul",
  coverImageUrl: "/images/book-cover.png",
  highlightsEyebrow: "What's inside",
  highlightsHeading: "One Book. Every Topic.",
  audienceEyebrow: "Suitable for",
  audienceHeading: "Students & Competitive Exams",
  audienceTags: [
    "MBBS",
    "B.Sc. Nursing",
    "A.N.M.",
    "G.N.M.",
    "Paramedical",
    "Pharmacist",
    "AYUSH",
  ],
  footerTagline: "Trusted by Students. Recommended by Educators.",
};
