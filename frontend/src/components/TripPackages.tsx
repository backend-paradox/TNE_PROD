import { Clock, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const packages = [
  {
    id: 1,
    title: "Maldives All Inclusive Resort",
    image: "https://images.unsplash.com/photo-1568727174680-7ae330b15345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMGx1eHVyeSUyMHJlc29ydHxlbnwxfHx8fDE3NjU0MjQ3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "6 Days / 5 Nights",
    groupSize: "2-4 People",
    price: "2,499",
    features: ["Flights", "Hotels", "Meals", "Activities"],
  },
  {
    id: 2,
    title: "Paris & Switzerland Grand Tour",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NTQyMjE0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "10 Days / 9 Nights",
    groupSize: "2-6 People",
    price: "3,299",
    features: ["Flights", "Hotels", "Guided Tours", "Train Tickets"],
  },
  {
    id: 3,
    title: "Santorini Romantic Getaway",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY1NDI0NzA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "5 Days / 4 Nights",
    groupSize: "2 People",
    price: "1,899",
    features: ["Flights", "Hotels", "Breakfast", "Sunset Cruise"],
  },
  {
    id: 4,
    title: "Dubai Luxury Experience",
    image: "https://images.unsplash.com/photo-1718789967298-09132d1404bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMGNpdHklMjBza3lsaW5lfGVufDF8fHx8MTc2NTQzNTMyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "7 Days / 6 Nights",
    groupSize: "2-4 People",
    price: "2,799",
    features: ["Flights", "5-Star Hotel", "Desert Safari", "City Tours"],
  },
  {
    id: 5,
    title: "Bali Cultural Adventure",
    image: "https://images.unsplash.com/photo-1704253411612-e4deb715dcd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlfGVufDF8fHx8MTc2NTM2MTM4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "8 Days / 7 Nights",
    groupSize: "2-8 People",
    price: "1,599",
    features: ["Flights", "Hotels", "Temple Tours", "Cooking Class"],
  },
  {
    id: 6,
    title: "Swiss Alps Adventure",
    image: "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMGFscHN8ZW58MXx8fHwxNzY1NDQ0MjM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "9 Days / 8 Nights",
    groupSize: "4-10 People",
    price: "3,599",
    features: ["Flights", "Mountain Resorts", "Skiing", "Cable Cars"],
  },
];

export function TripPackages() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="mb-4">Handpicked Trip Packages</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Carefully curated travel packages designed to give you the best experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative h-56">
                <ImageWithFallback
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full">
                  Best Seller
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="mb-3">{pkg.title}</h4>
                
                <div className="flex items-center justify-between mb-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{pkg.groupSize}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-gray-600">Starting from</span>
                    <div className="text-orange-600">
                      <span className="text-2xl">₹{pkg.price}</span>
                      <span className="text-sm"> / person</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors">
            View All Packages
          </button>
        </div>
      </div>
    </div>
  );
}
