import { Coffee, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { BRAND } from '../../lib/constants';

const FOOTER_LINKS = {
  about: ['Câu chuyện thương hiệu', 'Quy trình rang xay', 'Tuyển dụng', 'Nhượng quyền', 'Blog cà phê'],
  services: ['Giao hàng', 'Đặt hàng online', 'Reno Club', 'Khuyến mãi', 'Liên hệ'],
  legal: ['Điều khoản', 'Chính sách bảo mật', 'Chính sách đổi trả', 'Hỗ trợ khách hàng']
};

export default function SiteFooter() {
  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, #25160e 0%, transparent 40%), radial-gradient(circle at 80% 70%, #6d5b4c 0%, transparent 40%)'
        }} />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f4dbc9] to-[#e8d2c6]">
                <Coffee className="h-5 w-5 text-[#25160e] transition-transform group-hover:scale-110" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">RENO COFFEE</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/50">
              Nghệ thuật cà phê thủ công — từ hạt rang đến từng ly phục vị, chúng tôi chú tâm vào từng chi tiết nhỏ nhất.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/40 transition hover:border-white/30 hover:text-white hover:bg-white/5">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Về chúng tôi</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.about.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 transition hover:text-white hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Dịch vụ</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.services.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 transition hover:text-white hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Liên hệ</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                18 Phạm Ngọc Thạch, Đống Đa, Hà Nội
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-white/30" />
                {BRAND.hotline}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="h-4 w-4 shrink-0 text-white/30" />
                {BRAND.email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Reno Coffee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
