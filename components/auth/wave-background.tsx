export const WaveBackground = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      {/* Central wave emanating outward */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Wave layers growing outward */}
        <div className="absolute w-32 h-32 rounded-full border border-primary/30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-48 h-48 rounded-full border border-primary/25 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-64 h-64 rounded-full border border-primary/20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-80 h-80 rounded-full border border-primary/15 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-96 h-96 rounded-full border border-primary/10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[28rem] h-[28rem] rounded-full border border-primary/8 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[32rem] h-[32rem] rounded-full border border-primary/6 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[36rem] h-[36rem] rounded-full border border-primary/4 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[40rem] h-[40rem] rounded-full border border-primary/3 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[44rem] h-[44rem] rounded-full border border-primary/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[48rem] h-[48rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[52rem] h-[52rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[56rem] h-[56rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[60rem] h-[60rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[64rem] h-[64rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[68rem] h-[68rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[72rem] h-[72rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[76rem] h-[76rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[80rem] h-[80rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[84rem] h-[84rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[88rem] h-[88rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[92rem] h-[92rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[96rem] h-[96rem] rounded-full border border-primary/1 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};
