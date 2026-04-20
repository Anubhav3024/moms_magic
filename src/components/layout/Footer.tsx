import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-primary/10 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Image
              src="/moms-magic-logo.jpeg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-display font-bold text-white">
              Mom&apos;s Magic
            </span>
          </div>
          <p className="text-primary/60 leading-relaxed">
            Experience the magic of homemade recipes crafted with love and
            elegance. Your home away from home.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="p-3 bg-white/5 rounded-xl hover:bg-brand-red transition-all"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="#"
              className="p-3 bg-white/5 rounded-xl hover:bg-brand-red transition-all"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="#"
              className="p-3 bg-white/5 rounded-xl hover:bg-brand-red transition-all"
            >
              <Twitter size={20} />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold text-white mb-8">Quick Links</h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="/menu"
                className="hover:text-brand-red transition-all"
              >
                Explore Menu
              </Link>
            </li>
            <li>
              <Link
                href="/reservation"
                className="hover:text-brand-red transition-all"
              >
                Book a Table
              </Link>
            </li>
            <li>
              <Link
                href="/deals"
                className="hover:text-brand-red transition-all"
              >
                Special Offers
              </Link>
            </li>
            <li>
              <Link
                href="/story"
                className="hover:text-brand-red transition-all"
              >
                Our Story
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold text-white mb-8">Working Hours</h4>
          <ul className="space-y-4 text-primary/60">
            <li className="flex justify-between">
              <span>Mon - Fri:</span> <span>10AM - 11PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sat - Sun:</span> <span>09AM - 12PM</span>
            </li>
            <li className="pt-4 text-secondary-accent font-bold">
              Open on Public Holidays
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold text-white mb-8">Contact Us</h4>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <MapPin className="text-brand-red shrink-0" />
              <span className="text-primary/60">
                123 Magic Lane, Culinary District, New Delhi, India
              </span>
            </li>
            <li className="flex gap-4">
              <Phone className="text-brand-red shrink-0" />
              <span className="text-primary/60">+91 98765 43210</span>
            </li>
            <li className="flex gap-4">
              <Mail className="text-brand-red shrink-0" />
              <span className="text-primary/60">hello@momsmagic.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-primary/40">
        <p>(c) 2026 Mom&apos;s Magic Restaurant. All rights reserved.</p>
        <div className="flex gap-8">
          <Link href="/admin/login" className="hover:text-white transition-all">
            Admin Access
          </Link>
          <Link href="#" className="hover:text-white transition-all">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-white transition-all">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
