import React from "react";
import { BalancedDietSection } from "./sections/BalancedDietSection";
import { CommitmentToQualitySection } from "./sections/CommitmentToQualitySection";
import { HeaderSection } from "./sections/HeaderSection";
import { AppFeaturesSection } from "./sections/AppFeaturesSection";
import { BetterFoodSection } from "./sections/BetterFoodSection";
import { WhyChooseUsSection } from "./sections/WhyChooseUsSection";
import { FooterSection } from "./sections/FooterSection";


export const StitchDesign = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* 1. Hero Section with Navigation and Process Steps */}
      <div className="flex flex-col w-full bg-[#f9f7f7]">
        <CommitmentToQualitySection />

        <div className="flex justify-center px-40 py-5 w-full">
          <div className="flex flex-col max-w-[960px] w-full">
            <BalancedDietSection />
            <HeaderSection />
          </div>
        </div>
      </div>

      {/* 2. Better Food for More People Section */}
      <div id="restaurants">
        <BetterFoodSection />
      </div>

      {/* 3. App Features Section */}
      <AppFeaturesSection />

      {/* 4. Why Choose Us Section */}
      <div id="about">
        <WhyChooseUsSection />
      </div>

      {/* 5. Footer Section */}
      <div id="contact">
        <FooterSection />
      </div>
    </div>
  );
};
