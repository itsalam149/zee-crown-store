import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-gray text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

                    <div className="flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} />
                            <span className="font-bold text-2xl">Zee Crown</span>
                        </Link>
                        <p className="text-gray-400 text-center md:text-left text-sm">
                            Discover your best products here. Quality and trust, delivered.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-300 hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/cart" className="text-gray-300 hover:text-primary transition-colors">Cart</Link></li>
                            <li><Link href="/my-orders" className="text-gray-300 hover:text-primary transition-colors">My Orders</Link></li>
                            <li><Link href="/help" className="text-gray-300 hover:text-primary transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <Phone size={18} />
                                <a href="tel:+919999050773" className="text-gray-300 hover:text-primary transition-colors">+91 9999050773</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} />
                                <a href="mailto:zubairsheikh15@gmail.com" className="text-gray-300 hover:text-primary transition-colors">zubairsheikh15@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle size={18} />
                                <a href="https://wa.me/919999050773" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">Chat on WhatsApp</a>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h3 className="font-semibold text-lg mb-4">Our Promise</h3>
                        <p className="text-gray-400 text-sm">
                            We are committed to providing you with the best products and an exceptional shopping experience.
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
                    <p>&copy; {currentYear} Zee Crown. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;