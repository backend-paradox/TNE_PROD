import { Shield, Headphones, IndianRupee, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "Your safety is our priority with 24/7 support and secure booking",
  },
  {
    icon: IndianRupee,
    title: "Best Price Guarantee",
    description: "We promise you the best prices with no hidden charges",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our travel experts are available round the clock to assist you",
  },
  {
    icon: Award,
    title: "Trusted by Thousands",
    description: "Over 50,000+ happy travelers have chosen us",
  },
];

export function WhyChooseUs() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="mb-4">Why Choose Trip & Event</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make travel planning easy, affordable, and memorable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h4 className="mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
