import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturedVideos from '@/components/home/FeaturedVideos';
import LatestBlogs from '@/components/home/LatestBlogs';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeaturedVideos />
        <LatestBlogs />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
