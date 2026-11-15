import React from "react";
import Container from "@/components/public/Container";

interface PageGridProps {
  main: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function PageGrid({ main, sidebar }: PageGridProps) {
  return (
    <Container className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-8 lg:gap-10 py-10 lg:py-14">
      {main}
      {sidebar}
    </Container>
  );
}
