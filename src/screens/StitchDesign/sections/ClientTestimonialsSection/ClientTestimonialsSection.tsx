import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

export const ClientTestimonialsSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [showContactOptions, setShowContactOptions] = useState(false);

  // Navigation links data
  const navLinks = [
    { title: "Opening Hours", action: () => {} },
    { title: "How It Works", action: () => {} },
  ];

  // Contact options that appear when "Contact Us" is clicked
  const contactOptions = [
    {
      title: "Help & Support",
      action: () => {
        // You can add specific help page navigation here
        console.log('Navigate to Help & Support');
      }
    },
    {
      title: "Partner with us",
      action: () => navigate('/partner-signup')
    },
    {
      title: "Ride with us",
      action: () => navigate('/driver-signup')
    },
  ];

  // Social media icons data
  const socialIcons = [
    { url: "/vector---0-3.svg" },
    { url: "/vector---0-1.svg" },
    { url: "/vector---0-6.svg" },
  ];

  return (
    <Card className="border-none shadow-none">
      <CardContent className="flex flex-col gap-8 px-5 py-10 w-full">
        {/* Contact Us Section */}
        <div className="w-full">
          <div className="flex flex-col items-center">
            {/* Main Contact Us Button */}
            <button
              onClick={() => setShowContactOptions(!showContactOptions)}
              className="font-['Plus_Jakarta_Sans',Helvetica] font-bold text-[#190c0c] text-xl mb-6 hover:text-[#dd3333] transition-colors duration-200 flex items-center gap-2"
            >
              Contact us
              <span className={`transform transition-transform duration-200 ${showContactOptions ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Contact Options - Collapsible */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showContactOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="flex flex-col items-center gap-4 pt-2">
                {contactOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={option.action}
                    className="font-['Plus_Jakarta_Sans',Helvetica] font-medium text-[#935151] text-base hover:text-[#dd3333] hover:underline transition-colors duration-200 py-2"
                  >
                    {option.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-8 w-full">
          {navLinks.map((link, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={link.action}
                className="font-normal text-[#935151] text-base text-center leading-6 hover:text-[#dd3333] hover:underline transition-colors duration-200"
              >
                {link.title}
              </button>
            </div>
          ))}
        </div>

        {/* Social Media Icons */}
        <div className="flex flex-wrap justify-center gap-[16px_16px] items-start w-full">
          {socialIcons.map((icon, index) => (
            <button key={index} className="inline-flex items-center flex-col">
              <div className="inline-flex flex-col items-center">
                <div
                  className="w-6 h-6 bg-[100%_100%]"
                  style={{ backgroundImage: `url(${icon.url})` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Copyright Text */}
        <div className="flex flex-col items-center w-full">
          <p className="font-normal text-[#935151] text-base text-center leading-6">
            @2024 Food Delivery. All rights reserved.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
