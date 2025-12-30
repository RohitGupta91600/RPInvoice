type Props = {
  gstEnabled: boolean;
};

export default function CompanyHeader({ gstEnabled }: Props) {
  const COMPANY = {
    name: "R P Gupta Hall Mark Shop & Bartan Bhandar",
    address: "Nagina Shah Market, Station Road, Mashrak, Saran, 841417",
    phone: "9931864811",
    email: "rpguptajewellers@gmail.com",
    gstin: "07ABCDE1234F",
  };

  return (
    <div className="border-b border-black px-2 py-1 text-[12px] leading-[14px] print:text-[11px] print:leading-[13px]">
      <div className="font-bold text-[15px] print:text-[14px] leading-[16px]">
        {COMPANY.name}
      </div>
      <div>{COMPANY.address}</div>
      <div>Phone: {COMPANY.phone}</div>
      <p>Email: {COMPANY.email}</p>

      {gstEnabled && <div>GSTIN: {COMPANY.gstin}</div>}
    </div>
  );
}
