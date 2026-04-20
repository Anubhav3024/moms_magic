import Hero from "@/components/layout/Hero";
import ParallaxBackground from "@/components/ui/ParallaxBackground";
import MenuSlider from "@/components/ui/MenuSlider";
import Link from "next/link";
import { Story, Deal, Testimonial } from "@/models";
import { ArrowRight, Star } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import Image from "next/image";

async function getHomeData() {
  try {
    await dbConnect();
    const [story, deals, testimonials] = await Promise.all([
      Story.findOne({}).lean(),
      Deal.find({ isActive: true }).limit(3).lean(),
      Testimonial.find({}).limit(3).lean(),
    ]);
    return JSON.parse(JSON.stringify({ story, deals, testimonials }));
  } catch (error) {
    console.error("Home data fetch error:", error);
    return { story: null, deals: [], testimonials: [] };
  }
}

export default async function Home() {
  const { story, deals, testimonials } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      <ParallaxBackground />
      <Hero story={story} deals={deals} />

      {/* Featured Slider Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-bold mb-4">
              Chef&apos;s Specials
            </h2>
            <p className="text-foreground/60 text-lg">
              Hand-picked magical flavors just for you
            </p>
          </div>
          <MenuSlider />
          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block px-10 py-4 bg-secondary/10 text-secondary-accent rounded-2xl font-bold hover:bg-secondary/20 transition-all"
            >
              Explore Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Preview */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-125 rounded-4xl overflow-hidden shadow-2xl">
            {story?.images?.[1] ? (
              <Image
                src={story.images[1]}
                alt="Our Story"
                fill
                className="object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-brand-red/10 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center text-brand-red/20 font-display text-8xl opacity-10 rotate-12">
                  Mom&apos;s Magic
                </div>
              </>
            )}
          </div>
          <div>
            <span className="text-brand-red font-bold tracking-widest uppercase text-sm mb-4 block">
              Our Legacy
            </span>
            <h2 className="text-5xl font-display font-bold mb-8">
              {story?.title || "A Legacy of Love & Authentic Taste"}
            </h2>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed line-clamp-6">
              {story?.description ||
                "Every dish at Mom's Magic is more than just food; it's a tribute to the warmth of home."}
            </p>
            <Link
              href="/story"
              className="text-brand-red font-bold text-lg flex items-center gap-2 group"
            >
              Read Our Full Story
              <ArrowRight
                size={18}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-16">
            What Our Magic Family Says
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="glass-card p-10 rounded-4xl text-left border border-secondary/5 hover:border-brand-red/20 transition-all flex flex-col"
              >
                <div className="flex text-amber-500 mb-6">
                  {Array(t.rating || 5)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                </div>
                <p className="text-foreground/80 italic mb-8 text-lg flex-1">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full relative overflow-hidden">
                    {t.imageUrl && (
                      <Image
                        src={t.imageUrl}
                        alt={t.customerName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{t.customerName}</h4>
                    <span className="text-xs text-foreground/50">
                      Magic Customer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <Link
              href="/reservation"
              className="px-12 py-5 bg-brand-red text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-brand-red/30 transition-all hover:-translate-y-1 inline-block"
            >
              Experience the Magic Yourself
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
