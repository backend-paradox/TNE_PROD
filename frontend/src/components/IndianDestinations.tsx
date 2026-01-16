import { MapPin, ArrowRight } from "lucide-react";
import { getMediaUrl } from "@/utils";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const destinations = [
  {
    id: 1,
    name: "Taj Mahal, Agra",
    image: "/assets/images/destinations/domestic/north-india/agra/agra_taj_mahal_01.jpeg",
    state: "Uttar Pradesh",
    packages: "35+ Packages",
    price: "₹12,999",
  },
  {
    id: 2,
    name: "Kerala Backwaters",
    image: "/assets/images/destinations/domestic/south-india/kerala/kerala_backwaters_01.jpeg",
    state: "Kerala",
    packages: "45+ Packages",
    price: "₹18,999",
  },
  {
    id: 3,
    name: "Jaipur - The Pink City",
    image: "/assets/images/destinations/domestic/rajasthan/jaipur/jaipur_palace_01.jpeg",
    state: "Rajasthan",
    packages: "50+ Packages",
    price: "₹15,999",
  },
  {
    id: 4,
    name: "Goa Beaches",
    image: "/assets/images/destinations/domestic/south-india/goa/goa_beach_01.jpeg",
    state: "Goa",
    packages: "60+ Packages",
    price: "₹14,999",
  },
  {
    id: 5,
    name: "Himachal Mountains",
    image: "/assets/images/destinations/domestic/north-india/himachal/himachal_mountains_01.jpeg",
    state: "Himachal Pradesh",
    packages: "42+ Packages",
    price: "₹16,999",
  },
  {
    id: 6,
    name: "Varanasi - Spiritual Capital",
    image: "/assets/images/destinations/domestic/north-india/varanasi/varanasi_ghat_01.jpeg",
    state: "Uttar Pradesh",
    packages: "30+ Packages",
    price: "₹11,999",
  },
  {
    id: 7,
    name: "Udaipur - City of Lakes",
    image: "/assets/images/destinations/domestic/rajasthan/udaipur/udaipur_palace_01.jpeg",
    state: "Rajasthan",
    packages: "38+ Packages",
    price: "₹17,999",
  },
  {
    id: 8,
    name: "Ladakh - Land of High Passes",
    image: "/assets/images/destinations/domestic/north-india/ladakh/ladakh_landscape_01.jpeg",
    state: "Ladakh",
    packages: "28+ Packages",
    price: "₹25,999",
  },
];

export function IndianDestinations() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="mb-2">Explore Indian Destinations</h3>
            <p className="text-gray-600">
              Discover the incredible diversity of India
            </p>
          </div>
          <button className="hidden md:flex items-center space-x-2 text-teal-600 hover:text-teal-700">
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={getMediaUrl(destination.image)}
                  alt={destination.name}
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-4">
                <h4 className="mb-2 text-lg">{destination.name}</h4>
                <div className="flex items-center space-x-2 mb-3 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{destination.state}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-teal-600">{destination.price}</p>
                  </div>
                  <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center space-x-1">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <button className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 mx-auto">
            <span>View All Destinations</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
