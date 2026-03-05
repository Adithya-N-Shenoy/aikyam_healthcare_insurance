export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hospital-layout">
      {children}
    </div>
  );
}