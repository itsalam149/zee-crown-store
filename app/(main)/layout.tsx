import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function MainLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-grayBG">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-6">
                {children}
                {modal}
            </main>
            <Footer />
        </div>
    );
}