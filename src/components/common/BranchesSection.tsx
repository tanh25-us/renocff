import { Clock, MapPin, Star } from 'lucide-react';
import { BRANCHES } from '../../lib/constants';

export default function BranchesSection() {
  return (
    <section id="branches" className="bg-[#fcf9f8] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">Hệ thống cửa hàng</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-[#25160e] md:text-4xl">Chi nhánh tại Hà Nội</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {BRANCHES.map((branch) => (
            <div key={branch.id} className="group overflow-hidden rounded-2xl border border-[#d3c3bd] bg-white shadow-[0px_4px_20px_rgba(60,42,33,0.04)] transition hover:shadow-[0px_8px_32px_rgba(60,42,33,0.10)]">
              <div className="h-48 overflow-hidden">
                <img src={branch.image} alt={branch.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-[#25160e]">{branch.name}</h3>
                  <div className="flex items-center gap-1 rounded-full bg-[#f4dbc9] px-2 py-0.5">
                    <Star className="h-3 w-3 fill-[#25160e] text-[#25160e]" />
                    <span className="text-xs font-bold text-[#25160e]">{branch.rating}</span>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs text-[#4f4540]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#81756f]" />
                  {branch.address}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-[#4f4540]">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#81756f]" />
                  {branch.hours}
                </p>
                <button className="mt-4 w-full rounded-xl border border-[#d3c3bd] py-2 text-sm font-semibold text-[#25160e] transition hover:bg-[#f6f3f2]">
                  Chỉ đường
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
