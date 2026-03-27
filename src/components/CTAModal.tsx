import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface CTAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CTAModal = ({ open, onOpenChange }: CTAModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    business: "",
    phone: "",
    email: "",
    industry: "",
    missedCalls: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", business: "", phone: "", email: "", industry: "", missedCalls: "" });
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <h3 className="font-display text-xl font-bold">You're in.</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Got it — we'll reach out to get this set up for your business.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Try it on your next missed call</DialogTitle>
              <DialogDescription>Quick setup — takes under 2 minutes.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="business">Business name</Label>
                <Input id="business" required value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Select value={form.industry} onValueChange={(val) => setForm({ ...form, industry: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="mt-2 bg-gradient-primary text-primary-foreground font-display font-semibold shadow-glow hover:opacity-90 transition-opacity">
                Request Setup
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CTAModal;
