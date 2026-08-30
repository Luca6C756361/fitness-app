import Header from "./_components/Header";
import WorkoutCard from "./_components/WorkoutCard";
import NutritionCard from "./_components/NutritionCard";

export default function TodayPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Header />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkoutCard />
          <NutritionCard />
        </div>
      </div>
    </main>
  );
}