import { Globe, ArrowRight } from "lucide-react";
import { getMediaUrl } from "@/utils";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const destinations = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    image: "/assets/images/destinations/international/europe/paris/paris_eiffel_tower_01.jpeg",
    packages: "80+ Packages",
    price: "₹2,499",
    continent: "Europe",
  },
  {
    id: 2,
    name: "Tokyo",
    country: "Japan",
    image: "/assets/images/destinations/international/asia/tokyo/tokyo_cityscape_01.jpeg",
    packages: "65+ Packages",
    price: "₹2,899",
    continent: "Asia",
  },
  {
    id: 3,
    name: "London",
    country: "United Kingdom",
    image: "/assets/images/destinations/international/europe/london/london_bridge_01.jpeg",
    packages: "70+ Packages",
    price: "₹2,699",
    continent: "Europe",
  },
  {
    id: 4,
    name: "Sydney",
    country: "Australia",
    image: "/assets/images/destinations/international/oceania/sydney/sydney_opera_house_01.jpeg",
    packages: "55+ Packages",
    price: "₹3,299",
    continent: "Oceania",
  },
  {
    id: 5,
    name: "Barcelona",
    country: "Spain",
    image: "/assets/images/destinations/international/europe/barcelona/barcelona_city_01.jpeg",
    packages: "60+ Packages",
    price: "₹2,399",
    continent: "Europe",
  },
  {
    id: 6,
    name: "Iceland",
    country: "Iceland",
    image: "/assets/images/destinations/international/europe/iceland/iceland_landscape_01.jpeg",
    packages: "40+ Packages",
    price: "₹3,599",
    continent: "Europe",
  },
  {
    id: 7,
    name: "New York",
    country: "USA",
    image: "/assets/images/destinations/international/north-america/newyork/newyork_skyline_01.jpeg",
    packages: "75+ Packages",
    price: "₹2,799",
    continent: "North America",
  },
  {
    id: 8,
    name: "Dubai",
    country: "UAE",
    image: "/assets/images/destinations/international/asia/dubai/dubai_skyline_01.jpeg",
    packages: "85+ Packages",
    price: "₹2,599",
    continent: "Asia",
  },
];

export function GlobalDestinations() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-teal-600" />
            <div>
              <h3 className="mb-1">Global Destinations</h3>
              <p className="text-gray-600">
                Explore breathtaking destinations around the world
              </p>
            </div>
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
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Continent Badge */}
                <div className="absolute top-3 left-3 bg-teal-600 text-white px-3 py-1 rounded-full text-xs">
                  {destination.continent}
                </div>
                
              </div>
              
              <div className="p-4">
                <h4 className="mb-1 text-lg">{destination.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{destination.country}</p>
                
                <p className="text-sm text-gray-500 mb-3">{destination.packages}</p>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-teal-600">{destination.price}</p>
                  </div>
                  <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center space-x-1">
                    <span>Book</span>
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
