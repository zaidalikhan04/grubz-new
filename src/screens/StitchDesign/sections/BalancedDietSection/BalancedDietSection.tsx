import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { useAuth } from "../../../../contexts/AuthContext";
import "../../../../styles/image-placeholders.css";

export const BalancedDietSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'customer':
        return '/dashboard';
      case 'restaurant_owner':
        return '/restaurant';
      case 'delivery_rider':
        return '/delivery';
      default:
        return '/dashboard';
    }
  };

  const handleOrderNow = () => {
    if (user) {
      navigate(getRedirectPath(user.role));
    } else {
      navigate('/auth?mode=signup');
    }
  };

  return (
    <section className="w-full">
      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <div className="relative w-full h-[480px] rounded-xl overflow-hidden hero-background flex flex-col items-start justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/50"></div>
            <div className="px-16 relative z-10">
              <h2 className="font-['Plus_Jakarta_Sans',Helvetica] font-extrabold text-white text-5xl tracking-[-2.00px] leading-[60px]">
                Food That Moves
              </h2>
              <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-base leading-6 mt-0">
                Order from your favorite local restaurants in minutes
              </p>

              <div className="flex gap-4 mt-12">
                <Button 
                  onClick={handleOrderNow}
                  className="h-12 px-5 rounded-3xl bg-[#dd3333] hover:bg-[#c52e2e] text-[#f9f7f7] font-['Plus_Jakarta_Sans',Helvetica] font-bold"
                >
                  {user ? 'Order Now' : 'Get Started'}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-5 rounded-3xl bg-[#f2e8e8] hover:bg-[#e6dada] text-[#190c0c] font-['Plus_Jakarta_Sans',Helvetica] font-bold border-0"
                >
                  View Process
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};