import BlackHole from "./BlackHole";

// Example usage (full-screen center)
export default function BlackHoleDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at 50% 50%, #05090f 0%, #000 70%)",
      }}
    >
      <BlackHole />
    </div>
  );
}
