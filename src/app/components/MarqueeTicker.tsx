const items = [
  "CULTURE",
  "LUXURY",
  "ELEGANCE",
  "ASO OKE",
  "IRO & BUBA",
  "KAFTAN",
  "BOUBOU",
  "CUSTOM FABRICS",
  "JEWELLERY",
  "TURBANS",
  "SHIPS WORLDWIDE",
  "LAGOS · NIGERIA",
];

export function MarqueeTicker() {
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden py-5 flex items-center"
      style={{ backgroundColor: "#EDE8DF" }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          animation: marquee 25s linear infinite;
          white-space: nowrap;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center"
          >
            <span
              className="text-xs tracking-[0.25em] px-6"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: "#0D0D0D",
              }}
            >
              {item}
            </span>
            <span
              style={{ color: "#C9A84C", fontSize: "16px" }}
            >
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}