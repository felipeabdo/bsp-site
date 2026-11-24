import { and, asc, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, users } from "@/db/schema";

export const memberColumns = {
  id: users.id,
  memberId: users.memberId,
  joinYear: users.joinYear,
  firstName: users.firstName,
  lastName: users.lastName,
  stageName: users.stageName,
  category: users.category,
  instrument: users.instrument,
  leftYear: users.leftYear,
  bio: users.bio,
  silhouette: users.silhouette,
  bodyPhotoType: users.bodyPhotoType,
  hasBody: sql<boolean>`(${users.photoBody} is not null)`.as("has_body"),
  hasPortrait: sql<boolean>`(${users.photoPortrait} is not null)`.as("has_portrait"),
  photoVersion: users.photoVersion,
  instagram: users.instagram,
  whatsapp: sql<string | null>`(case when ${users.showContact} then ${users.whatsapp} else null end)`.as("whatsapp"),
  isDemo: users.isDemo,
};

export type PublicMember = {
  id: number;
  memberId: string;
  joinYear: number;
  firstName: string;
  lastName: string;
  stageName: string | null;
  category: string;
  instrument: string | null;
  leftYear: number | null;
  bio: string | null;
  silhouette: string;
  bodyPhotoType: string;
  hasBody: boolean;
  hasPortrait: boolean;
  photoVersion: number;
  instagram: string | null;
  whatsapp: string | null;
  isDemo: boolean;
};

export { displayName, fullName } from "@/lib/member-utils";

let seeding: Promise<void> | null = null;

async function seed() {
  const [{ n: userCount }] = await db.select({ n: count() }).from(users);
  if (userCount === 0) {
    await db
      .insert(users)
      .values([
        {
          memberId: "2013-001",
          joinYear: 2013,
          seq: 1,
          firstName: "Rodolpho",
          lastName: "",
          stageName: "Xéu",
          category: "fundador",
          instrument: "Voz",
          silhouette: "m",
          bio: "Vocalista e um dos idealizadores do Bloco Santo Pecado, ao lado do irmão João Gustavo (Jonny). Desde os primeiros ensaios defende que os fundamentos do bloco são as bandas de samba-reggae e o próprio Ilê Aiyê — com Olodum, Timbalada, Tim Maia e O Rappa na trilha de fundo. É a voz que conduz o bloco do cortejo ao palco.",
          instagram: "blocosantopecado",
        },
        {
          memberId: "2013-002",
          joinYear: 2013,
          seq: 2,
          firstName: "João Gustavo",
          lastName: "",
          stageName: "Jonny",
          category: "fundador",
          instrument: "Dobra",
          silhouette: "m",
          bio: "Co-fundador do Bloco Santo Pecado e irmão de Xéu. Junto com ele reuniu os 23 amigos que, em 15 de janeiro de 2013, deram o primeiro passo para transformar um sonho de percussão gratuita em um dos maiores grupos percussivos do Distrito Federal.",
          instagram: "blocosantopecado",
        },
        {
          memberId: "2013-003",
          joinYear: 2013,
          seq: 3,
          firstName: "Reinaldo",
          lastName: "Bráz",
          stageName: "Mestre Reinaldo Bráz",
          category: "atual",
          instrument: "Mestre de bateria",
          silhouette: "m",
          bio: "Mestre do Bloco Santo Pecado e professor da Oficina BSP. Responsável pela condução da bateria, pelos arranjos e por formar novos percussionistas dentro da linguagem do samba-reggae.",
          instagram: "blocosantopecado",
        },
        {
          memberId: "DEMO-01",
          joinYear: 2019,
          seq: -1,
          firstName: "Maria",
          lastName: "Exemplo",
          stageName: "Mari (exemplo)",
          category: "atual",
          instrument: "Repinique",
          silhouette: "f",
          bio: "Perfil de exemplo para mostrar como a página de integrantes se comporta com uma silhueta feminina. Quando a pessoa enviar sua foto de corpo inteiro, ela aparece aqui em destaque.",
          isDemo: true,
        },
        {
          memberId: "DEMO-02",
          joinYear: 2018,
          seq: -2,
          firstName: "Pedro",
          lastName: "Exemplo",
          stageName: "Pedrinho (exemplo)",
          category: "atual",
          instrument: "Surdo",
          silhouette: "m",
          bio: "Perfil de exemplo para mostrar a silhueta masculina padrão quando não há foto de corpo inteiro cadastrada.",
          isDemo: true,
        },
        {
          memberId: "DEMO-03",
          joinYear: 2015,
          seq: -3,
          firstName: "Lucas",
          lastName: "Exemplo",
          stageName: "Lu (exemplo)",
          category: "ex",
          instrument: "Timbal",
          leftYear: 2020,
          silhouette: "m",
          bio: "Perfil de exemplo de alguém que já passou pelo bloco. Ex-integrantes também têm carteirinha e história contada na página.",
          isDemo: true,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ n: eventCount }] = await db.select({ n: count() }).from(events);
  if (eventCount === 0) {
    const day = 86400_000;
    const now = Date.now();
    await db.insert(events).values([
      {
        title: "Carnaval 2026 · Cortejo na orla da Terceira Ponte",
        startsAt: new Date("2026-02-17T15:00:00-03:00"),
        timeLabel: "Terça-feira de Carnaval",
        location: "Orla da Terceira Ponte · Brasília",
        description: "Terça de Carnaval com o cortejo do Bloco Santo Pecado.",
        kind: "cortejo",
      },
      {
        title: "Carnaval do Monobloco · AABB",
        startsAt: new Date("2024-02-11T00:30:00-03:00"),
        timeLabel: "00h30",
        location: "AABB · Brasília",
        description: "Depois do Monobloco, o Santo Pecado assumiu a festa.",
        kind: "show",
        free: false,
      },
      {
        title: "Pré-Carnaval no Conjunto Nacional",
        startsAt: new Date("2023-02-11T13:00:00-03:00"),
        timeLabel: "13h às 16h",
        location: "Jardim Urbano · Conjunto Nacional",
        description: "Folia gratuita com 14 integrantes em cena.",
        kind: "show",
      },
      {
        title: "Ensaio aberto do BSP",
        startsAt: new Date(now + 12 * day),
        timeLabel: "A confirmar",
        location: "Local a confirmar · Brasília",
        description: "Data de exemplo — edite na tabela de eventos.",
        kind: "ensaio",
        confirmed: false,
        isDemo: true,
      },
      {
        title: "Aula aberta da Oficina BSP",
        startsAt: new Date(now + 26 * day),
        timeLabel: "A confirmar",
        location: "Local a confirmar · Brasília",
        description: "Data de exemplo — edite na tabela de eventos.",
        kind: "oficina",
        confirmed: false,
        isDemo: true,
      },
      {
        title: "Pré-Carnaval 2027",
        startsAt: new Date(now + 70 * day),
        timeLabel: "A confirmar",
        location: "Orla do Lago Paranoá · Brasília",
        description: "Data de exemplo — edite na tabela de eventos.",
        kind: "show",
        confirmed: false,
        isDemo: true,
      },
    ]);
  }
}

export function ensureSeed() {
  if (!seeding) {
    seeding = seed().catch((e) => {
      seeding = null;
      throw e;
    });
  }
  return seeding;
}

export async function listMembers(): Promise<PublicMember[]> {
  await ensureSeed();
  return db
    .select(memberColumns)
    .from(users)
    .orderBy(asc(users.joinYear), asc(users.id)) as unknown as Promise<PublicMember[]>;
}

export async function getMember(memberId: string) {
  await ensureSeed();
  const rows = await db.select(memberColumns).from(users).where(eq(users.memberId, memberId)).limit(1);
  return rows[0] as unknown as PublicMember | undefined;
}

export async function upcomingEvents(limit = 6) {
  await ensureSeed();
  const since = new Date(Date.now() - 12 * 3600_000);
  return db.select().from(events).where(gte(events.startsAt, since)).orderBy(asc(events.startsAt)).limit(limit);
}

export async function pastEvents(limit = 6) {
  await ensureSeed();
  const since = new Date(Date.now() - 12 * 3600_000);
  return db.select().from(events).where(lt(events.startsAt, since)).orderBy(desc(events.startsAt)).limit(limit);
}

export async function nextSequence(year: number) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${users.seq}), 0)` })
    .from(users)
    .where(and(eq(users.joinYear, year), eq(users.isDemo, false)));
  return Number(row.max) + 1;
}

export function formatMemberId(year: number, seq: number) {
  return `${year}-${String(seq).padStart(3, "0")}`;
}
