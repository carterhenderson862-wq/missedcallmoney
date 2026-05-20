import { Phone, PhoneOff, CalendarCheck, DollarSign } from "lucide-react";

const RealResult = () => {
  return (
    <section className="py-14 bg-secondary/80">
      <div className="max-w-3xl mx-auto px-6">
        {/* Latest call card */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3 font-medium">Latest missed call</p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">AC emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneOff className="w-4 h-4 text-destructive" />
              <span className="text-destructive font-medium">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">Booked same day</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold text-base">$300</span>
            </div>
          </div>
        </div>

        {/* Yesterday summary */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3 font-medium">Yesterday</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-foreground">5 missed calls</span>
            <span className="text-foreground"><span className="text-green-400 font-semibold">2 booked</span> jobs</span>
            <span className="text-foreground">1 still texting</span>
          </div>
          <p className="mt-3 text-primary font-bold text-lg">≈ $850 recovered</p>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Works with your current number. We help you get set up.
        </p>
      </div>
    </section>
  );
};

export default RealResult;
