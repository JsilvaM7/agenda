import Link from "next/link";
import { Calendar, Clock, Bell, Shield, Star, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-orange-600">Agenda</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition shadow-md shadow-orange-200"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <Star className="w-4 h-4 fill-orange-400" />
          Agendamento simples para pequenas empresas
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
          Seu negócio com{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            agendamento online
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Crie seu link de agendamento em minutos. Seus clientes escolhem a data e
          horário. Você recebe notificação no celular. Simples assim.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:from-orange-500 hover:to-orange-600 transition shadow-xl shadow-orange-200"
          >
            Criar minha agenda grátis
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/b/demo"
            className="inline-flex items-center justify-center gap-2 bg-white text-orange-500 font-bold px-8 py-4 rounded-2xl text-lg border-2 border-orange-200 hover:border-orange-400 transition"
          >
            Ver exemplo
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Como funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="w-7 h-7 text-orange-500" />,
              step: "1",
              title: "Crie sua conta",
              desc: "Cadastre sua empresa com nome e senha. Em segundos você já tem seu link exclusivo.",
            },
            {
              icon: <Calendar className="w-7 h-7 text-orange-500" />,
              step: "2",
              title: "Compartilhe o link",
              desc: "Envie para seus clientes via WhatsApp, Instagram ou onde preferir.",
            },
            {
              icon: <Bell className="w-7 h-7 text-orange-500" />,
              step: "3",
              title: "Receba notificações",
              desc: "Seja avisado no celular quando alguém agendar, e 30 minutos antes do horário.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition group"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 group-hover:bg-orange-100 transition">
                {item.icon}
              </div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                Passo {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-500 py-16 my-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Tudo que você precisa
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📅", title: "Calendário visual", desc: "Seus clientes veem horários disponíveis em tempo real" },
              { icon: "📸", title: "Galeria de fotos", desc: "Adicione até 30 fotos do seu trabalho" },
              { icon: "🔔", title: "Notificações push", desc: "Aviso no celular ao receber agendamento" },
              { icon: "⏰", title: "Lembrete automático", desc: "30 minutos antes do compromisso" },
              { icon: "🔗", title: "Link exclusivo", desc: "agenda.com/b/seu-negocio" },
              { icon: "🛡️", title: "Painel completo", desc: "Gerencie todos os agendamentos com facilidade" },
            ].map((f) => (
              <div key={f.title} className="bg-white/15 backdrop-blur rounded-2xl p-6 text-white">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-orange-100 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-gray-500 mb-8">
          Crie sua conta agora e compartilhe seu link de agendamento em minutos.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-10 py-4 rounded-2xl text-lg hover:from-orange-500 hover:to-orange-600 transition shadow-xl shadow-orange-200"
        >
          Criar conta grátis
          <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-orange-600">Agenda</span>
        </div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Agenda. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
