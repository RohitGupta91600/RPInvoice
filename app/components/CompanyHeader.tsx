import Image from "next/image"

type Props = {
  gstEnabled: boolean
}

export default function CompanyHeader({ gstEnabled }: Props) {
  return (
    <div className="border-b-2 border-black px-3 py-3 print:py-2">
      <div className="grid grid-cols-[80px_1fr_80px] items-center">

        <div className="flex justify-center">
          <Image src="/assets/watermark916.png" alt="BIS 916" width={64} height={64} className="print:w-full print:h-full" priority />
        </div>

        <div className="text-center leading-tight">
          <div className="text-[36px] font-extrabold tracking-[6px] print:text-[30px]">R. P. GUPTA</div>
          <div className="text-[18px] font-bold mt-1 print:text-[16px]">Hallmark Shop & Bartan Bhandar</div>
          <div className="text-[14px] mt-1 print:text-[12px]">Nagina Shah Market, Station Road, Mashrak, Saran</div>
          <div className="flex justify-center gap-6 text-[14px] mt-1 print:text-[12px]">
            <span>📞 9931864811</span>
            <span>✉ rpguptajwellers@gmail.com</span>
          </div>
          {gstEnabled && <div className="text-[13px] mt-1 print:text-[11px]"><strong>GSTIN:</strong>10BTIPP7400BIZB</div>}
        </div>

        <div className="flex justify-center">
          <Image src="/assets/watermark750.png" alt="BIS 750" width={64} height={64} className="print:w-full print:h-full" priority />
        </div>

      </div>
    </div>
  )
}
