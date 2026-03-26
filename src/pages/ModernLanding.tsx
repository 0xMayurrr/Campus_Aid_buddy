import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Users, Bot, MapPin, Video, Shield, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Support',
      description: 'Smart campus assistant and syllabus-aware AI teacher for instant help'
    },
    {
      icon: MapPin,
      title: 'QR Navigation',
      description: 'Scan QR codes for instant campus navigation and location-based services'
    },
    {
      icon: Video,
      title: 'Digital Learning',
      description: 'Access lecture videos and digital resources anytime, anywhere'
    },
    {
      icon: Shield,
      title: 'Secure & Role-Based',
      description: 'Multi-role dashboards with secure, department-level access control'
    },
    {
      icon: Zap,
      title: 'Smart Routing',
      description: 'Automatic ticket routing and escalation based on issue type and priority'
    },
    {
      icon: Users,
      title: 'Complete Workflow',
      description: 'End-to-end campus operations from request to resolution'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-background min-h-screen lg:min-h-[638px]">
        {/* Background Decorative Element - Hidden on mobile */}
        <div className="absolute w-24 h-24 md:w-36 md:h-36 rounded-full bg-primary top-0 right-4 md:left-[438px] md:top-[-98px] opacity-20 md:opacity-100" />

        {/* Navbar */}
        <nav className="flex justify-between items-center px-4 md:px-8 lg:px-32 py-4 md:py-6 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="Campus Aid Buddy" className="w-10 h-10 md:w-16 md:h-16" />
            <span className="text-lg md:text-2xl font-semibold text-foreground font-sans">
              <span className="hidden sm:inline">Campus Aid</span>
              <span className="sm:hidden">CAB</span>
            </span>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#support" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              Support
            </a>
            <a href="#contact" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/auth')}
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-bold bg-foreground text-background hover:bg-foreground/90"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row justify-center items-center px-4 md:px-8 lg:px-32 py-8 lg:py-0 min-h-[calc(100vh-80px)] lg:min-h-[518px]">
          {/* Left Content */}
          <div className="flex flex-col justify-center w-full lg:w-[457px] lg:pr-12 text-center lg:text-left">
            {/* Section Heading */}
            <div className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-12">
              <h2 className="text-base md:text-xl font-normal text-secondary">
                Smart Campus Support Platform
              </h2>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                Transform Your Campus Operations
              </h1>
              <p className="text-sm md:text-base font-normal leading-relaxed text-muted-foreground">
                Streamline student services, academic support, and campus workflows with AI-powered assistance, QR navigation, and role-based dashboards.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-5">
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 md:px-14 py-3 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-6 md:px-9 py-3 font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative w-full max-w-md lg:max-w-none lg:w-[687px] h-64 md:h-80 lg:h-[487px] mt-8 lg:mt-0">
            <img 
              src="/new image .jpeg" 
              alt="Campus Aid Buddy Platform" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 px-4 md:px-8 lg:px-32 bg-card">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-foreground">
            Powerful Features
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Everything you need for modern campus management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="p-6 md:p-8 rounded-2xl bg-muted hover:bg-accent transition-colors">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl mb-4 md:mb-6 flex items-center justify-center bg-secondary">
                  <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 lg:px-32 bg-primary">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-primary-foreground">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 text-primary-foreground px-4">
            Join thousands of students and staff already using Campus Aid
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-bold bg-foreground text-background hover:bg-foreground/90"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 md:px-8 lg:px-32 bg-card border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/Campus_Aid_Buddyy_Logo_with_Open_Hand_Icon-removebg-preview.png" alt="Campus Aid Buddy" className="w-10 h-10 md:w-12 md:h-12" />
            <span className="text-lg md:text-xl font-semibold text-foreground">
              Campus Aid
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            © 2024 Campus Aid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}