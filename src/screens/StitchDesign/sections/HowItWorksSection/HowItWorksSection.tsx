import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const HowItWorksSection = (): JSX.Element => {
  // Data for commitment cards
  const commitmentCards = [
    {
      icon: "/vector---0-7.svg",
      title: "Qualified Chefs",
      description:
        "Our chefs are highly skilled and experienced in creating delicious meals.",
    },
    {
      icon: "/vector---0-4.svg",
      title: "Healthy Food",
      description:
        "We use fresh, high-quality ingredients to ensure our food is both tasty and nutritious.",
    },
    {
      icon: "/vector---0-2.svg",
      title: "Fast Delivery",
      description:
        "We guarantee fast delivery so you can enjoy your food as soon as possible.",
    },
  ];

  return (
    <section className="flex flex-col gap-10 px-4 py-10 w-full">
      <div className="flex flex-col gap-4">
        <div className="max-w-[720px]">
          <h2 className="font-extrabold text-[#190c0c] text-4xl tracking-[-1.00px] leading-[45px] [font-family:'Plus_Jakarta_Sans',Helvetica]">
            Our Commitment to Quality
          </h2>
        </div>

        <div className="max-w-[720px]">
          <p className="font-normal text-[#190c0c] text-base leading-6 [font-family:'Plus_Jakarta_Sans',Helvetica]">
            We strive to provide the best food delivery experience, focusing on
            quality, health, and speed.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {commitmentCards.map((card, index) => (
          <Card
            key={`commitment-card-${index}`}
            className="flex-1 min-w-[301px] bg-[#f9f7f7] border-[#e5d1d1] rounded-lg"
          >
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="w-6 h-6">
                <div
                  className="w-6 h-full bg-[100%_100%]"
                  style={{ backgroundImage: `url(${card.icon})` }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[#190c0c] text-base leading-5 [font-family:'Plus_Jakarta_Sans',Helvetica]">
                  {card.title}
                </h3>
                <p className="font-normal text-[#935151] text-sm leading-[21px] [font-family:'Plus_Jakarta_Sans',Helvetica]">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
