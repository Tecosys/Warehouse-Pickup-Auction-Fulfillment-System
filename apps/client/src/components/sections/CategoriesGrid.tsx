import Image from "next/image";
import AnimateOnScroll from "../ui/AnimateOnScroll";

const categories = [
  {
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
  },
  {
    name: "Home & Kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },
  {
    name: "Tools & Hardware",
    image: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=400&q=80",
  },
  {
    name: "Appliances",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
  },
  {
    name: "Furniture",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
  },
  {
    name: "General Merchandise",
    image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400&q=80",
  },
];

export default function CategoriesGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading mb-4">Categories We Commonly Sell</h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            Short intro line with category blocks showing the types of inventory buyers regularly find through Bid Boss.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, i) => (
            <AnimateOnScroll key={i} delay={i * 50} className="group cursor-pointer">
              <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent flex items-end p-8">
                  <h3 className="text-white text-xl font-bold transition-transform duration-300 group-hover:translate-x-2">
                    {category.name}
                  </h3>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
