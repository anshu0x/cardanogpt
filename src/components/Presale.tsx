
const Presale = () => {
  return (
    <div className="bg-[#1C2129] max-w-3xl w-full grid p-6 gap-4 border border-[#01CC9C] grid-cols-1 justify-center items-center md:grid-cols-2 rounded-md">
      <div className="flex flex-col gap-2 ">
        <p className="gradient_text font-semibold text-xl">CGI Tokens presale starts in</p>
        <p className="text-white text-sm">Ensure you are whitelisted to participate</p>
      </div>
      <div className="flex gap-4">
      <div className="flex bg-[#14171D] text-white border border-[#18E7B6] rounded-md p-4 font-bold">
          <p>10d</p>
        </div>
        <div className="flex bg-[#14171D] text-white border border-[#18E7B6] rounded-md p-4 font-bold">
          <p>24h</p>
        </div>
        <div className="flex bg-[#14171D] text-white border border-[#18E7B6] rounded-md p-4 font-bold">
          <p>30m</p>
        </div>
        <div className="flex bg-[#14171D] text-white border border-[#18E7B6] rounded-md p-4 font-bold">
          <p>06s</p>
        </div>
      </div>
    </div>
  )
}

export default Presale