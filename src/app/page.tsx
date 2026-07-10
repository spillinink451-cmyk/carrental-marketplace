import fs from "fs";
import path from "path";
import { getActiveCars, getCities } from "@/db/queries";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import FeaturedDeals from "@/components/FeaturedDeals";
import Testimonials from "@/components/Testimonials";
import FaqAccordion from "@/components/FaqAccordion";


type SearchParams = {
  location?: string;
  category?: string;
  transmission?: string;
  pickupAt?: string;
  dropoffAt?: string;
};

export default async function HomePage({ searchParams }:
   { searchParams: Promise<SearchParams> })
  {
  const params = await searchParams;
  const [carList, cities] = await Promise.all([
    getActiveCars(
      { city: params.location,
        category: params.category,
        transmission: params.transmission, 
        pickupAt: params.pickupAt, 
        dropoffAt: params.dropoffAt 
      }),
    getCities(),
  ]);

  const heroImageExists = fs.existsSync(path.join(process.cwd(), "public/hero-car.jpg"));

  return (
    <main className="flex-1">
      <HeroSection cities={cities} carCount={carList.length} heroImagePath={heroImageExists ? "/hero-car.jpg" : null} />
      <WhyChooseUs />
      <HowItWorks />
      <FeaturedDeals cars={carList} />
      <Testimonials />
      <FaqAccordion />
    </main>
  );
}