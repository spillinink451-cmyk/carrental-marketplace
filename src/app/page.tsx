import fs from "fs";
import path from "path";
import {
  getActiveCars, getCities, getHomepageStats, getCategoryStats, getCityStats, getActiveBrandNames,
} from "@/db/queries";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import BrowseByCategory from "@/components/BrowseByCategory";
import BrowseByCity from "@/components/BrowseByCity";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import FeaturedDeals from "@/components/FeaturedDeals";
import BrandStrip from "@/components/BrandStrip";
import Testimonials from "@/components/Testimonials";
import FaqAccordion from "@/components/FaqAccordion";

type SearchParams = { location?: string; category?: string; transmission?: string; pickupAt?: string; dropoffAt?: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [carList, cities, stats, categoryStats, cityStats, brandNames] = await Promise.all([
    getActiveCars({ city: params.location, category: params.category, transmission: params.transmission, pickupAt: params.pickupAt, dropoffAt: params.dropoffAt }),
    getCities(),
    getHomepageStats(),
    getCategoryStats(),
    getCityStats(),
    getActiveBrandNames(),
  ]);

  const heroImageExists = fs.existsSync(path.join(process.cwd(), "public/hero-car.jpg"));

  const cityStatsWithImages = cityStats.map((c) => {
    const imgPath = `public/cities/${slugify(c.city)}.jpg`;
    const exists = fs.existsSync(path.join(process.cwd(), imgPath));
    return { ...c, imagePath: exists ? `/cities/${slugify(c.city)}.jpg` : null };
  });

  return (
    <main className="flex-1">
      <HeroSection cities={cities} carCount={carList.length} heroImagePath={heroImageExists ? "/hero-car.jpg" : null} />
      <StatsBar cars={stats.cars} companies={stats.companies} cities={stats.cities} />
      <BrowseByCategory categories={categoryStats} />
      <BrowseByCity cities={cityStatsWithImages} />
      <WhyChooseUs />
      <HowItWorks />
      <FeaturedDeals cars={carList} />
      <BrandStrip brands={brandNames} />
      <Testimonials />
      <FaqAccordion />
    </main>
  );
}