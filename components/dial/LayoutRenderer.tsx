import type { LayoutContent, Lang } from "@/lib/schema";

// Merender isi popup sesuai layout-nya. Menambah layout baru =
// tambah satu `case` di sini + satu tipe di schema.ts.
//
// CATATAN KEAMANAN: layout "html" memakai dangerouslySetInnerHTML.
// Di Fase 0 datanya milik kita sendiri (aman). Di Fase 3, HTML dari
// CMS WAJIB disanitasi DOMPurify sebelum sampai ke sini.

export function LayoutRenderer({
  content,
  lang,
  icon,
}: {
  content: LayoutContent;
  lang: Lang;
  icon?: string;
}) {
  const title = content.title[lang];
  const heading = (
    <h2>
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      <span>{title}</span>
    </h2>
  );

  switch (content.kind) {
    case "blank":
      return (
        <div className="panel-content">
          {heading}
          {content.body[lang].split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );

    case "photo":
      return (
        <div className="panel-content layout-photo">
          {heading}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image} alt="" />
          {content.body[lang].split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );

    case "menu":
      return (
        <div className="panel-content">
          {heading}
          {content.headerImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="layout-photo-header" src={content.headerImage} alt=""
                 style={{ width: "100%", borderRadius: ".75rem", marginBottom: "1rem" }} />
          )}
          {content.groups.map((g, gi) => (
            <div className="menu-group" key={gi}>
              <h3>{g.name[lang]}</h3>
              {g.items.map((it, ii) => (
                <div className="menu-item" key={ii}>
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" />
                  )}
                  <div className="info">
                    <div className="row">
                      <span>{it.name[lang]}</span>
                      <span className="price">{it.price}</span>
                    </div>
                    <div className="desc">{it.desc[lang]}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );

    case "html":
      return (
        <div className="panel-content">
          {heading}
          <div dangerouslySetInnerHTML={{ __html: content.html[lang] }} />
        </div>
      );

    default:
      return null;
  }
}
