import React from "react";

export const BetterFoodSection = (): JSX.Element => {
  const stats = [
    {
      number: "3,00,000+",
      label: "restaurants",
      icon: "🏪"
    },
    {
      number: "800+",
      label: "cities",
      icon: "📍"
    },
    {
      number: "3 billion+",
      label: "orders delivered",
      icon: "📋"
    }
  ];

  return (
    <section className="w-full py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-red-500 rounded-full opacity-20"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-orange-400 rounded-full opacity-30"></div>
      <div className="absolute bottom-20 left-32 w-4 h-4 bg-red-400 rounded-full opacity-25"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Food Images */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl shadow-lg">
            🍔
          </div>
        </div>
        
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8">
          <div className="w-40 h-40 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center text-7xl shadow-lg">
            🍕
          </div>
        </div>

        <div className="absolute top-0 right-1/4 transform -translate-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-300 to-red-400 rounded-full flex items-center justify-center text-5xl shadow-lg">
            🥘
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-6 [font-family:'Plus_Jakarta_Sans',Helvetica]">
            Better food for
          </h2>
          <h2 className="text-5xl md:text-6xl font-bold text-[#ff6b6b] mb-8 [font-family:'Plus_Jakarta_Sans',Helvetica]">
            more people
          </h2>
          
          <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto leading-relaxed [font-family:'Plus_Jakarta_Sans',Helvetica]">
            For over a decade, we've enabled our customers to discover new tastes, 
            delivered right to their doorstep
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-3">{stat.icon}</span>
                  <div className="text-left">
                    <div className="text-3xl md:text-4xl font-bold text-gray-800 [font-family:'Plus_Jakarta_Sans',Helvetica]">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-lg [font-family:'Plus_Jakarta_Sans',Helvetica]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
