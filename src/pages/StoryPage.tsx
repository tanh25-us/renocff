import { motion } from 'motion/react';
import { Coffee, Leaf, Award, Heart, Shield, Sparkles } from 'lucide-react';
import SiteFooter from '../components/common/SiteFooter';

const STORY_STATS = [
  { value: '2019', label: 'Năm thành lập', icon: Coffee },
  { value: '3', label: 'Chi nhánh HN', icon: Award },
  { value: '50+', label: 'Lô hạt/năm', icon: Leaf },
];

export default function StoryPage() {
  return (
    <div className="bg-[#fcf9f8] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#25160e] text-white py-24 md:py-32">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=85"
            alt="Coffee Beans Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4dbc9]/15 px-4 py-1.5 text-xs font-bold text-[#f4dbc9] backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>HÀNH TRÌNH RENO COFFEE</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight md:text-6xl"
          >
            Nghệ Thuật Từ Hạt Rang Khởi Đầu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base md:text-lg text-[#dec1b3]/90 leading-8"
          >
            Bắt đầu từ một xưởng rang nhỏ giữa lòng Hà Nội năm 2019, Reno Coffee mang sứ mệnh định nghĩa lại trải nghiệm thưởng thức cà phê đặc sản hàng ngày của người Việt.
          </motion.p>
        </div>
      </section>

      {/* Main Story Content */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 space-y-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl font-extrabold text-[#25160e]">Triết lý "Từ Nông Trại đến Ly Cà Phê"</h2>
              <p className="text-sm leading-8 text-[#4f4540]">
                Chúng tôi không chỉ pha chế, chúng tôi đồng hành cùng người nông dân Việt tại Đà Lạt, Buôn Ma Thuột để chọn lọc ra những trái cà phê chín mọng. Từng hạt Robusta và Arabica được kiểm nghiệm chất lượng kỹ lưỡng trước khi đưa về xưởng rang.
              </p>
              <p className="text-sm leading-8 text-[#4f4540]">
                Quy trình rang mộc, không tẩm ướp phụ gia, giúp giữ nguyên vẹn bản sắc hương vị thiên nhiên đặc thù của từng thổ nhưỡng. Cà phê của Reno luôn tươi mới và được phục vụ tối ưu nhất trong vòng 7 ngày sau rang.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#d3c3bd]">
                {STORY_STATS.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon className="h-5 w-5 text-[#6d5b4c] mx-auto mb-2" />
                    <p className="font-display text-2xl font-extrabold text-[#25160e]">{value}</p>
                    <p className="text-[10px] uppercase font-bold text-[#81756f] mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85"
                  alt="Roastery process"
                  className="w-full h-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-[#d3c3bd] bg-white p-5 shadow-lg hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6d5b4c]">Hôm nay</p>
                <p className="font-display text-2xl font-extrabold text-[#25160e]">342 ly</p>
                <p className="text-xs text-[#81756f]">đã được phục vụ tận tay</p>
              </div>
            </motion.div>
          </div>

          {/* Standards Row */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Chất lượng Thượng hạng', desc: 'Lựa chọn hạt chín trên 95%, chấm điểm cupping đạt chuẩn Specialty.', icon: Award },
              { title: 'Rang tươi mỗi ngày', desc: 'Hạt cà phê được thợ rang kinh nghiệm theo dõi hồ sơ tỉ mỉ bằng phần mềm.', icon: Sparkles },
              { title: 'Pha chế Tâm huyết', desc: 'Đội ngũ Barista được đào tạo bài bản với phong thái chuyên nghiệp.', icon: Heart }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-[#d3c3bd] bg-white p-6 space-y-4 hover:shadow-md transition"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4dbc9] text-[#25160e]">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#25160e]">{card.title}</h3>
                <p className="text-xs leading-relaxed text-[#4f4540]">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
