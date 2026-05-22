import { useState } from 'react';
import type { FormEvent } from 'react';
import { Coffee, KeyRound, UserCheck } from 'lucide-react';
import { useStore, ROLE_PERMISSIONS } from '../store';
import { Button, Field, Input } from './ui';

export default function LoginPage() {
  const { baristas, login } = useStore();
  const [selectedBaristaId, setSelectedBaristaId] = useState(baristas[0]?.id || '');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');

  const selectedBarista = baristas.find((barista) => barista.id === selectedBaristaId) || baristas[0];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedBarista) return;
    if (password && password !== '1234') {
      setError('Mã ca mẫu là 1234.');
      return;
    }
    login(selectedBarista.id, selectedBarista.role);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#25160e] p-4 text-white">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#fcf9f8] text-[#1b1c1c] shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[360px] bg-[#3c2a21]">
          <img
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80"
            alt="Quầy pha chế Reno Coffee"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[#25160e]/35" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4dbc9] text-[#25160e]">
              <Coffee className="h-6 w-6" />
            </div>
            <p className="label-caps text-[#dec1b3]">Reno Coffee</p>
            <h1 className="font-display mt-2 max-w-md text-4xl font-bold leading-tight">Không gian quản trị quán cà phê thủ công.</h1>
          </div>
        </div>

        <form className="space-y-6 p-6 md:p-10" onSubmit={handleSubmit}>
          <div>
            <p className="label-caps text-[#6d5b4c]">Đăng nhập ca trực</p>
            <h2 className="font-display mt-2 text-3xl font-bold">Management Suite</h2>
            <p className="mt-2 text-sm leading-6 text-[#4f4540]">Chọn nhân sự mẫu để xem phân quyền và vận hành demo.</p>
          </div>

          <div className="grid gap-3">
            {baristas.map((barista) => {
              const active = selectedBaristaId === barista.id;
              return (
                <button
                  key={barista.id}
                  type="button"
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active ? 'border-[#25160e] bg-[#f4dbc9]' : 'border-[#d3c3bd] bg-white hover:bg-[#f6f3f2]'
                  }`}
                  onClick={() => setSelectedBaristaId(barista.id)}
                >
                  <img src={barista.avatar} alt={barista.name} className="h-11 w-11 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{barista.name}</p>
                    <p className="truncate text-xs text-[#4f4540]">{ROLE_PERMISSIONS[barista.role].label}</p>
                  </div>
                  {active && <UserCheck className="h-5 w-5 text-[#25160e]" />}
                </button>
              );
            })}
          </div>

          <Field label="Mã ca">
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-[#81756f]" />
              <Input className="pl-10" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="1234" />
            </div>
          </Field>

          {error && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm font-semibold text-[#93000a]">{error}</p>}

          <Button type="submit" className="w-full">Vào hệ thống</Button>
        </form>
      </section>
    </main>
  );
}
