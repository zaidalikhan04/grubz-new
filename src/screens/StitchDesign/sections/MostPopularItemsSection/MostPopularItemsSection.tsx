import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import "../../../../styles/image-placeholders.css";

export const MostPopularItemsSection = (): JSX.Element => {
  // Testimonial data for mapping
  const testimonials = [
    {
      id: 1,
      imageClass: "testimonial-image-1",
      initial: "SC",
      quote:
        '"The food delivery service is fantastic! The food always arrives on time and is delicious. Highly recommend!"',
      author: "Sophia Carter",
    },
    {
      id: 2,
      imageClass: "testimonial-image-2",
      initial: "EW",
      quote:
        "\"I love the variety of restaurants available on this platform. It's so easy to find exactly what I'm craving.\"",
      author: "Ethan Walker",
    },
    {
      id: 3,
      imageClass: "testimonial-image-3",
      initial: "OH",
      quote:
        '"The customer service is top-notch. They\'re always quick to respond and resolve any issues. Plus, the food is amazing!"',
      author: "Olivia Hayes",
    },
  ];

  return (
    <section className="w-full">
      <div className="flex flex-wrap gap-3 p-4">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="min-w-60 flex-1 rounded-lg border-none"
          >
            <div className={`w-full h-[169px] rounded-xl ${testimonial.imageClass}`}>
              {testimonial.initial}
            </div>
            <CardContent className="flex flex-col gap-1 pt-4 px-0">
              <p className="font-['Plus_Jakarta_Sans',Helvetica] font-medium text-[#190c0c] text-base leading-6">
                {testimonial.quote}
              </p>
              <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#935151] text-sm leading-[21px]">
                {testimonial.author}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
