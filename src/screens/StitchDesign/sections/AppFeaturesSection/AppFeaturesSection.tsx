import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const AppFeaturesSection = (): JSX.Element => {
  const features = [
    {
      icon: "🥗",
      title: "Healthy",
      bgClass: "bg-white",
    },
    {
      icon: "🟢",
      title: "Veg Mode",
      bgClass: "bg-green-500",
      iconBg: "bg-green-500",
      textColor: "text-white"
    },
    {
      icon: "🍰",
      title: "Gourmet",
      bgClass: "bg-white",
    },
    {
      icon: "🏷️",
      title: "Offers",
      bgClass: "bg-white",
    },
    {
      icon: "🎂",
      title: "Plan a Party",
      bgClass: "bg-white",
    },
    {
      icon: "🎁",
      title: "Gift Cards",
      bgClass: "bg-white",
    },
    {
      icon: "🚚",
      title: "Food on Train",
      bgClass: "bg-white",
    },
    {
      icon: "📦",
      title: "Collections",
      bgClass: "bg-white",
    },
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#ff6b6b] mb-4 [font-family:'Plus_Jakarta_Sans',Helvetica]">
            What's waiting for you
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold text-[#ff6b6b] mb-6 [font-family:'Plus_Jakarta_Sans',Helvetica]">
            on the app?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto [font-family:'Plus_Jakarta_Sans',Helvetica]">
            Our app is packed with features that enable you to experience food delivery like never before
          </p>
        </div>

        {/* Features Grid with Phone */}
        <div className="relative flex items-center justify-center">
          {/* Left Features */}
          <div className="grid grid-cols-2 gap-4 mr-8">
            {features.slice(0, 4).map((feature, index) => (
              <Card key={index} className={`${feature.bgClass} border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center text-2xl ${feature.iconBg || 'bg-gray-100'}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`font-medium text-sm ${feature.textColor || 'text-gray-800'} [font-family:'Plus_Jakarta_Sans',Helvetica]`}>
                    {feature.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phone Mockup */}
          <div className="mx-8">
            <div className="relative w-64 h-96 bg-black rounded-[2.5rem] p-2">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                {/* Phone Screen Content */}
                <div className="h-full bg-gradient-to-b from-orange-100 to-red-100 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">📅</span>
                  </div>
                  <h3 className="text-gray-800 font-medium text-center text-sm mb-1">Schedule</h3>
                  <p className="text-gray-600 text-xs text-center">your order</p>
                </div>
              </div>
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl"></div>
            </div>
          </div>

          {/* Right Features */}
          <div className="grid grid-cols-2 gap-4 ml-8">
            {features.slice(4, 8).map((feature, index) => (
              <Card key={index} className={`${feature.bgClass} border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center text-2xl ${feature.iconBg || 'bg-gray-100'}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`font-medium text-sm ${feature.textColor || 'text-gray-800'} [font-family:'Plus_Jakarta_Sans',Helvetica]`}>
                    {feature.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
