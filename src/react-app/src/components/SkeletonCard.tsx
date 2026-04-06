function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]" aria-hidden="true">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="animate-skeleton rounded h-[1.4rem] w-[70%]"></div>
        <div className="animate-skeleton rounded h-[1.2rem] w-[60px]"></div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="animate-skeleton rounded h-5 w-[70px]"></div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="animate-skeleton rounded h-[1.2rem] w-[40px]"></div>
            <div className="animate-skeleton rounded h-[0.6rem] w-[50px]"></div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="animate-skeleton rounded h-[0.9rem] w-[120px]"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;
