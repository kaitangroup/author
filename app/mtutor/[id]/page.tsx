// app/mtutor/[id]/page.tsx
import React from "react";

type Tutor = {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  degree?: string;
  hourly_rate?: string;
  subjects?: string;
  education?: string;
  languages?: string;
  location_city_state?: string;
};

export default async function TutorPage({ params }: { params: { id: string } }) {
  const base = (process.env.NEXT_PUBLIC_WP_URL ?? "").replace(/\/+$/, "");

  const res = await fetch(`${base}/wp-json/authorpro/v1/users`, {
    cache: "no-store",
  });

  const json = await res.json();
  const tutors: Tutor[] = json.users ?? [];

  // id দিয়ে খুঁজো
  const tutor = tutors.find((t) => t.id === Number(params.id));

  if (!tutor) {
    return <div className="p-6 text-red-600 font-semibold">❌ Author not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        {tutor.avatar && (
          <img
            src={tutor.avatar}
            alt={tutor.name}
            className="w-20 h-20 rounded-full border shadow"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{tutor.name}</h1>
          <div className="text-sm text-gray-600">
            🎓 {tutor.degree} • 💰 ${tutor.hourly_rate}/hr
          </div>
          <div className="text-sm text-gray-600">📍 {tutor.location_city_state}</div>
        </div>
      </div>

      {tutor.description && <p className="text-gray-700 mb-6">{tutor.description}</p>}

      {tutor.subjects && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Subjects</h2>
          <p>{tutor.subjects}</p>
        </div>
      )}

      {tutor.education && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Education</h2>
          <p>{tutor.education}</p>
        </div>
      )}

      {tutor.languages && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Languages</h2>
          <p>{tutor.languages}</p>
        </div>
      )}
    </div>
  );
}
