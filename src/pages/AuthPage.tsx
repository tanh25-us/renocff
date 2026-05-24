import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store';

// ── Types ──────────────────────────────────────────────────────────────────
type CustomerView = 'login' | 'register' | 'forgot';
type Tab = 'customer' | 'staff';

interface RegisterForm {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface RegisterErrors extends Partial<RegisterForm> {}

// ── Helpers ────────────────────────────────────────────────────────────────
const VN_PHONE = /^(0|\+84)(3[2-9]|5[6-9]|7[0|6-9]|8[0-9]|9[0-9])[0-9]{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(f: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};
  if (!f.name.trim() || f.name.trim().split(' ').length < 2) errors.name = 'Vui lòng nhập họ và tên đầy đủ.';
  if (!VN_PHONE.test(f.phone.replace(/\s/g, ''))) errors.phone = 'Số điện thoại không hợp lệ (VD: 0912 345 678).';
  if (f.email && !EMAIL_RE.test(f.email)) errors.email = 'Email không đúng định dạng.';
  if (f.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.';
  if (f.confirmPassword !== f.password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  return errors;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-[#93000a]">{msg}</p>;
}

function TextInput({
  label, type = 'text', value, onChange, placeholder, error, showToggle, onToggle,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; showToggle?: boolean; onToggle?: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#4f4540]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#6d5b4c]/40 ${error ? 'border-[#93000a] bg-[#fff8f7]' : 'border-[#d3c3bd] bg-white focus:border-[#6d5b4c]'}`}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-3.5 text-[#81756f]">
            {type === 'password' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ── Customer Login View ────────────────────────────────────────────────────
function CustomerLoginView({ onSwitch }: { onSwitch: (v: CustomerView) => void }) {
  const { loginCustomer } = useStore();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!VN_PHONE.test(phone.replace(/\s/g, ''))) { setError('Số điện thoại không hợp lệ.'); return; }
    const result = loginCustomer({ phone });
    if (!result) { setError('Số điện thoại chưa có tài khoản. Vui lòng đăng ký.'); return; }
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0912 345 678" error={error && !phone ? error : undefined} />
      <TextInput label="Mật khẩu" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword}
        placeholder="••••••" showToggle onToggle={() => setShowPw((v) => !v)} />
      {error && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{error}</p>}
      <button type="submit" className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
        Đăng nhập
      </button>
      <div className="flex items-center justify-between text-xs text-[#81756f]">
        <button type="button" onClick={() => onSwitch('forgot')} className="hover:text-[#25160e]">Quên mật khẩu?</button>
        <button type="button" onClick={() => onSwitch('register')} className="font-semibold text-[#25160e] hover:underline">
          Tạo tài khoản mới →
        </button>
      </div>
    </form>
  );
}

// ── Customer Register View ─────────────────────────────────────────────────
function CustomerRegisterView({ onSwitch }: { onSwitch: (v: CustomerView) => void }) {
  const { loginCustomer } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterForm, boolean>>>({});

  const set = useCallback((key: keyof RegisterForm) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (touched[key]) setErrors((prev) => ({ ...prev, [key]: validateRegister({ ...form, [key]: v })[key] }));
  }, [form, touched]);

  const blur = useCallback((key: keyof RegisterForm) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateRegister(form)[key] }));
  }, [form]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateRegister(form);
    setErrors(errs);
    setTouched({ name: true, phone: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errs).length) return;
    const result = loginCustomer({ phone: form.phone, name: form.name, email: form.email });
    if (result) navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <TextInput label="Họ và tên" value={form.name} onChange={set('name')} onBlur={blur('name') as any}
        placeholder="Nguyễn Văn An" error={errors.name} />
      <TextInput label="Số điện thoại" value={form.phone} onChange={set('phone')} onBlur={blur('phone') as any}
        placeholder="0912 345 678" error={errors.phone} />
      <TextInput label="Email (tuỳ chọn)" type="email" value={form.email} onChange={set('email')} onBlur={blur('email') as any}
        placeholder="email@example.com" error={errors.email} />
      <TextInput label="Mật khẩu" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} onBlur={blur('password') as any}
        placeholder="Tối thiểu 6 ký tự" showToggle onToggle={() => setShowPw((v) => !v)} error={errors.password} />
      <TextInput label="Xác nhận mật khẩu" type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} onBlur={blur('confirmPassword') as any}
        placeholder="Nhập lại mật khẩu" showToggle onToggle={() => setShowCpw((v) => !v)} error={errors.confirmPassword} />
      <button type="submit" className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
        Tạo tài khoản
      </button>
      <p className="text-center text-xs text-[#81756f]">
        Đã có tài khoản?{' '}
        <button type="button" onClick={() => onSwitch('login')} className="font-semibold text-[#25160e] hover:underline">Đăng nhập</button>
      </p>
    </form>
  );
}

// ── Forgot Password View ───────────────────────────────────────────────────
function ForgotView({ onSwitch }: { onSwitch: (v: CustomerView) => void }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!VN_PHONE.test(phone.replace(/\s/g, ''))) { setError('Số điện thoại không hợp lệ.'); return; }
    setSent(true);
  };

  if (sent) return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dfeadc] text-[#26442f] text-2xl">✓</div>
      <p className="text-sm font-semibold">Đã gửi mã xác nhận tới <span className="text-[#25160e]">{phone}</span></p>
      <p className="text-xs text-[#81756f]">Kiểm tra SMS và làm theo hướng dẫn để đặt lại mật khẩu.</p>
      <button onClick={() => onSwitch('login')} className="text-xs font-semibold text-[#25160e] hover:underline">← Quay lại đăng nhập</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#4f4540]">Nhập số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã xác nhận qua SMS.</p>
      <TextInput label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0912 345 678" error={error} />
      <button type="submit" className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
        Gửi mã xác nhận
      </button>
      <p className="text-center">
        <button type="button" onClick={() => onSwitch('login')} className="text-xs font-semibold text-[#81756f] hover:text-[#25160e]">← Quay lại đăng nhập</button>
      </p>
    </form>
  );
}

// ── Staff Login View ───────────────────────────────────────────────────────
function StaffLoginView() {
  const { baristas, login } = useStore();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(baristas[0]?.id || '');
  const [password, setPassword] = useState('1234');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const barista = baristas.find((b) => b.id === selectedId);
    if (!barista) return;
    if (password !== '1234') { setError('Mã ca không đúng. Mã mẫu: 1234'); return; }
    login(barista.id, barista.role);
    navigate('/admin/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {baristas.map((b) => (
          <button key={b.id} type="button" onClick={() => setSelectedId(b.id)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${selectedId === b.id ? 'border-[#25160e] bg-[#f4dbc9]' : 'border-[#d3c3bd] bg-white hover:bg-[#f6f3f2]'}`}>
            <p className="text-sm font-bold">{b.name}</p>
            <p className="text-xs text-[#4f4540]">{ROLE_PERMISSIONS[b.role].label}</p>
          </button>
        ))}
      </div>
      <TextInput label="Mã ca" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword}
        placeholder="1234" showToggle onToggle={() => setShowPw((v) => !v)} />
      {error && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{error}</p>}
      <button type="submit" className="w-full rounded-xl bg-[#25160e] py-3 text-sm font-bold text-white hover:bg-[#3c2a21]">
        Vào hệ thống quản trị
      </button>
      <p className="rounded-xl bg-[#f6f3f2] px-4 py-3 text-xs text-[#6d5b4c]">
        Tài khoản nội bộ do Admin cấp. Liên hệ quản lý nếu quên mã ca.
      </p>
    </form>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────────────────
const VIEW_TITLES: Record<CustomerView, { title: string; sub: string }> = {
  login:    { title: 'Chào mừng trở lại',   sub: 'Đăng nhập để đặt hàng và tích điểm Reno Club.' },
  register: { title: 'Tạo tài khoản',        sub: 'Đăng ký miễn phí, tích điểm ngay từ đơn đầu tiên.' },
  forgot:   { title: 'Quên mật khẩu',        sub: 'Lấy lại quyền truy cập tài khoản của bạn.' },
};

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('customer');
  const [view, setView] = useState<CustomerView>('login');
  const { title, sub } = tab === 'staff' ? { title: 'Đăng nhập nội bộ', sub: 'Dành cho nhân viên và quản lý Reno Coffee.' } : VIEW_TITLES[view];

  return (
    <div className="grid min-h-screen place-items-center bg-[#25160e] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#fcf9f8] shadow-2xl">
        {/* Header */}
        <div className="bg-[#3c2a21] p-8 text-white">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4dbc9] text-[#25160e]">
            <Coffee className="h-6 w-6" />
          </div>
          <p className="label-caps text-[#dec1b3]">Reno Coffee</p>
          <h1 className="font-display mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-[#dec1b3]/80">{sub}</p>
        </div>

        <div className="p-6">
          {/* Tab switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-[#d3c3bd] bg-[#f6f3f2] p-1">
            {(['customer', 'staff'] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setView('login'); }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-[#25160e] shadow-sm' : 'text-[#4f4540]'}`}>
                {t === 'customer' ? 'Khách hàng' : 'Nhân viên'}
              </button>
            ))}
          </div>

          {tab === 'customer' ? (
            <>
              {view === 'login'    && <CustomerLoginView onSwitch={setView} />}
              {view === 'register' && <CustomerRegisterView onSwitch={setView} />}
              {view === 'forgot'   && <ForgotView onSwitch={setView} />}
            </>
          ) : (
            <StaffLoginView />
          )}

          <div className="mt-5 text-center">
            <Link to="/" className="text-xs text-[#81756f] hover:text-[#25160e]">← Về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
