export default function BillFooter() {
  return (
    <div className="mt-4 border-t-2 border-black pt-3">

      <div className="grid grid-cols-[1.3fr_220px] gap-4 items-end">

        <div className="text-[14px] font-semibold leading-snug">
          <div>NOTE: Trusted Hallmark Gold | Silver</div>
          <div>Diamond | Gem Stone</div>
        </div>

        <div className="text-right">
          <div className="text-[13px] font-bold">Prop: R K Gupta</div>

          <div className="h-8"></div>

          <div className="inline-block border-t border-black pt-1 text-[12px] font-semibold w-28">
            Signature
          </div>
        </div>

      </div>

    </div>
  )
}
