import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Phone, Star, Users, Map, Award, Navigation } from 'lucide-react';
import { useStore } from '../store';
import SiteFooter from '../components/common/SiteFooter';

export default function StoresPage() {
  const { outlets, activeOutletId, setActiveOutlet } = useStore();
  const [hoveredOutlet, setHoveredOutlet] = useState<string | null>(null);

  const selectedOutlet = outlets.find((o) => o.id === activeOutletId) || outlets[0];

  return (
    <div className="bg-[#fcf9f8] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#25160e] text-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4dbc9]/20 px-3 py-1 text-xs font-bold text-[#f4dbc9]"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>KHÁM PHÁ KHÔNG GIAN RENO</span>
          </motion.div>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Hệ Thống Cửa Hàng</h1>
          <p className="mx-auto max-w-xl text-sm text-[#dec1b3]/80 leading-relaxed">
            Hệ thống 3 không gian cà phê độc đáo tại Hà Nội, được thiết kế sang trọng, ấm cúng và đầy cảm hứng để làm việc và trò chuyện.
          </p>
        </div>
      </section>

      {/* Main Map & Branches List Split */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Left: Outlet List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-[#25160e]">
                Danh sách chi nhánh ({outlets.length})
              </h2>
              <p className="text-xs text-[#81756f]">Click để chọn chi nhánh phục vụ</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {outlets.map((outlet) => {
                const isActive = outlet.id === activeOutletId;
                return (
                  <motion.div
                    key={outlet.id}
                    layoutId={`outlet-card-${outlet.id}`}
                    onClick={() => setActiveOutlet(outlet.id)}
                    onMouseEnter={() => setHoveredOutlet(outlet.id)}
                    onMouseLeave={() => setHoveredOutlet(null)}
                    className={`cursor-pointer rounded-2xl border p-5 transition flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                      isActive
                        ? 'border-[#25160e] bg-white shadow-md'
                        : 'border-[#d3c3bd] bg-white hover:border-[#6d5b4c] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f0eded]">
                        <img
                          src={outlet.image}
                          alt={outlet.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold text-[#25160e] truncate">
                            {outlet.name}
                          </h3>
                          {isActive && (
                            <span className="rounded-full bg-[#dfeadc] px-2 py-0.5 text-[10px] font-bold text-[#26442f] shrink-0">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4f4540] flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#81756f]" />
                          {outlet.address}
                        </p>
                        <p className="text-xs text-[#81756f] flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {outlet.hours}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#f6f3f2] shrink-0">
                      <div className="flex items-center gap-1 rounded-full bg-[#f4dbc9] px-2.5 py-1">
                        <Star className="h-3.5 w-3.5 fill-[#25160e] text-[#25160e]" />
                        <span className="text-xs font-bold text-[#25160e]">{outlet.rating}</span>
                      </div>
                      <p className="text-xs text-[#81756f] hidden md:block">
                        Khách hiện tại: <strong>{outlet.liveOccupancy}%</strong>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Mock Premium Map Component */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-[#25160e] flex items-center gap-2">
              <Map className="h-5 w-5 text-[#6d5b4c]" />
              <span>Bản đồ vị trí</span>
            </h2>
            
            <div className="relative rounded-2xl border border-[#d3c3bd] overflow-hidden bg-[#e5e0d8] h-[400px] shadow-sm flex flex-col justify-end p-5">
              {/* Map grid lines & roads mock */}
              <div className="absolute inset-0 bg-[#e5e0d8] opacity-80 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#d5cfc5_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                {/* Horizontal mock streets */}
                <div className="absolute top-[20%] left-0 right-0 h-4 bg-white/60 border-y border-[#c3bbb0]" />
                <div className="absolute top-[60%] left-0 right-0 h-6 bg-white/60 border-y border-[#c3bbb0]" />
                {/* Vertical mock streets */}
                <div className="absolute left-[30%] top-0 bottom-0 w-5 bg-white/60 border-x border-[#c3bbb0]" />
                <div className="absolute left-[75%] top-0 bottom-0 w-4 bg-white/60 border-x border-[#c3bbb0]" />
              </div>

              {/* Pins representation */}
              {outlets.map((outlet, idx) => {
                const isSelected = outlet.id === activeOutletId;
                const isHovered = outlet.id === hoveredOutlet;
                // Pre-calculated offset position for each outlet pin
                const offsets = [
                  { top: '35%', left: '42%' },
                  { top: '65%', left: '22%' },
                  { top: '15%', left: '78%' }
                ];
                const pos = offsets[idx] || { top: '50%', left: '50%' };
                
                return (
                  <motion.div
                    key={`pin-${outlet.id}`}
                    animate={{ scale: isSelected || isHovered ? 1.25 : 1 }}
                    style={{ position: 'absolute', ...pos }}
                    className="flex flex-col items-center z-20 cursor-pointer -translate-x-1/2 -translate-y-full"
                    onClick={() => setActiveOutlet(outlet.id)}
                  >
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shadow-md whitespace-nowrap transition ${
                      isSelected 
                        ? 'bg-[#25160e] text-white border-black' 
                        : 'bg-white text-[#25160e] border-[#d3c3bd]'
                    }`}>
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{outlet.name.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm mt-0.5 ${
                      isSelected ? 'bg-red-500 animate-ping' : 'bg-[#6d5b4c]'
                    }`} />
                  </motion.div>
                );
              })}

              {/* Details of Selected Outlet on Map overlay */}
              <motion.div
                layout
                className="relative bg-white/95 backdrop-blur-md rounded-xl border border-[#d3c3bd] p-4 shadow-xl z-30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-[#25160e]">{selectedOutlet.name}</h4>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#25160e]">
                    <Star className="h-3.5 w-3.5 fill-[#25160e] text-[#25160e]" />
                    <span>{selectedOutlet.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#4f4540]">{selectedOutlet.address}</p>
                <div className="flex items-center justify-between text-[11px] text-[#81756f] pt-1">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedOutlet.phone}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Mật độ: {selectedOutlet.liveOccupancy}%</span>
                </div>
                <a
                  href={`https://google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOutlet.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#25160e] py-2 text-xs font-bold text-white hover:bg-[#3c2a21]"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Chỉ đường trên bản đồ</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
