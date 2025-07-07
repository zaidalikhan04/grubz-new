import React from "react";
import { BalancedDietSection } from "./sections/BalancedDietSection";
import { ClientTestimonialsSection } from "./sections/ClientTestimonialsSection";
import { CommitmentToQualitySection } from "./sections/CommitmentToQualitySection";
import { HeaderSection } from "./sections/HeaderSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { MostPopularItemsSection } from "./sections/MostPopularItemsSection";
import { NewsletterSubscriptionSection } from "./sections/NewsletterSubscriptionSection";
import { WhyChooseUsSection } from "./sections/WhyChooseUsSection";
import { FooterSection } from "./sections/FooterSection";


export const StitchDesign = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex flex-col w-full bg-[#f9f7f7]">
        <CommitmentToQualitySection />

        <div className="flex justify-center px-40 py-5 w-full">
          <div className="flex flex-col max-w-[960px] w-full">
            <BalancedDietSection />
            <NewsletterSubscriptionSection />
            <HowItWorksSection />
            <HeaderSection />
            <MostPopularItemsSection />
            <WhyChooseUsSection />
            <ClientTestimonialsSection />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};
