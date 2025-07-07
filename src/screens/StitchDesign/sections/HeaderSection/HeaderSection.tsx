import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Search, ChefHat, Truck } from "lucide-react";
import "../../../../styles/image-placeholders.css";

export const HeaderSection = (): JSX.Element => {
  // Data for the process steps
  const processSteps = [
    {
      title: "CHOOSE",
      description: "Select your favorite restaurant and browse their menu.",
      icon: Search,
      iconClass: "process-icon-choose",
      showTopLine: false,
      showBottomLine: true,
    },
    {
      title: "PREPARE FOOD",
      description:
        "Our chefs prepare your order with care and attention to detail.",
      icon: ChefHat,
      iconClass: "process-icon-prepare",
      showTopLine: true,
      showBottomLine: true,
    },
    {
      title: "DELIVER",
      description:
        "Your food is delivered quickly and safely to your doorstep.",
      icon: Truck,
      iconClass: "process-icon-deliver",
      showTopLine: true,
      showBottomLine: false,
    },
  ];

  return (
    <Card className="border-none shadow-none">
      <CardContent className="flex flex-col gap-2 p-4 w-full">
        {processSteps.map((step, index) => (
          <div key={index} className="flex items-start gap-2 w-full">
            <div className="flex flex-col w-10 items-center gap-1 self-stretch">
              {step.showTopLine && <div className="h-2 w-0.5 bg-[#e5d1d1]" />}

              <div className={`w-6 h-6 rounded-xl ${step.iconClass}`}>
                <step.icon size={12} />
              </div>

              {step.showBottomLine && (
                <div className="h-8 w-0.5 bg-[#e5d1d1]" />
              )}
            </div>

            <div className="flex-col py-3 flex-1 flex items-start">
              <div className="w-full">
                <div className="mt-[-1.00px] font-medium text-[#190c0c] text-base leading-6 font-sans">
                  {step.title}
                </div>
              </div>

              <div className="w-full mb-[-5.33px]">
                <div className="mt-[-1.00px] font-normal text-[#935151] text-base leading-6 font-sans">
                  {step.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
