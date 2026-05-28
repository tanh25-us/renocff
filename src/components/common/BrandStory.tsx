import { Coffee, Leaf, Award, Heart } from 'lucide-react';

const STORY_STATS = [
  { value: '2019', label: 'Năm thành lập', icon: Coffee },
  { value: '3', label: 'Chi nhánh HN', icon: Award },
  { value: '50+', label: 'Lô hạt/năm', icon: Leaf },
];

export default function BrandStory() {
  return (
    <section id="story" className="relative bg-[#f0eded] py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="!absolute -top-20 -right-20 opacity-5">
          <Coffee className="h-96 w-96 text-[#25160e]" />
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">Câu chuyện thương hiệu</p>
            <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-[#25160e] md:text-4xl">
              Nghệ Thuật<br />Cà Phê Thủ Công
            </h2>
            <p className="mt-6 text-sm leading-8 text-[#4f4540]">
              Reno Coffee ra đời từ niềm đam mê với hạt cà phê Việt Nam. Chúng tôi tin rằng mỗi ly cà phê là một tác phẩm — từ khâu chọn hạt, rang xay đến khoảnh khắc barista rót ly cho bạn.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#4f4540]">
              Mỗi lô hạt được truy xuất nguồn gốc rõ ràng từ các vùng trồng cà phê nổi tiếng: Đà Lạt, Buôn Ma Thuột, Ethiopia và Colombia. Chúng tôi rang nhỏ lẻ, rang tươi và phục vụ trong vòng 7 ngày sau rang.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              {STORY_STATS.map(({ value, label, icon: Icon }) => (
                <div key={label}>
                  <Icon className="h-5 w-5 text-[#6d5b4c] mb-2" />
                  <p className="font-display text-3xl font-extrabold text-[#25160e]">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-[#6d5b4c]">{label}</p>
                </div>
              ))}
            </div>
            <button className="mt-10 rounded-xl bg-[#25160e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3c2a21] hover:shadow-lg">
              Tìm hiểu thêm
            </button>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-[0px_8px_32px_rgba(60,42,33,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85"
                alt="Không gian Reno Coffee"
                className="h-[480px] w-full object-cover transition duration-700 hover:scale-[1.05]"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-[#d3c3bd] bg-white p-5 shadow-[0px_8px_32px_rgba(60,42,33,0.12)] lg:block">
              <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">Hôm nay</p>
              <p className="font-display mt-1 text-2xl font-extrabold text-[#25160e]">342 ly</p>
              <p className="mt-1 text-xs text-[#81756f]">đã được pha chế</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
