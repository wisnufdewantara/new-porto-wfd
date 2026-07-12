import type { SiteData } from "@/lib/schema";

// ============================================================
//  DATA CONTOH (FASE 0) — menyimulasikan satu baris tabel `sites`
//  + barisan `items`. Di Fase 1 ini diganti hasil query Supabase.
//  Konten diambil dari CV & Portofolio Wisnu Fajar Dewantara.
// ============================================================

export const siteData: SiteData = {
  name: "Wisnu Fajar Dewantara",
  role: {
    id: "Automation Engineer · Java EE Programmer · IT & AI",
    en: "Automation Engineer · Java EE Programmer · IT & AI",
  },
  hint: {
    id: "Klik ikon di sekeliling foto untuk melihat tiap bagian",
    en: "Click the icons around the photo to explore each section",
  },
  centerImage: "/profile.jpg",
  theme: "light",
  defaultLang: "id",
  accent: "#0ea5e9",

  // Popup saat foto tengah diklik
  about: {
    kind: "blank",
    title: { id: "Tentang Saya", en: "About Me" },
    body: {
      id: "Profesional IT & AI dengan pengalaman di bidang automation, implementasi ERP, dan operasional IT. Berpengalaman sebagai Acting Manager AI & IT di SmartID — memimpin otomatisasi alur kerja dengan n8n & Zapier serta menerapkan Odoo ERP.\n\nMenguasai pengembangan web/aplikasi (Jakarta EE, PostgreSQL, Laravel, WordPress, Bubble.io) dan integrasi sistem di sektor kesehatan, e-commerce, hingga enterprise IT. Bersemangat membangun solusi yang scalable untuk meningkatkan efisiensi dan nilai bisnis.",
      en: "IT & AI professional with experience in automation, ERP implementation, and IT operations. Proven track record as Acting Manager of AI & IT at SmartID — leading workflow automation with n8n & Zapier and deploying Odoo ERP.\n\nSkilled in web/app development (Jakarta EE, PostgreSQL, Laravel, WordPress, Bubble.io) and system integration across healthcare, e-commerce, and enterprise IT. Passionate about building scalable solutions that enhance efficiency and business value.",
    },
  },

  items: [
    {
      id: "pendidikan",
      kind: "icon",
      icon: "school",
      label: { id: "Pendidikan", en: "Education" },
      content: {
        kind: "html",
        title: { id: "Pendidikan", en: "Education" },
        html: {
          id: `<ul class="timeline">
            <li><span class="year">2012 – 2017</span>
              <strong>S1 Ilmu Komputer — Universitas Brawijaya</strong>
              <em>IPK 2.78 / 4.0. Skripsi: "Implementasi Fotografi Light Painting pada Analisis Cakupan Wireless LAN Menggunakan Perangkat Berbasis Wemos D1". Ketua Divisi Database & Inventaris klub sinematografi Nol Derajat, aktif di forum legislatif mahasiswa & sebagai fotografer dokumentasi fakultas.</em></li>
          </ul>`,
          en: `<ul class="timeline">
            <li><span class="year">2012 – 2017</span>
              <strong>Bachelor of Computer Science — Brawijaya University</strong>
              <em>GPA 2.78 / 4.0. Thesis: "Implementation of Light Painting Photography in Wireless LAN Coverage Analysis Using Wemos D1-Based Devices". Head of Database & Inventory at the Nol Derajat cinematography club, active in the student legislative forum & as a faculty documentation photographer.</em></li>
          </ul>`,
        },
      },
    },
    {
      id: "kerja",
      kind: "icon",
      icon: "work",
      label: { id: "Riwayat Kerja", en: "Work Experience" },
      content: {
        kind: "html",
        title: { id: "Riwayat Kerja", en: "Work Experience" },
        html: {
          id: `<ul class="timeline">
            <li><span class="year">Apr 2025 – Sekarang</span><strong>Senior Programmer & Acting Manager Dept. IT–AI — Smart.ID</strong><em>Memimpin Dept. AI–IT: infrastruktur, automation & integrasi sistem. Membangun web app SIGC & IAPA (Laravel + payment + n8n), memimpin implementasi Odoo ERP, dan menyusun roadmap adopsi AI serta SOP/tata kelola IT.</em></li>
            <li><span class="year">Sep 2024 – Mei 2025</span><strong>Product Manager — Smart.ID</strong><em>Menjaga performa produk Smart City & Nation (SmartSakip, PMI Sakip, Profil Anak). Mengambil keputusan fitur & tech stack, jembatan Programmer dan Project Manager untuk klien pemerintah.</em></li>
            <li><span class="year">Mar 2024 – Agu 2024</span><strong>Software Automation Engineer — Linkstuff Pte. Ltd, Singapura</strong><em>Membangun workflow automation dengan n8n, integrasi HubSpot & SendPulse, serta website klien di Bubble, WordPress & Shopify.</em></li>
            <li><span class="year">Apr 2022 – Jul 2023</span><strong>IT Staff / Programmer SIMRS — RS Islam Aisyiyah, Malang</strong><em>Mengembangkan Sistem Informasi Rumah Sakit terhubung aplikasi Kemenkes (BPJS) dengan Jakarta EE, PostgreSQL & PrimeFaces.</em></li>
            <li><span class="year">Des 2021 – Jul 2022</span><strong>Freelance IT Support — PT. Graha Karya Informasi, Malang</strong><em>Maintenance & troubleshooting perangkat klien (Bank UOB, Bentoel Group, Jasa Raharja).</em></li>
            <li><span class="year">Jul 2015 – Des 2015</span><strong>IT Staff Intern — PT. Pupuk Kalimantan Timur, Bontang</strong><em>Pemeliharaan jaringan & sistem SAP, operasi Disaster Recovery Center, optimasi cakupan WiFi (Ekahau).</em></li>
          </ul>`,
          en: `<ul class="timeline">
            <li><span class="year">Apr 2025 – Now</span><strong>Senior Programmer & Acting Manager, IT–AI Dept — Smart.ID</strong><em>Leading the AI–IT department: infrastructure, automation & system integration. Built the SIGC & IAPA web apps (Laravel + payment + n8n), spearheaded Odoo ERP implementation, and defined an AI adoption roadmap plus IT governance/SOPs.</em></li>
            <li><span class="year">Sep 2024 – May 2025</span><strong>Product Manager — Smart.ID</strong><em>Ensured performance of Smart City & Nation products (SmartSakip, PMI Sakip, Profil Anak). Decided features & tech stack; bridged Programmers with the Project Manager for government clients.</em></li>
            <li><span class="year">Mar 2024 – Aug 2024</span><strong>Software Automation Engineer — Linkstuff Pte. Ltd, Singapore</strong><em>Built n8n automation workflows, integrated HubSpot & SendPulse, and delivered client websites on Bubble, WordPress & Shopify.</em></li>
            <li><span class="year">Apr 2022 – Jul 2023</span><strong>IT Staff / SIMRS Programmer — Aisyiyah Islamic Hospital, Malang</strong><em>Developed a Hospital Information System bridging the National Health Ministry app (BPJS) using Jakarta EE, PostgreSQL & PrimeFaces.</em></li>
            <li><span class="year">Dec 2021 – Jul 2022</span><strong>Freelance IT Support — PT. Graha Karya Informasi, Malang</strong><em>Maintenance & troubleshooting for clients (Bank UOB, Bentoel Group, Jasa Raharja).</em></li>
            <li><span class="year">Jul 2015 – Dec 2015</span><strong>IT Staff Intern — PT. Pupuk Kalimantan Timur, Bontang</strong><em>Network & SAP maintenance, Disaster Recovery Center operations, WiFi coverage optimization (Ekahau).</em></li>
          </ul>`,
        },
      },
    },
    {
      id: "keahlian",
      kind: "icon",
      icon: "code",
      label: { id: "Keahlian", en: "Skills" },
      content: {
        kind: "html",
        title: { id: "Keahlian", en: "Skills" },
        html: {
          id: `<div class="tags"><span>n8n</span><span>Zapier</span><span>Odoo ERP</span><span>AI Automation</span><span>Laravel</span><span>Jakarta EE</span><span>PostgreSQL</span><span>PrimeFaces</span><span>WordPress</span><span>Shopify / WooCommerce</span><span>Bubble.io</span><span>Docker</span><span>Linux Server</span><span>GitLab</span><span>Postman / API</span><span>Grafana</span><span>UX Design</span><span>QA Testing</span></div>`,
          en: `<div class="tags"><span>n8n</span><span>Zapier</span><span>Odoo ERP</span><span>AI Automation</span><span>Laravel</span><span>Jakarta EE</span><span>PostgreSQL</span><span>PrimeFaces</span><span>WordPress</span><span>Shopify / WooCommerce</span><span>Bubble.io</span><span>Docker</span><span>Linux Server</span><span>GitLab</span><span>Postman / API</span><span>Grafana</span><span>UX Design</span><span>QA Testing</span></div>`,
        },
      },
    },
    {
      id: "proyek",
      kind: "icon",
      icon: "rocket_launch",
      label: { id: "Proyek", en: "Projects" },
      content: {
        kind: "html",
        title: { id: "Proyek", en: "Projects" },
        html: {
          id: `<ul class="cards">
            <li><strong>SmartIDApp</strong><em>Aplikasi pembelajaran untuk aparatur pemerintah: integrasi AI, chatbot otomatis berbasis n8n, dan payment gateway.</em><a href="https://linktr.ee/wisnufdewantara" target="_blank">Lihat →</a></li>
            <li><strong>N8N Marketing Automation</strong><em>Workflow automation terintegrasi HubSpot & SendPulse (proyek Alnico).</em></li>
            <li><strong>Pasar Geylang Serai (E-commerce)</strong><em>Toko grocery online Singapura dengan WordPress + WooCommerce & SEO.</em><a href="http://geylangserai.shop/" target="_blank">geylangserai.shop →</a></li>
            <li><strong>SIMRS Kepegawaian</strong><em>Modul showcase Sistem Informasi RS (Java EE, PrimeFaces, PostgreSQL, Payara).</em><a href="https://gitlab.com/wisnupriester/simrs-kepeg" target="_blank">GitLab →</a></li>
            <li><strong>Iuran Kas</strong><em>Aplikasi manajemen iuran kas berbasis Laravel 8.</em><a href="https://gitlab.com/wisnupriester/iuran-kas" target="_blank">GitLab →</a></li>
            <li><strong>WISPEC (IoT)</strong><em>Skripsi: Wemos D1 + LED addressable untuk memetakan cakupan WLAN.</em><a href="https://github.com/wisnufdewantara/wemos-ssidmeter.git" target="_blank">GitHub →</a></li>
          </ul>`,
          en: `<ul class="cards">
            <li><strong>SmartIDApp</strong><em>Learning app for government officials: AI integration, n8n chatbot automation, and payment gateway.</em><a href="https://linktr.ee/wisnufdewantara" target="_blank">View →</a></li>
            <li><strong>N8N Marketing Automation</strong><em>Automation workflows integrated with HubSpot & SendPulse (Alnico project).</em></li>
            <li><strong>Pasar Geylang Serai (E-commerce)</strong><em>Singapore online grocery store with WordPress + WooCommerce & SEO.</em><a href="http://geylangserai.shop/" target="_blank">geylangserai.shop →</a></li>
            <li><strong>SIMRS HR Module</strong><em>Hospital Information System module showcase (Java EE, PrimeFaces, PostgreSQL, Payara).</em><a href="https://gitlab.com/wisnupriester/simrs-kepeg" target="_blank">GitLab →</a></li>
            <li><strong>Iuran Kas</strong><em>Cash-dues management app built with Laravel 8.</em><a href="https://gitlab.com/wisnupriester/iuran-kas" target="_blank">GitLab →</a></li>
            <li><strong>WISPEC (IoT)</strong><em>Bachelor thesis: Wemos D1 + addressable LED to map WLAN coverage.</em><a href="https://github.com/wisnufdewantara/wemos-ssidmeter.git" target="_blank">GitHub →</a></li>
          </ul>`,
        },
      },
    },
    {
      id: "penghargaan",
      kind: "icon",
      icon: "emoji_events",
      label: { id: "Penghargaan", en: "Awards" },
      content: {
        kind: "html",
        title: { id: "Penghargaan", en: "Awards" },
        html: {
          id: `<ul class="timeline">
            <li><span class="year">2019</span><strong>Juara 3 — Lomba Video Pendek HUT ke-28 Excelso</strong></li>
            <li><span class="year">2018</span><strong>Top 50 Nominee — Ngalam Memotret "Beautiful Malang in Frame" (Ngalup)</strong></li>
            <li><span class="year">2017</span><strong>Video Terfavorit — Hari Tata Ruang Kota Malang (BAPPEDA Kota Malang)</strong></li>
            <li><span class="year">2016</span><strong>Juara 2 — Lomba Fotografi HUT ke-71 TNI (Puspen TNI)</strong></li>
            <li><span class="year">2015</span><strong>Nominee Best Photo — ISIC Photography Competition, London</strong></li>
          </ul>`,
          en: `<ul class="timeline">
            <li><span class="year">2019</span><strong>3rd Place — Excelso 28th Anniversary Short Video Competition</strong></li>
            <li><span class="year">2018</span><strong>Top 50 Nominee — Ngalam Memotret "Beautiful Malang in Frame" (Ngalup)</strong></li>
            <li><span class="year">2017</span><strong>Most Favourite Video — Hari Tata Ruang Kota Malang (BAPPEDA Malang)</strong></li>
            <li><span class="year">2016</span><strong>2nd Place — 71st Indonesian Military Photography Competition (Puspen TNI)</strong></li>
            <li><span class="year">2015</span><strong>Best Photo Nominee — ISIC Photography Competition, London</strong></li>
          </ul>`,
        },
      },
    },
    {
      id: "sertifikasi",
      kind: "icon",
      icon: "workspace_premium",
      label: { id: "Sertifikasi", en: "Certifications" },
      content: {
        kind: "html",
        title: { id: "Sertifikasi & Pelatihan", en: "Certifications & Training" },
        html: {
          id: `<ul class="timeline">
            <li><span class="year">2024</span><strong>CyberSecurity Professional Academy</strong><em>Kominfo & Google</em></li>
            <li><span class="year">2021</span><strong>AWS Cloud Practitioner Essentials</strong><em>Dicoding</em></li>
            <li><span class="year">2020</span><strong>Cisco CCNA: Introduction to Networks</strong></li>
            <li><span class="year">2020</span><strong>Cisco CCNA: Cybersecurity Operations</strong></li>
            <li><span class="year">2020</span><strong>UX Design</strong><em>Baba Studio</em></li>
            <li><span class="year">2016</span><strong>Microsoft Office Desktop Application</strong></li>
          </ul>`,
          en: `<ul class="timeline">
            <li><span class="year">2024</span><strong>CyberSecurity Professional Academy</strong><em>Kominfo & Google</em></li>
            <li><span class="year">2021</span><strong>AWS Cloud Practitioner Essentials</strong><em>Dicoding</em></li>
            <li><span class="year">2020</span><strong>Cisco CCNA: Introduction to Networks</strong></li>
            <li><span class="year">2020</span><strong>Cisco CCNA: Cybersecurity Operations</strong></li>
            <li><span class="year">2020</span><strong>UX Design</strong><em>Baba Studio</em></li>
            <li><span class="year">2016</span><strong>Microsoft Office Desktop Application</strong></li>
          </ul>`,
        },
      },
    },
    {
      id: "organisasi",
      kind: "icon",
      icon: "groups",
      label: { id: "Organisasi", en: "Organizations" },
      content: {
        kind: "html",
        title: { id: "Organisasi", en: "Organizations" },
        html: {
          id: `<ul class="timeline">
            <li><span class="year">2020 – 2021</span><strong>Ketua Divisi Fotografi — Gerakan Ekonomi Kreatif Kota Batu</strong></li>
            <li><span class="year">2017 – Kini</span><strong>Anggota Fotografi — Malang Raya Landscaper</strong></li>
            <li><span class="year">2017 – Kini</span><strong>Anggota Fotografi — Dunia Photography Malang</strong></li>
            <li><span class="year">2016</span><strong>Komisi Legislatif Teknik Komputer</strong></li>
            <li><span class="year">2014 – 2016</span><strong>Ketua Database & Inventaris — Sinematografi Nol Derajat, Univ. Brawijaya</strong></li>
          </ul>`,
          en: `<ul class="timeline">
            <li><span class="year">2020 – 2021</span><strong>Chief of Photography Division — Gerakan Ekonomi Kreatif Kota Batu</strong></li>
            <li><span class="year">2017 – Now</span><strong>Photography Member — Malang Raya Landscaper</strong></li>
            <li><span class="year">2017 – Now</span><strong>Photography Member — Dunia Photography Malang</strong></li>
            <li><span class="year">2016</span><strong>Legislative Commission of Computer Engineering</strong></li>
            <li><span class="year">2014 – 2016</span><strong>Chief of Database & Inventory — Nol Derajat Cinematography, Brawijaya University</strong></li>
          </ul>`,
        },
      },
    },
    {
      id: "bahasa",
      kind: "icon",
      icon: "translate",
      label: { id: "Bahasa", en: "Languages" },
      content: {
        kind: "html",
        title: { id: "Bahasa", en: "Languages" },
        html: {
          id: `<div class="tags"><span>Indonesia — Ibu</span><span>Inggris — Profesional</span></div>`,
          en: `<div class="tags"><span>Indonesian — Native</span><span>English — Professional</span></div>`,
        },
      },
    },
    {
      id: "publikasi",
      kind: "icon",
      icon: "article",
      label: { id: "Publikasi", en: "Publications" },
      content: {
        kind: "html",
        title: { id: "Publikasi", en: "Publications" },
        html: {
          id: `<ul class="cards"><li><strong>Implementasi Fotografi Light Painting pada Analisis Cakupan Wireless LAN Menggunakan Perangkat Berbasis Wemos D1</strong><em>J-PTIIK, Universitas Brawijaya, 2017.</em><a href="https://j-ptiik.ub.ac.id/index.php/j-ptiik/article/view/712" target="_blank">Baca jurnal →</a></li></ul>`,
          en: `<ul class="cards"><li><strong>Implementation of Light Painting Photography in Wireless LAN Coverage Analysis Using Wemos D1-Based Devices</strong><em>J-PTIIK, Brawijaya University, 2017.</em><a href="https://j-ptiik.ub.ac.id/index.php/j-ptiik/article/view/712" target="_blank">Read paper →</a></li></ul>`,
        },
      },
    },
    {
      id: "minat",
      kind: "icon",
      icon: "interests",
      label: { id: "Minat & Hobi", en: "Interests" },
      content: {
        kind: "html",
        title: { id: "Minat & Hobi", en: "Interests & Hobbies" },
        html: {
          id: `<div class="tags"><span>Fotografi</span><span>Sinematografi</span><span>Landscape Photography</span><span>Videografi</span><span>Light Painting</span><span>Traveling</span></div>`,
          en: `<div class="tags"><span>Photography</span><span>Cinematography</span><span>Landscape Photography</span><span>Videography</span><span>Light Painting</span><span>Traveling</span></div>`,
        },
      },
    },
    {
      id: "kontak",
      kind: "icon",
      icon: "mail",
      label: { id: "Kontak", en: "Contact" },
      content: {
        kind: "html",
        title: { id: "Kontak", en: "Contact" },
        html: {
          id: `<ul class="contact">
            <li><span class="material-symbols-outlined">mail</span><a href="mailto:wisnupriester@gmail.com">wisnupriester@gmail.com</a></li>
            <li><span class="material-symbols-outlined">call</span><a href="tel:+6285158447674">+62 851-5844-7674</a></li>
            <li><span class="material-symbols-outlined">location_on</span><span>Malang, Indonesia</span></li>
            <li><span class="material-symbols-outlined">code</span><a href="https://github.com/wisnufdewantara" target="_blank">github.com/wisnufdewantara</a></li>
            <li><span class="material-symbols-outlined">merge</span><a href="https://gitlab.com/wisnupriester" target="_blank">gitlab.com/wisnupriester</a></li>
            <li><span class="material-symbols-outlined">link</span><a href="https://linktr.ee/wisnufdewantara" target="_blank">linktr.ee/wisnufdewantara</a></li>
          </ul>`,
          en: `<ul class="contact">
            <li><span class="material-symbols-outlined">mail</span><a href="mailto:wisnupriester@gmail.com">wisnupriester@gmail.com</a></li>
            <li><span class="material-symbols-outlined">call</span><a href="tel:+6285158447674">+62 851-5844-7674</a></li>
            <li><span class="material-symbols-outlined">location_on</span><span>Malang, Indonesia</span></li>
            <li><span class="material-symbols-outlined">code</span><a href="https://github.com/wisnufdewantara" target="_blank">github.com/wisnufdewantara</a></li>
            <li><span class="material-symbols-outlined">merge</span><a href="https://gitlab.com/wisnupriester" target="_blank">gitlab.com/wisnupriester</a></li>
            <li><span class="material-symbols-outlined">link</span><a href="https://linktr.ee/wisnufdewantara" target="_blank">linktr.ee/wisnufdewantara</a></li>
          </ul>`,
        },
      },
    },
  ],
};
