import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";

export const NewsletterSection = (): JSX.Element => {
  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center p-0">
            <div className="text-center mb-8">
              <h2 className="font-['Plus_Jakarta_Sans',Helvetica] font-extrabold text-[#190c0c] text-4xl tracking-[-1.00px] leading-[45px] mb-4">
                Subscribe To Our Newsletter
              </h2>
              <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#190c0c] text-lg leading-6">
                Stay updated with our latest offers and promotions.
              </p>
            </div>

            <div className="flex w-full max-w-[480px]">
              <div className="flex-1 flex items-center">
                <div className="flex w-full rounded-xl overflow-hidden">
                  <div className="flex-grow bg-[#f2e8e8] rounded-l-xl">
                    <Input
                      className="border-none bg-transparent h-12 font-['Plus_Jakarta_Sans',Helvetica] text-[#935151] placeholder:text-[#935151]"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="bg-[#f2e8e8] rounded-r-xl flex items-center pr-2">
                    <Button className="bg-[#dd3333] hover:bg-[#c52c2c] rounded-3xl h-12 px-6 font-['Plus_Jakarta_Sans',Helvetica] font-bold text-[#f9f7f7]">
                      SUBSCRIBE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
