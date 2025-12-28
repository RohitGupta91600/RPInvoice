type Props = {
  gstEnabled: boolean;
};

export default function CompanyHeader({ gstEnabled }: Props) {
  const COMPANY = {
    name: "R P Gupta Hall Mark Shop & Bartan Bhandar",
    address: "Nagina Shah Market, Station road Mashrak,Saran,841417",
    phone: "9931864811",
    gstin: "07A1234F",
  };

  return (
    <div className="flex border-b-2 border-black">
      <div className="w-2/3 bg-yellow-200 p-2">
        <p className="font-bold">{COMPANY.name}</p>
        <p>{COMPANY.address}</p>
        <p>Phone: {COMPANY.phone}</p>
        {gstEnabled && <p>GSTIN: {COMPANY.gstin}</p>}
      </div>
    </div>
  );
}
