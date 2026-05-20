import { Star } from "lucide-react";

const SocialProofBanner = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        ))}
      </div>
      <span>Built for contractors who can't afford to miss calls.</span>
    </div>
  );
};

export default SocialProofBanner;
