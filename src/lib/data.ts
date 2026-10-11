export const SPECIALTIES = [
  "General practice",
  "Pediatrics",
  "Dentistry",
  "OB-GYN",
  "Dermatology",
  "Cardiology",
];

export const SEARCHABLE_CONDITIONS = [
  { label: "Malaria", query: "malaria" },
  { label: "Typhoid", query: "typhoid" },
  { label: "Antenatal care", query: "antenatal" },
  { label: "Toothache", query: "dentist" },
  { label: "Skin rash", query: "rash" },
  { label: "Eye exam", query: "eye" },
];

export const formatPrice = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

export type DemoDoctor = {
  id: string;
  name: string;
  specialty: string;
  clinicName: string;
  city: string;
  rating: number;
  reviewCount: number;
  price: number;
  initials: string;
  color: string;
  bio: string;
  slots: { id: string; startsAt: Date }[];
};

export function getDemoDoctors(): DemoDoctor[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const records = [
    {
      id: "demo-amaka-chukwu",
      name: "Dr. Amaka Chukwu",
      specialty: "General practice",
      clinicName: "Rumuola Family Clinic",
      city: "Port Harcourt",
      rating: 4.9,
      reviewCount: 312,
      price: 8000,
      initials: "AC",
      color: "#1F5C4A",
      bio: "Dr. Chukwu has run general practice at Rumuola Family Clinic for nine years, seeing everything from malaria and typhoid to routine checkups and referrals.",
    },
    {
      id: "demo-tunde-balogun",
      name: "Dr. Tunde Balogun",
      specialty: "Dentistry",
      clinicName: "Brightsmile Dental, GRA",
      city: "Port Harcourt",
      rating: 4.8,
      reviewCount: 201,
      price: 15000,
      initials: "TB",
      color: "#C85A24",
      bio: "Dr. Balogun trained in Lagos and now runs Brightsmile Dental in GRA, focused on fillings, extractions, and teeth whitening.",
    },
    {
      id: "demo-ngozi-eze",
      name: "Dr. Ngozi Eze",
      specialty: "OB-GYN",
      clinicName: "Wellwoman Clinic, Rumuokwuta",
      city: "Port Harcourt",
      rating: 5,
      reviewCount: 178,
      price: 12000,
      initials: "NE",
      color: "#8B5E3C",
      bio: "Dr. Eze specializes in prenatal care and women's health, with a focus on making first-time pregnancies feel less overwhelming.",
    },
  ];

  return records.map((doctor, index) => ({
    ...doctor,
    slots: [0, 1, 2].map((slotIndex) => {
      const startsAt = new Date(tomorrow);
      startsAt.setDate(startsAt.getDate() + Math.floor((slotIndex + index) / 2));
      startsAt.setHours(9 + ((slotIndex + index) % 2) * 3, 0, 0, 0);
      return { id: `${doctor.id}-slot-${slotIndex}`, startsAt };
    }),
  }));
}
