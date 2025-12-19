import React from "react";
import HeroSlide from "../components/home/heroslide";
import CollectionSection from "../components/home/collectionsection";
import HypeSection from "../components/home/hypesection";

function Home() {
  return (
    <main className="min-h-screen">
      <section className="hero-slide-section">
        <HeroSlide />
      </section>
      <section className="collection-section">
        <CollectionSection />
      </section>
      <section className="hype-section">
        <HypeSection />
      </section>
    </main>
  );
}

export default Home;
