import { Phone, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-gray text-white text-center py-5 px-4">
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <Image src="/icon.png" alt="Zee Crown" width={30} height={30} />
                    <span className="font-semibold text-lg">Zee Crown</span>
                </div>

                <div className="flex items-center justify-center gap-5 text-gray-300 text-sm">
                    <a href="tel:+919999050773" className="flex items-center gap-1 hover:text-primary">
                        <Phone size={16} /> Call
                    </a>
                    <a href="mailto:zubairsheikh15@gmail.com" className="flex items-center gap-1 hover:text-primary">
                        <Mail size={16} /> Mail
                    </a>
                    <a href="https://wa.me/919999050773" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <MessageCircle size={16} /> WhatsApp
                    </a>
                </div>

                <p className="text-gray-500 text-xs mt-2">
                    &copy; {currentYear} Zee Crown. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
