import { Hero } from "./Hero";
import { Metrics } from "./Metrics";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import { Navbar } from "@/components/shared";
   
export function Landing() {
  return (
    <div className="min-h-screen bg-white">
       <Navbar />  
       <Hero />  
       <Metrics />   
       <Features />     
       <HowItWorks />   
       <CTA /> 
       <Footer />
    </div>
  );
}
