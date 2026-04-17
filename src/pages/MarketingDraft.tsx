type MarketingPage =
  | "home"
  | "about"
  | "services"
  | "ai"
  | "roster"
  | "brands"
  | "news"
  | "contact";

interface MarketingDraftProps {
  page: MarketingPage;
}

const MarketingDraft = ({ page }: MarketingDraftProps) => {
  const src = `/index-marketing.html?page=${page}`;

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <iframe
        key={src}
        title="SSG Marketing Draft"
        src={src}
        className="h-full w-full border-0"
      />
    </div>
  );
};

export default MarketingDraft;
