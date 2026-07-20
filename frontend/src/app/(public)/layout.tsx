import Footer from "@/components/public/Footer";
import ContentProtector from "@/components/public/ContentProtector";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <ContentProtector />
      <main className="flex-grow">
        {children}</main>
      <Footer />
    </div>
  );
}
