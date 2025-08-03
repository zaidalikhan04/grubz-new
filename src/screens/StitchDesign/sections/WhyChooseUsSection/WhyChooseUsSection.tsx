import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Clock, Shield, Star, Truck } from "lucide-react";

export const WhyChooseUsSection = (): JSX.Element => {
  const features = [
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your food delivered in 30 minutes or less"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your payments and data are always protected"
    },
    {
      icon: Star,
      title: "Quality Food",
      description: "Only the best restaurants and highest quality meals"
    },
    {
      icon: Truck,
      title: "Real-time Tracking",
      description: "Track your order from kitchen to your doorstep"
    }
  ];

  return (
    <section className="w-full py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-['Plus_Jakarta_Sans',Helvetica] font-extrabold text-[#190c0c] text-4xl tracking-[-1.00px] leading-[45px] mb-4">
            Why Choose Us?
          </h2>
          <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#935151] text-lg leading-6 max-w-2xl mx-auto">
            We're committed to providing the best food delivery experience with unmatched quality and service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#dd3333] rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',Helvetica] font-bold text-[#190c0c] text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#935151] text-sm leading-5">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
