import { Injectable } from '@angular/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Tab,
  Table,
  TableCell,
  TableRow,
  TextRun,
  TabStopType,
  WidthType,
} from 'docx';
import { AgreementData } from './pdf.service';

// Page margins matching the template (twips)
const MARGINS = { top: 709, right: 1133, bottom: 1440, left: 1134 };
// A4 content width: 11906 - 1133 - 1134 = 9639 twips
const CW = 9639;
// Font size in half-points (10 pt)
const SZ = 20;
const TNR = 'Times New Roman';

const NIL = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF', space: 0 };
const THIN = { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 0 };
const NO_BORDERS = { top: NIL, bottom: NIL, left: NIL, right: NIL };
const ALL_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function run(text: string, bold = false): TextRun {
  return new TextRun({ text, bold, size: SZ, font: TNR });
}

// Section heading: bold, hanging indent matching ListParagraph ilvl=0 (left=720, hanging=360)
function heading(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, true)],
    indent: { left: 720, hanging: 360 },
    spacing: { before: 120, after: 0 },
  });
}

// Continuation paragraph (not numbered, justified)
function para(children: TextRun | TextRun[] | string, indentLeft = 720): Paragraph {
  const kids: TextRun[] =
    typeof children === 'string'
      ? [run(children)]
      : Array.isArray(children)
      ? children
      : [children];
  return new Paragraph({
    children: kids,
    alignment: AlignmentType.BOTH,
    indent: { left: indentLeft },
    spacing: { after: 0 },
  });
}

// Numbered clause with hanging indent
// level 1 (X.Y.):      left=720,  hanging=360
// level 2 (X.Y.Z.):    left=1080, hanging=720
// level 3 (X.Y.Z.W.):  left=1080, hanging=720
function clause(num: string, text: string, level = 1): Paragraph {
  const ind =
    level === 1
      ? { left: 720, hanging: 360 }
      : { left: 1080, hanging: 720 };
  return new Paragraph({
    children: [run(num + ' '), run(text)],
    alignment: AlignmentType.BOTH,
    indent: ind,
    spacing: { after: 0 },
  });
}

// Empty spacer paragraph
function gap(): Paragraph {
  return new Paragraph({ children: [run('')], spacing: { after: 0 } });
}

// Traveler table header cell: gray fill (D9D9D9), no bold
function headerCell(text: string, colW: number): TableCell {
  return new TableCell({
    borders: ALL_BORDERS,
    shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
    children: [new Paragraph({ children: [run(text)] })],
    width: { size: colW, type: WidthType.DXA },
  });
}

// Traveler table data cell
function dataCell(text: string, colW: number): TableCell {
  return new TableCell({
    borders: ALL_BORDERS,
    children: [new Paragraph({ children: [run(text)] })],
    width: { size: colW, type: WidthType.DXA },
  });
}

@Injectable({ providedIn: 'root' })
export class WordService {
  downloadAgreement(data: AgreementData): void {
    const stored = parseInt(localStorage.getItem('bd_contract_num') || '0', 10);
    const contractNum = stored + 1;
    localStorage.setItem('bd_contract_num', String(contractNum));

    const doc = buildDocument(data, contractNum);
    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceļojuma līgums ${data.firstName} ${data.lastName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

function buildDocument(data: AgreementData, contractNum: number): Document {
  const fullName = `${data.firstName} ${data.lastName}`;
  const totalTravelers = 1 + (data.companions?.length ?? 0);
  const perPersonEur = data.tripPriceCents != null ? data.tripPriceCents / 100 : null;
  const totalEur = perPersonEur != null ? perPersonEur * totalTravelers : null;
  const fmtEur = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(2));
  const latvianMonths = [
    'janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs',
    'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris',
  ];
  const now = new Date();
  const contractDate = `${now.getFullYear()}. gada ${now.getDate()}. ${latvianMonths[now.getMonth()]}`;

  // ── traveler table ──────────────────────────────────────────────────────
  // Template: width=9156, indent=562, cols=[2410, 1740, 2512, 2494]
  const tblCols = [2410, 1740, 2512, 2494];
  const tblWidth = tblCols.reduce((a, b) => a + b, 0); // 9156
  const tblIndent = 562;
  const travelerTable = new Table({
    width: { size: tblWidth, type: WidthType.DXA },
    indent: { size: tblIndent, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          headerCell('Vārds, Uzvārds', tblCols[0]),
          headerCell('Personas kods', tblCols[1]),
          headerCell('Kontakttālrunis', tblCols[2]),
          headerCell('E-pasta adrese', tblCols[3]),
        ],
      }),
      new TableRow({
        children: [
          dataCell(fullName || '_______________', tblCols[0]),
          dataCell(data.personalId || '_______________', tblCols[1]),
          dataCell(data.phone || '_______________', tblCols[2]),
          dataCell(data.email || '_______________', tblCols[3]),
        ],
      }),
      ...(data.companions ?? []).map(
        c =>
          new TableRow({
            children: [
              dataCell(`${c.firstName} ${c.lastName}`, tblCols[0]),
              dataCell(c.personalId || '_______________', tblCols[1]),
              dataCell(c.phone || '_______________', tblCols[2]),
              dataCell(c.email || '_______________', tblCols[3]),
            ],
          }),
      ),
    ],
  });

  // ── Jūrmala / date line ─────────────────────────────────────────────────
  // Single paragraph with firstLine indent + right-aligned tab stop for the date
  const jurmalaPara = new Paragraph({
    indent: { firstLine: 426 },
    tabStops: [{ type: TabStopType.RIGHT, position: CW }],
    children: [
      new TextRun({ text: 'Jūrmala', size: SZ, font: TNR }),
      new TextRun({ children: [new Tab()], size: SZ, font: TNR }),
      new TextRun({ text: contractDate, size: SZ, font: TNR }),
    ],
  });

  // ── footer with page number ─────────────────────────────────────────────
  const pageNumFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: SZ, font: TNR }),
        ],
      }),
    ],
  });

  // ── document ────────────────────────────────────────────────────────────
  return new Document({
    sections: [
      {
        properties: {
          page: { margin: MARGINS },
        },
        footers: { default: pageNumFooter },
        children: [
          // Title (right-aligned, bold)
          new Paragraph({
            children: [run(`KOMPLEKSĀ TŪRISMA PAKALPOJUMA LĪGUMS Nr. ${contractNum}`, true)],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 0 },
          }),
          gap(),
          // Location / date line
          jurmalaPara,
          gap(),

          // Parties paragraph: left=426, firstLine=720, justified
          new Paragraph({
            children: [
              run('"Brīva Diena" SIA', true),
              run(' Reģ. Nr. 40203699357, adrese Turaidas iela 110 k-2 - 47, Jūrmala, LV-2015, Latvija speciālās atļaujas (licences) Nr. 40203699357, Diāna Pujate, kura ir pilnvarota un attiecīgi tiesīga noslēgt un parakstīt šo kompleksā tūrisma pakalpojuma līgumu, no vienas puses (turpmāk tekstā – '),
              run('TŪRISMA OPERATORS', true),
              run('), un ceļotājs vai ceļotāji, par kuriem ziņas ir norādītas 1.punktā, turpmāk atsevišķi vai visi kopā saukti – '),
              run('CEĻOTĀJS', true),
              run(', no otras puses, turpmāk tekstā abi kopā saukti – '),
              run('PUSES', true),
              run(' bez maldības, viltus un spaidiem un pēc brīvas gribas noslēdz vienošanos par šādu kompleksu tūrisma pakalpojumu, turpmāk – '),
              run('LĪGUMS', true),
              run('.'),
            ],
            alignment: AlignmentType.BOTH,
            indent: { left: 426, firstLine: 720 },
            spacing: { after: 0 },
          }),
          gap(),

          // ── 1. ZIŅAS PAR CEĻOTĀJU ───────────────────────────────────────
          heading('1. ZIŅAS PAR CEĻOTĀJU'),
          gap(),
          travelerTable,
          gap(),

          // ── 2. LĪGUMA PRIEKŠMETS ────────────────────────────────────────
          heading('2. LĪGUMA PRIEKŠMETS'),
          clause('2.1.', 'CEĻOTĀJS pērk kompleksu tūrisma pakalpojumu (turpmāk tekstā – CEĻOJUMS), (CEĻOJUMA nosaukums/galamērķis un datums: atbilstoši rēķinam). CEĻOTĀJAM pirms LĪGUMA noslēgšanas tiek sniegts elektronisks paziņojums, kurā ir norādītas galvenās tūrisma pakalpojuma īpašības, kā arī cita LĪGUMĀ neiekļautā informācija par CEĻOJUMU (turpmāk – CEĻOJUMA programma). CEĻOJUMA programma ir neatņemama LĪGUMA sastāvdaļa.'),
          clause('2.2.', 'Ja šī LĪGUMA izpratnē CEĻOTĀJS ir grupa vai ģimene, tad persona, kas parakstīja LĪGUMU visu LĪGUMA 1.punktā norādīto CEĻOTĀJU vārdā, atbild par visu CEĻOTĀJU informēšanu par LĪGUMA noteikumiem, kā arī to ievērošanu un izpildi.'),
          clause('2.3.', 'CEĻOJUMU organizē un pārdod TŪRISMA OPERATORS "Brīva Diena" SIA.'),
          gap(),

          // ── 3. CENA, NORĒĶINU KĀRTĪBA UN CEĻOJUMA ATCELŠANAS NOTEIKUMI ─
          heading('3. CENA, NORĒĶINU KĀRTĪBA UN CEĻOJUMA ATCELŠANAS NOTEIKUMI'),
          clause('3.1.', `CEĻOJUMA kopējā summa ir ${totalEur != null ? fmtEur(totalEur) : '____'} euro. CEĻOJUMA cena vienam CEĻOTĀJAM ir ${perPersonEur != null ? fmtEur(perPersonEur) : '____'} euro. Ceļojuma apmaksa tiek veikta šādā kārtībā:`),
          clause('3.1.1.', 'Priekšapmaksas maksājums 300 EUR apmērā no personas tiek veikts CEĻOJUMA rezervācijas brīdī. Atlikusī summa ir maksājama ne vēlāk kā 4 nedēļas pirms CEĻOJUMA sākuma.', 2),
          clause('3.1.2.', 'Ja līdz CEĻOJUMAM ir atlicis mazāk kā 4 nedēļas, ir jāveic pilna CEĻOJUMA apmaksa.', 2),
          clause('3.2.', 'CEĻOTĀJAM, iesniedzot TŪRISMA OPERATORAM rakstisku uzteikumu, ir tiesības jebkurā brīdī pirms CEĻOJUMA sākuma vienpusēji izbeigt LĪGUMU. Rakstisko uzteikumu TŪRISMA OPERATORAM var iesniegt vienā no šādiem veidiem: nosūtot uz epastu briva.diena.lv@gmail.com'),
          para('Izbeidzot LĪGUMU pirms CEĻOJUMA SĀKUMA, TŪRISMA OPERATORS ir tiesīgs ieturēt šādu līguma izbeigšanas maksu par katru LĪGUMA 1.punktā minēto personu:'),
          clause('3.2.1.', 'Izbeidzot līgumu vairāk kā 45 kalendārās dienas pirms ceļojuma tiek ieturēta līguma apstrādes maksa 200 eiro apmērā.', 2),
          clause('3.2.2.', 'Izbeidzot līgumu vēlāk par 45 kalendārās dienas pirms ceļojuma, bet ne vēlāk kā 21 kalendāro dienu pirms ceļojuma - 50% no summas;', 2),
          clause('3.2.3.', 'Izbeidzot līgumu vēlāk par 20 kalendārās dienas pirms ceļojuma - 100% no summas.', 2),
          clause('3.3.', 'CEĻOTĀJAM ir tiesības izbeigt LĪGUMU pirms CEĻOJUMA sākuma, nemaksājot LĪGUMA izbeigšanas maksu, ja galamērķa vietā vai tā tiešā tuvumā ir izveidojušies nenovēršami un ārkārtas apstākļi, kas būtiski ietekmē kompleksā tūrisma pakalpojuma sniegšanu vai kas būtiski ietekmē pasažieru pārvadāšanu uz galamērķi. Šādā gadījumā CEĻOTĀJAM ir tiesības uz pilnīgu visu to maksājumu atmaksu, kas veikti par CEĻOJUMU, bet tam nav tiesību saņemt papildu kompensāciju.'),
          clause('3.4.', 'TŪRISMA OPERATORAM ir tiesības izbeigt LĪGUMU pirms CEĻOJUMA sākuma un pilnībā atmaksāt CEĻOTĀJAM visus maksājumus, kas veikti par CEĻOJUMU, bet TŪRISMA OPERATORAM nav pienākuma maksāt papildu kompensāciju, ja:'),
          clause('3.4.1.', 'cilvēku skaits, kas pieteikušies CEĻOJUMAM, ir mazāks par minimālo skaitu, kas noteikts CEĻOJUMA programmā, un TŪRISMA OPERATORS paņņo CEĻOTĀJAM par LĪGUMA izbeigšanu LĪGUMĀ noteiktajā termiņā, bet ne vēlāk kā:', 2),
          clause('3.4.1.1.', '20 kalendārās dienas pirms CEĻOJUMA sākuma, ja tas ilgst vairāk nekā sešas dienas;', 3),
          clause('3.4.1.2.', '7 kalendārās dienas pirms CEĻOJUMA sākuma, ja tas ilgst no sešām dienām.', 3),
          clause('3.4.2.', 'TŪRISMA OPERATORS nenovēršamu un ārkārtas apstākļu dēļ nespēj izpildīt LĪGUMU un pirms CEĻOJUMA sākuma bez nepamatotas kavēšanās paņņo CEĻOTĀJAM par LĪGUMA izbeigšanu.', 2),
          clause('3.5.', 'TŪRISMA OPERATORS bez nepamatotas kavēšanās, bet ne vēlāk kā 14 (četrpadsmit) dienu laikā pēc LĪGUMA izbeigšanas atmaksā CEĻOTĀJAM visus maksājumus, kas prasīti saskaņā ar LĪGUMA 3.3. punktu un LĪGUMA 3.4.punktu.'),
          clause('3.6.', 'LĪGUMA 3.2.punktā noteiktās sankcijas par LĪGUMA izbeigšanas maksu neattiecas uz gadījumiem, kad CEĻOTĀJS LĪGUMU izbeidz saskaņā ar LĪGUMA 5.2.2.punkta noteikumiem.'),
          gap(),

          // ── 4. CEĻOTĀJA TIESĪBAS, PIENĀKUMI UN ATBILDĪBA ───────────────
          heading('4. CEĻOTĀJA TIESĪBAS, PIENĀKUMI UN ATBILDĪBA'),
          clause('4.1.', 'CEĻOTĀJA pienākums ir iepazīties ar LĪGUMA noteikumiem, ceļojuma programmu un vispārīgo informāciju, ko CEĻOTĀJAM ir sniedzis TŪRISMA OPERATORS.'),
          clause('4.2.', 'CEĻOTĀJA pienākums ir uzreiz pēc ceļošanas dokumentu saņemšanas (līgums, rēķins) pārbaudīt, vai dokumentos iekļautie dati (vārds, uzvārds, ceļojuma datumi) atbilst pasūtījumam, un, ja tiek konstatētas nesakritības starp minētājiem dokumentiem un sākotnējo pasūtījumu, CEĻOTĀJS apņemas uzreiz informēt TŪRISMA OPERATORU par visām neatbilstībām.'),
          clause('4.3.', 'CEĻOTĀJS nodrošina sava ceļošanas dokumenta spēkā esamību, atbilstoši ceļojuma programmā sniegtajai informācijai. Ja galamērķa valsts akti prasa, CEĻOTĀJS nodrošina vakcinācijas, obligātās medicīnas izdevumu apdrošināšanas un citus dokumentus. CEĻOTĀJS uz sava rēķina garantē, ka viņam/ai ir spēkā esoši ceļojumam nepieciešamie dokumenti (pase, vīza, vakcinācijas apliecība, apdrošināšana utt.), kas ļauj CEĻOTĀJAM šķērsot valstu robežas un uzturēties valstīs ceļojuma laikā. CEĻOTĀJS ir atbildīgs par ceļošanas dokumentu spēkā esamību. Personas apliecība nav personu apliecinošs dokuments ārpus Eiropas Savienības. CEĻOTĀJA pienākums ir ņemt līdzi pasi, kas ir spēkā atbilstoši galamērķa valsts tiesību aktiem. CEĻOTĀJS nodrošina, ka viņa/viņas pase ir derīga vismaz 6 mēnešus pēc ceļojuma beigām vai kā norādīts ceļojuma programmā.'),
          clause('4.4.', 'CEĻOTĀJA pienākums ir laikus ierasties paziņotajā izlidošanas vietā un satikšanās vietās. Tostarp CEĻOTĀJA pienākums ir ņemt vērā operatīvo informāciju lidostā, autobusu vai vilcienu stacijā un iepriekš rezervēt laiku iespējamiem kavējumiem, nelabvēlīgiem laika apstākļiem vai rindām pasu kontroles vai drošības kontroles punktos.'),
          clause('4.5.', 'Ceļojuma laikā CEĻOTĀJAM ir jāpilda ceļojuma norādījumi, noteikumi un nosacījumi, kas ir spēkā viesnīcās vai visās citās naktsmītnēs un transporta līdzekļos, kā arī vietējās varas iestāžu izsniegtie priekšraksti un jārūpējas par personiskajām mantām, naudu, vērtslietām un dokumentiem.'),
          clause('4.6.', 'CEĻOTĀJA pienākums ir kompensēt visus materiālos zaudējumus, kas ceļojuma laikā ar tīšu vai netīšu darbību vai bezdarbību ir radīti TŪRISMA OPERATORAM, TŪRISMA OPERATORA partneriem vai trešajām personām, vietā, kurā zaudējumi tika radīti, vai pēc ceļojuma beigām 10 dienu laikā pēc tam, kad no TŪRISMA OPERATORA ir saņemts atbilstošs rēķins.'),
          clause('4.7.', 'CEĻOTĀJA pienākums ir samaksāt par visiem papildu pakalpojumiem, kas izmantoti galamērķī, bet nav iekļauti kompleksā tūrisma pakalpojumu līgumā (minibārs, SPA pakalpojumi, citas izklaides utt.). Tostarp maksu par bagāžu, kas pārsniedz atļauto svaru, atbilstoši aviokompānijas noteikumiem.'),
          clause('4.8.', 'CEĻOTĀJS pats ir atbildīgs par savu veselības stāvokli un fizisko sagatavotību, izvērtējot savas spējas piedalīties TŪRISMA OPERATORA organizētajā ceļojumā/piedzīvojumā. Veicot iemaksu par ceļojumu, CEĻOTĀJS apliecina, ka ir fiziski atbilstoši sagatavots, uzņemas atbildību par veselības riskiem un izvērtēs savas spējas piedalīties vai nepiedalīties plānotajās aktivitātēs. TŪRISMA OPERATORS neuzņemas atbildību par sekām, kas rodas no CEĻOTĀJA veselības stāvokļa nepareizas novērtēšanas vai medicīnisko prasību neievērošanas (medikamentu iegāde, ārstniecības pakalpojumu izmaksas, karantīnas izmitināšana).'),
          clause('4.9.', 'CEĻOTĀJAM ir tiesības ne vēlāk kā 7 (septiņas) dienas pirms CEĻOJUMA sākuma pārslēgt LĪGUMU un nodot to personai, kas atbilst visiem LĪGUMA noteikumiem. Šādā gadījumā CEĻOTĀJS pirms CEĻOJUMA sākuma iesniedz TŪRISMA OPERATORAM paziņojumu uz epastu briva.diena.lv@gmail.com.'),
          para('Persona, kas nodod LĪGUMU, un tā saņēmējs ir solidāri atbildīgi par atlikušā maksājuma samaksu un par visu no šādas nodošanas izrietošo papildu maksu, maksājumu vai citu izmaksu segšanu.'),
          clause('4.10.', 'Ja pirms CEĻOJUMA sākuma TŪRISMA OPERATORAM ir nepieciešams ievērojami mainīt kādu no CEĻOJUMA galvenajām tūrisma pakalpojuma īpašībām vai ja TŪRISMA OPERATORS nevar izpildīt šā LĪGUMA 6.2.punktā minētās CEĻOTĀJA īpašās prasības, vai ja TŪRISMA OPERATORS piedāvā palielināt LĪGUMA cenu par vairāk nekā 8 %, CEĻOTĀJAM saprātīgā termiņā, ko noteicis TŪRISMA OPERATORS, ir tiesības:'),
          clause('4.10.1.', 'piekrist ierosinātajām izmaiņām;', 2),
          clause('4.10.2.', 'izbeigt līgumu, nemaksājot līguma izbeigšanas maksu.', 2),
          para('Saņemot informāciju no TŪRISMA OPERATORA par šajā LĪGUMA punktā minētajām izmaiņām, CEĻOTĀJAM ir pienākums sniegt atbildi par to, vai CEĻOTĀJS piekrīt ierosinātajām izmaiņām LĪGUMĀ vai arī vēlas izbeigt LĪGUMU. CEĻOTĀJA atbildes nesniegšana netiks uzskatīta par piekrišanu ierosinātajām izmaiņām LĪGUMĀ, un LĪGUMS tiks izbeigts.'),
          clause('4.11.', 'Ja CEĻOTĀJS LĪGUMA 4.10.punktā minētajā gadījumā vēlas izbeigt LĪGUMU un TŪRISMA OPERATORS piedāvā alternatīvu komplekso tūrisma pakalpojumu, kas, ja iespējams, ir tādas pašas vai augstākas kvalitātes, CEĻOTĀJS var piekrist saņemt alternatīvo komplekso tūrisma pakalpojumu.'),
          clause('4.12.', 'Ja CEĻOTĀJS piekrīt ierosinātajām izmaiņām, kas attiecas uz CEĻOJUMA cenas paaugstināšanos, CEĻOTĀJS un TŪRISMA OPERATORS savstarpēji vienojas par kārtību un termiņu, kādā CEĻOTĀJS sedz (samaksā) cenas starpību par augstākas kvalitātes pakalpojumiem.'),
          clause('4.13.', 'Ja CEĻOJUMA laikā netiek sniegts kāds no LĪGUMĀ iekļautajiem tūrisma pakalpojumiem vai ja tas netiek sniegts pienācīgi, CEĻOTĀJAM bez nepamatotas kavēšanās, ņemot vērā situācijas apstākļus, atbilstoši LĪGUMA 7.1.punktā noteiktajai kārtībai ir pienākums paziņot TŪRISMA OPERATORAM (tā pārstāvim vai grupas vadītājam) par jebkādu neatbilstību, ar ko CEĻOTĀJS saskaras LĪGUMĀ iekļautā tūrisma pakalpojuma sniegšanas laikā.'),
          clause('4.14.', 'Ātrai un efektīvai saziņai ar TŪRISMA OPERATORU, lai pieprasītu palīdzību, ja CEĻOTĀJS ir nonācis grūtībās, vai lai sūdzētos par jebkuru neatbilstību, ar ko CEĻOTĀJS saskāries kompleksā tūrisma pakalpojuma sniegšanas laikā, CEĻOTĀJS vēršas pie Diānas Pujates +371 2978 4777.'),
          clause('4.15.', 'CEĻOTĀJA atbildība ir iegādāties ceļojuma apdrošināšanu.'),
          clause('4.16.', 'CEĻOTĀJAM ir pienākums, dodoties CEĻOJUMĀ kopā ar bērnu, ievērot prasības, kas ir noteiktas 2010.gada 3.augusta Ministru kabineta noteikumos Nr. 721 "Kārtība, kādā bērni šķērso valsts robežu".'),
          clause('4.17.', 'CEĻOJUMA rezervāciju ir tiesības veikt rīcībspējīgām personām, kas sasniegušas 18 gadu vecumu.'),
          gap(),

          // ── 5. TŪRISMA OPERATORA TIESĪBAS, PIENĀKUMI UN ATBILDĪBA ────────
          heading('5. TŪRISMA OPERATORA TIESĪBAS, PIENĀKUMI UN ATBILDĪBA'),
          clause('5.1.', 'TŪRISMA OPERATORS ir atbildīgs par visu LĪGUMĀ ietverto tūrisma pakalpojumu pienācīgu sniegšanu, neatkarīgi no tā, vai šos pakalpojumus sniedz TŪRISMA OPERATORS vai citi TŪRISMA AĢENTI, tūrisma operatori vai saistītu tūrisma pakalpojumu sniedzēji.'),
          clause('5.2.', 'TŪRISMA OPERATORAM ir pienākums bez nepamatotas kavēšanās sniegt palīdzību (atbalstu) CEĻOTĀJAM, ja tas ir nonācis grūtībā, jo īpaši:'),
          clause('5.2.1.', 'sniegt informāciju par veselības aprūpes pakalpojumiem, vietējām iestādēm un konsulāro palīdzību;', 2),
          clause('5.2.2.', 'palīdzēt izmantot distances saziņas līdzeļus un atrast alternatīvus CEĻOJUMA risinājumus;', 2),
          clause('5.2.3.', 'sniegt citu palīdzību tostarp, kamēr nenovēršamu un ārkārtas apstākļu dēļ nebūs iespējams nodrošināt CEĻOTĀJA atgriešanos.', 2),
          clause('5.3.', 'TŪRISMA OPERATORS ir tiesīgs iekasēt saprātīgu maksu par LĪGUMA 5.2.punktā minēto palīdzību, ja grūtības ir izraisījis pats CEĻOTĀJS ar ļaunu nolūku vai tās radušās viņa neuzmanības dēļ. Minētā maksa nepārsniegs faktiskās izmaksas, kas radušās TŪRISMA OPERATORAM.'),
          clause('5.4.', 'TŪRISMA OPERATORS nav atbildīgs par zaudējumiem, ko radījušas dabas katastrofas vai citi neparedzami apstākļi, no kuriem TŪRISMA OPERATORS nespēj izvairīties, lai cik rūpīgi censtos. Minētie apstākļi var būt karš, dabas katastrofa, infekcijas slimība, streiks un citi notikumi (force majeure).'),
          clause('5.5.', 'Ja CEĻOTĀJS realizē LĪGUMA 4.9.punktā noteiktās tiesības nodot LĪGUMU citai personai, TŪRISMA OPERATORAM ir pienākums informēt personu, kas nodod LĪGUMU, par nodošanas faktiskajām izmaksām. Minētās izmaksas ir samērīgas un tās nepārsniedz faktiskās izmaksas, kas TŪRISMA OPERATORAM rodas LĪGUMA nodošanas dēļ.'),
          clause('5.6.', 'TŪRISMA OPERATORAM ir nodrošinājums saistību neizpildes vai nepienācīgas izpildes gadījumā tūrisma operatora likviditātes problēmu gadījumā. Nodrošinājuma izsniedzējs ir AS Swedbank Reģ.Nr. 40003074764, Balasta dambis 15, Rīga, LV-1048, info@swedbank. Patērētāju tiesību aizsardzības centra kontaktinformācija: Rīga, Brīvības iela 55, LV – 1010, e-pasta adrese: pasts@ptac.gov.lv; konsultāciju tālrunis: 65452554.'),
          clause('5.7.', 'Ja LĪGUMS ietver izmitināšanu un, pamatojoties uz LĪGUMU ceļo nepilngadīgais, kuru nepavada vecāks vai cita pilnvarota persona, par nepilngadīgo atbildīga viņa uzturēšanās laikā ir persona_________ (norāda personas vārdu un uzvārdu), kontaktinformācija ___________ (norāda informāciju, kas ļauj tieši sazināties ar nepilngadīgo).'),
          clause('5.8.', 'TŪRISMA OPERATORS apņemas ziņas par CEĻOTĀJU izmantot tikai CEĻOJUMAM nepieciešamo dokumentu noformēšanai, CEĻOJUMA nodrošināšanai un LĪGUMA IZPILDEI. Trešajām personām ziņas par CEĻOTĀJU izpaust tikai, pamatojoties uz rakstisku pieprasījumu un tikai ārējos normatīvajos aktos noteiktajos gadījumos. TŪRISMA OPERATORS apņemas apstrādāt CEĻOTĀJU personas datus saskaņā ar Latvijas Republikas un Eiropas Savienības normatīvo aktu prasībām fizisko personas datu aizsardzības jomā.'),
          clause('5.9.', 'TŪRISMA OPERATORS pirms CEĻOJUMA ir tiesīgs vienpusēji mainīt LĪGUMA noteikumus, tikai tādā gadījumā, ja izmaiņas ir nenozīmīgas un TŪRISMA OPERATORS par izmaiņām ir informējis CEĻOTĀJU skaidrā, saprotamā un uzskatāmā veidā.'),
          gap(),

          // ── 6. NEPĀRVARAMA VARA ─────────────────────────────────────────
          heading('6. NEPĀRVARAMA VARA'),
          clause('6.1.', 'Neviena no Pusēm nav tiesīga prasīt kompensāciju par zaudējumiem, ja līgumsaistības daļēji vai pilnībā nav izpildītas nenovēršanu un ārkārtas apstākļu dēļ (par nenovēršamiem un ārkārtas apstākļiem uzskatāma tai skaitā karadarbība, terorisms, nopietnas slimības uzliesmojums, dabas katastrofas un citi notikumi, kas nav radušies PUŠU vai tā kontrolē esošas trešās personas kļūdas vai rīcības dēļ, notikumi, kas padara nepiespējamu līgumsaistību izpildi, notikumi, kurus LĪGUMA slēgšanas brīdī nebija iespējams paredzēt, no kuriem nav iespējams izvairīties, kuru sekas nav iespējams pārvarēt).'),
          para('Par kompensāciju par zaudējumiem LĪGUMA izpratnē nav uzskatāmi CEĻOTĀJA veiktie maksājumi par CEĻOJUMU. Nenovēršamu un ārkārtas apstākļu gadījumos PUSES rīkojas atbilstoši šim LĪGUMAM, normatīvo aktu prasībām, kā arī labas ticības un godīgas darījumu prakses principiem.'),
          gap(),

          // ── 7. STRĪDU RISINĀŠANA ────────────────────────────────────────
          heading('7. STRĪDU RISINĀŠANA'),
          clause('7.1.', 'Ja CEĻOTĀJAM ir sūdzības vai iebildumi par nepienācīgu LĪGUMA izpildi, CEĻOTĀJS nekavējoties paziņo par to TŪRISMA OPERATORA vietējam pārstāvim vai grupas vadītājam. Ja strīdu neizdodas atrisināt pārrunu ceļā, CEĻOTĀJS iesniedz rakstveida pretenziju. Pretenziju sastāda divos eksemplāros. TŪRISMA OPERATORA vietējais pārstāvis vai grupas vadītājs parakstās par saņemto pretenziju uz abiem eksemplāriem, un viens eksemplārs paliek pie CEĻOTĀJA, otrs – pie TŪRISMA OPERATORA pārstāvja. Gadījumā, ja strīdu neizdodas atrisināt uz vietas, CEĻOTĀJAM rakstisks iesniegums jāiesniedz TŪRISMA OPERATORAM, nogādājot to uz adresi Turaidas iela 110 k-2 - 47, Jūrmala, LV-2015, Latvija, vēlams 10 kalendāro dienu laikā, bet saskaņā ar Patērētāju tiesību aizsardzības likuma 27.panta pirmās daļas prasībām ne vēlāk kā divu mēnešu laikā no dienas, kad CEĻOTĀJS atklājis tūrisma pakalpojuma neatbilstību LĪGUMA noteikumiem.'),
          clause('7.2.', 'Ja TŪRISMA OPERATORS atsakās izpildīt CEĻOTĀJA prasījumu vai CEĻOTĀJU neapmierina TŪRISMA OPERATORA piedāvātais risinājums, CEĻOTĀJAM ir tiesības vērsties: 1) Patērētāju tiesību aizsardzības centrā, lai saņemtu palīdzību strīda risināšanā; 2) patērētāju strīdu risināšanas komisijā, ja Patērētāju tiesību aizsardzības centrā patērētājam sniegtā palīdzība strīda risināšanā nav nodrošinājusi rezultātu; 3) tiesā.'),
          clause('7.3.', 'CEĻOTĀJAM ir iespēja arī izmantot platformu strīdus izšķiršanai tiešsaistē saskaņā ar Eiropas Parlamenta un Padomes 2013.gada 21.maija Regulu (ES) Nr. 524/2013 par patērētāju strīdu izšķiršanu tiešsaistē un ar ko groza Regulu (EK) Nr. 2006/2004 un Direktīvu 2009/22/EK (Regula par patērētāju SIT); minētā platforma pieejama šeit: https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=LV.'),
          clause('7.4.', 'Visi strīdi vai domstarpības, kas saistīti vai izriet no šā LĪGUMA, tiek risināti sarunu ceļā. Ja domstarpības un strīdu nav iespējams atrisināt sarunu ceļā, ieinteresētā PUSE to nodod izskatīšanai tiesā Latvijas Republikas normatīvajos aktos noteiktajā kārtībā.'),
          gap(),

          // ── 8. PĀRĒJIE LĪGUMA NOTEIKUMI ────────────────────────────────
          heading('8. PĀRĒJIE LĪGUMA NOTEIKUMI'),
          clause('8.1.', 'LĪGUMS stājas spēkā pēc priekšapmaksas maksājuma veikšanas, un tas tiek uzskatīts par CEĻOTĀJA piekrišanu līguma nosacījumiem. LĪGUMS ir derīgs bez paraksta.'),
          clause('8.2.', 'Jebkuri LĪGUMA grozījumi un/vai papildinājumi, kas nav atrunāti LĪGUMA noteikumos, izdarāmi PUSĒM savstarpēji vienojoties.'),
          clause('8.3.', 'PUSES apņemas nekavējoties rakstveidā informēt viena otru par jebkuru savu LĪGUMĀ norādīto rekvizītu u.c. LĪGUMĀ norādīto ziņu maiņu.'),
          clause('8.4.', 'Jautājumi, kas netiek reglamentēti šajā LĪGUMĀ, tiek risināti atbilstoši Latvijas Republikas spēkā esošām tiesību normām.'),

        ],
      },
    ],
  });
}
