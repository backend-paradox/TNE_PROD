import { Plane, CheckCircle, ChevronLeft, ChevronRight, Globe, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const domesticDestinations = [
  {
    id: 1,
    name: "Kashmir",
    image: "https://images.unsplash.com/photo-1627894482516-3b0809d0ebeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXNobWlyJTIwdmFsbGV5JTIwaW5kaWF8ZW58MXx8fHwxNzY1NTIzNzkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Jammu & Kashmir",
    packages: "80+ Packages",
    price: "₹18,999",
    description: "Paradise on Earth",
  },
  {
    id: 2,
    name: "Kerala",
    image: "https://images.unsplash.com/photo-1694783079572-eaeff4bee78b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXJhbGElMjBiYWNrd2F0ZXJzJTIwaW5kaWF8ZW58MXx8fHwxNzY1NDQ2NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Kerala",
    packages: "95+ Packages",
    price: "₹16,999",
    description: "God's Own Country",
  },
  {
    id: 3,
    name: "Goa",
    image: "https://images.unsplash.com/photo-1663848018507-accf7c6a2ebb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2ElMjBiZWFjaCUyMGluZGlhfGVufDF8fHx8MTc2NTM4NDM3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Goa",
    packages: "120+ Packages",
    price: "₹12,999",
    description: "Beach Paradise",
  },
  {
    id: 4,
    name: "Rishikesh",
    image: "https://images.unsplash.com/photo-1683318528842-bd5f1fd0ff9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXNoaWtlc2glMjBnYW5nYSUyMHJpdmVyfGVufDF8fHx8MTc2NTUyMzc5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Uttarakhand",
    packages: "70+ Packages",
    price: "₹14,999",
    description: "Yoga Capital",
  },
  {
    id: 5,
    name: "Jaipur",
    image: "https://images.unsplash.com/photo-1671520427644-33aaf3be7214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYWlwdXIlMjBwYWxhY2UlMjBpbmRpYXxlbnwxfHx8fDE3NjU0NDY2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Rajasthan",
    packages: "100+ Packages",
    price: "₹13,999",
    description: "The Pink City",
  },
  {
    id: 6,
    name: "Andaman Islands",
    image: "https://images.unsplash.com/photo-1731934235370-29208e177720?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmRhbWFuJTIwaXNsYW5kcyUyMGJlYWNofGVufDF8fHx8MTc2NTUyMzc5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Andaman & Nicobar",
    packages: "65+ Packages",
    price: "₹32,999",
    description: "Tropical Paradise",
  },
  {
    id: 7,
    name: "Mysore",
    image: "https://images.unsplash.com/photo-1753123303438-edf153d6e0f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXNvcmUlMjBwYWxhY2UlMjBpbmRpYXxlbnwxfHx8fDE3NjU1MjM3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Karnataka",
    packages: "55+ Packages",
    price: "₹11,999",
    description: "City of Palaces",
  },
  {
    id: 8,
    name: "Ladakh",
    image: "https://images.unsplash.com/photo-1668602393098-6f5d6e73da3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWRha2glMjBsYW5kc2NhcGUlMjBpbmRpYXxlbnwxfHx8fDE3NjU0NDY2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Ladakh",
    packages: "50+ Packages",
    price: "₹28,999",
    description: "Land of High Passes",
  },
];

const internationalDestinations = [
  {
    id: 1,
    name: "Thailand",
    image: "https://images.unsplash.com/photo-1729717949780-46e511489c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpbGFuZCUyMGJlYWNoJTIwcmVzb3J0fGVufDF8fHx8MTc2NTUyMjg2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Southeast Asia",
    duration: "30 Days Visa Free",
    packages: "120+ Packages",
    price: "₹35,999",
    description: "Beaches & Temples",
  },
  {
    id: 2,
    name: "Mauritius",
    image: "https://images.unsplash.com/photo-1551276415-fe781ae6167a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXVyaXRpdXMlMjBpc2xhbmR8ZW58MXx8fHwxNzY1NTIyODYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "East Africa",
    duration: "90 Days Visa Free",
    packages: "65+ Packages",
    price: "₹75,999",
    description: "Island Paradise",
  },
  {
    id: 3,
    name: "Seychelles",
    image: "https://images.unsplash.com/photo-1626085263072-d503e3dea011?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXljaGVsbGVzJTIwYmVhY2h8ZW58MXx8fHwxNzY1NTIyODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "East Africa",
    duration: "90 Days Visa Free",
    packages: "45+ Packages",
    price: "₹85,999",
    description: "Luxury Beaches",
  },
  {
    id: 4,
    name: "Nepal",
    image: "https://images.unsplash.com/photo-1681018756175-da11bf6f06ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMG1vdW50YWluc3xlbnwxfHx8fDE3NjU1MjI4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "South Asia",
    duration: "90 Days Visa Free",
    packages: "85+ Packages",
    price: "₹22,999",
    description: "Himalayan Beauty",
  },
  {
    id: 5,
    name: "Bhutan",
    image: "https://images.unsplash.com/photo-1665730012856-7acf680ad1ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaHV0YW4lMjBtb25hc3Rlcnl8ZW58MXx8fHwxNzY1NTIyODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "South Asia",
    duration: "14 Days Visa Free",
    packages: "55+ Packages",
    price: "₹45,999",
    description: "Last Shangri-La",
  },
  {
    id: 6,
    name: "Sri Lanka",
    image: "https://images.unsplash.com/photo-1711524889939-7a067c71b532?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcmklMjBsYW5rYSUyMHRyYXZlbHxlbnwxfHx8fDE3NjU1MjI4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "South Asia",
    duration: "30 Days Visa Free",
    packages: "90+ Packages",
    price: "₹28,999",
    description: "Pearl of the Ocean",
  },
  {
    id: 7,
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1568727174680-7ae330b15345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMGx1eHVyeSUyMHJlc29ydHxlbnwxfHx8fDE3NjU0MjQ3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "South Asia",
    duration: "90 Days Visa Free",
    packages: "100+ Packages",
    price: "₹65,999",
    description: "Tropical Paradise",
  },
  {
    id: 8,
    name: "Indonesia",
    image: "https://images.unsplash.com/photo-1704253411612-e4deb715dcd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlfGVufDF8fHx8MTc2NTM2MTM4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    location: "Southeast Asia",
    duration: "30 Days Visa Free",
    packages: "110+ Packages",
    price: "₹38,999",
    description: "Island Adventure",
  },
];

type FilterType = "domestic" | "international";

export function VisaFreeDestinations() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("international");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const currentDestinations = selectedFilter === "domestic" ? domesticDestinations : internationalDestinations;

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
  }, [selectedFilter]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      const newScrollPosition =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Plane className="w-8 h-8 text-green-600" />
            <h3>Explore Destinations</h3>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {selectedFilter === "domestic" 
              ? "Discover the incredible diversity of India" 
              : "Travel hassle-free to visa-free destinations"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-md">
            <button
              onClick={() => setSelectedFilter("domestic")}
              className={`px-8 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                selectedFilter === "domestic"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:text-orange-600"
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Domestic</span>
            </button>
            <button
              onClick={() => setSelectedFilter("international")}
              className={`px-8 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                selectedFilter === "international"
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>International</span>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-100 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {currentDestinations.map((destination) => (
              <div
                key={destination.id}
                className="flex-none w-80 snap-start group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    {/* Badges */}
                    {selectedFilter === "international" && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Visa Free</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <h4 className="text-white text-2xl mb-1">{destination.name}</h4>
                      <p className="text-white/90 text-sm mb-2">{destination.description}</p>
                      <div className="flex items-center space-x-2 text-white/80 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{destination.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {selectedFilter === "international" && "duration" in destination && (
                      <div className="mb-3 text-sm text-green-600 flex items-center space-x-2">
                        <Plane className="w-4 h-4" />
                        <span>{destination.duration}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-4">{destination.packages}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className={`text-xl ${selectedFilter === "domestic" ? "text-orange-600" : "text-green-600"}`}>
                          {destination.price}
                        </p>
                      </div>
                      <button className={`${
                        selectedFilter === "domestic" 
                          ? "bg-orange-600 hover:bg-orange-700" 
                          : "bg-green-600 hover:bg-green-700"
                        } text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md`}>
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl rounded-full p-3 hover:bg-gray-100 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
