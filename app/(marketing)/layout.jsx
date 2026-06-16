import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
