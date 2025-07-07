import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../components/ui/carousel";
import "../../../../styles/image-placeholders.css";

export const NewsletterSubscriptionSection = (): JSX.Element => {
  // Food items data for mapping
  const foodItems = [
    {
      name: "Chicken Pizza",
      price: "$12.99",
      emoji: "🍕",
      bgClass: "bg-gradient-to-br from-orange-400 to-red-500",
    },
    {
      name: "Beef Burger",
      price: "$9.99",
      emoji: "🍔",
      bgClass: "bg-gradient-to-br from-yellow-400 to-orange-500",
    },
    {
      name: "Vegetarian Salad",
      price: "$8.49",
      emoji: "🥗",
      bgClass: "bg-gradient-to-br from-green-400 to-emerald-500",
    },
    {
      name: "Sushi Platter",
      price: "$15.99",
      emoji: "🍣",
      bgClass: "bg-gradient-to-br from-blue-400 to-indigo-500",
    },
    {
      name: "Pasta Carbonara",
      price: "$11.49",
      emoji: "🍝",
      bgClass: "bg-gradient-to-br from-purple-400 to-pink-500",
    },
    {
      name: "Ice Cream Sundae",
      price: "$6.99",
      emoji: "🍨",
      bgClass: "bg-gradient-to-br from-pink-400 to-rose-500",
    },
  ];

  return (
    <section className="w-full">
      <Carousel className="w-full">
        <CarouselContent className="flex gap-3 p-4">
          {foodItems.map((item, index) => (
            <CarouselItem key={index} className="basis-auto min-w-40 flex-1">
              <Card className="rounded-lg border-none">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div className={`w-full h-40 rounded-xl ${item.bgClass} flex items-center justify-center text-6xl`}>
                    {item.emoji}
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <h3 className="w-full font-medium text-[#190c0c] text-base leading-6 [font-family:'Plus_Jakarta_Sans',Helvetica]">
                      {item.name}
                    </h3>
                    <p className="w-full font-normal text-[#935151] text-sm leading-[21px] [font-family:'Plus_Jakarta_Sans',Helvetica]">
                      {item.price}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
