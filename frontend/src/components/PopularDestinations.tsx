import { MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const destinations = [
  {
    id: 1,
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1568727174680-7ae330b15345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMGx1eHVyeSUyMHJlc29ydHxlbnwxfHx8fDE3NjU0MjQ3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "50+ Packages",
    description: "Tropical paradise with crystal clear waters",
  },
  {
    id: 2,
    name: "Paris, France",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NTQyMjE0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "80+ Packages",
    description: "The city of love and lights",
  },
  {
    id: 3,
    name: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY1NDI0NzA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "45+ Packages",
    description: "Stunning sunsets and white-washed buildings",
  },
  {
    id: 4,
    name: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1718789967298-09132d1404bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMGNpdHklMjBza3lsaW5lfGVufDF8fHx8MTc2NTQzNTMyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "65+ Packages",
    description: "Luxury shopping and modern architecture",
  },
  {
    id: 5,
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1704253411612-e4deb715dcd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlfGVufDF8fHx8MTc2NTM2MTM4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "70+ Packages",
    description: "Ancient temples and lush landscapes",
  },
  {
    id: 6,
    name: "Swiss Alps",
    image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMGFscHN8ZW58MXx8fHwxNzY1NDQ0MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    packages: "40+ Packages",
    description: "Majestic mountains and pristine nature",
  },
];

export function PopularDestinations() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="mb-2">Popular Destinations</h3>
            <p className="text-gray-600">
              Explore the world's most sought-after travel destinations
            </p>
          </div>
          <button className="text-teal-600 hover:text-teal-700">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <h4>{destination.name}</h4>
                </div>
                <p className="text-gray-600 mb-3">{destination.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600">{destination.packages}</span>
                  <button className="text-gray-700 hover:text-teal-600">
                    Explore →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
