export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="w-full">
        <h1 className="text-4xl font-bold mb-2">About PlanetPal</h1>
        <hr className="border-t border-gray-300 my-4" />
      </div>
      {children}
    </div>
  );
}