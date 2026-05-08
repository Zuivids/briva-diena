import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pirmsliguma-informacija',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-page">
      <div class="policy-header text-center">
        <div class="container">
          <h1 class="policy-title">PIRMSLĪGUMA INFORMĀCIJA</h1>
        </div>
      </div>

      <div class="container policy-body">
        <div class="policy-content mx-auto">

          <p>Cien. klient,</p>
          <p>Lūdzam pirms līguma slēgšanas iepazīties ar pirmslīguma informāciju:</p>
          <p>Jums piedāvātais tūrisma pakalpojumu kopums ir komplekss tūrisma pakalpojums Tūrisma likuma un Ministru kabineta 2018.gada 26.jūnija noteikumu Nr.380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" izpratnē.</p>
          <p>Jūs varēsiet izmantot visas Tūrisma likumā un Ministru kabineta 2018.gada 26.jūnija noteikumos Nr.380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" minētās tiesības, kas attiecas uz kompleksiem tūrisma pakalpojumiem.</p>
          <p>"Brīva Diena" SIA Reģ. Nr. 40203699357 būs pilnībā atbildīga par kompleksā tūrisma pakalpojuma pienācīgu sniegšanu kopumā. Saskaņā ar tiesību aktu prasībām "Brīva Diena" SIA Reģ. Nr. 40203699357 ir nodrošinājums, lai gadījumā, ja tas savu likviditātes problēmu dēļ nepilnīgi izpilda vai neizpilda savas saistības, atlīdzinātu Jūsu maksājumus un, ja kompleksajā tūrisma pakalpojumā ir ietverts transports, - nodrošinātu Jūsu repatriāciju.</p>
          <p>Plašāka informācija par Tūrisma likumā un Ministru kabineta 2018.gada 26.jūnija noteikumos Nr.380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" paredzētajām pamattiesībām <a href="https://likumi.lv/doc.php?id=50026" target="_blank" rel="noopener noreferrer">https://likumi.lv/doc.php?id=50026</a> un Ministru kabineta 2018.gada 26.jūnija noteikumiem Nr. 380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" - <a href="https://likumi.lv/ta/id/300021-noteikumi-par-kompleksa-un-saistita-turisma-pakalpojuma-sagatavosanas-un-sniegsanas-kartibu-un-kompleksu-un-saistitu-turisma" target="_blank" rel="noopener noreferrer">https://likumi.lv/ta/id/300021</a>.</p>

          <p>Galvenās katra tūrisma ceļojuma īpašības un noteikumi ir detalizēti norādīti katra Ceļojuma programmā, kas ir nosūtīti ceļotājam ceļojuma programmas veidā.</p>
          <p>Ceļojuma programmās ir norādīts:</p>

          <ol>
            <li>ceļojuma galamērķis, maršruts, uzturēšanās laiks (ceļojuma datumi), un, ja ir iekļauta izmitināšana, iekļauto nakšu skaits;</li>
            <li>transportlīdzekļa veids, kategorija un ērtību raksturojums, izbraukšanas, iespējamās iekāpšanas un atgriešanās vietas, datumi un laiks, apstāšanās un pārsēšanās laiki un vietas. Ja precīzs laiks vēl nav noteikts, tūrisma operators un, ja attiecināms, tūrisma aģents informē ceļotāju par aptuveno izbraukšanas un atgriešanās laiku.</li>
            <li>tūristu mītnes atrašanās vieta, galvenās īpašības un - attiecīgā gadījumā - kategorija saskaņā ar attiecīgās galamērķa valsts noteikumiem;</li>
            <li>paredzētās ēdienreizes;</li>
            <li>apmeklējumi, ekskursijas vai citi pakalpojumi, kas ietverti kompleksā tūrisma pakalpojuma kopējā cenā;</li>
            <li>informācija par to, vai kādu no tūrisma pakalpojumiem ceļotājam sniegs kā grupas dalībniekam, un informācija par aptuveno grupas lielumu, ja tas ir iespējams;</li>
            <li>ja ceļotāja gūto labumu no citu tūrisma pakalpojumu izpildes ietekmē efektīva mutiskā saziņa, – valoda, kurā minētos pakalpojumus sniegs;</li>
            <li>informācija par to, vai tūrisma pakalpojums ir piemērots personām ar ierobežotām pārvietošanās spējām, par precīzu informāciju par kompleksā tūrisma pakalpojuma piemērotību, ņemot vērā ceļotāja vajadzības, lūdzam interesēties individuāli, pirms līguma noslēgšanas;</li>
            <li>tūrisma operatora un, ja attiecināms, tūrisma aģenta nosaukums (firma) un faktiskā adrese, kā arī tālruņa numurs un elektroniskā pasta adrese;</li>
            <li>kompleksā tūrisma pakalpojuma kopējā cena, ieskaitot nodokļus un visas papildu maksas, maksājumus un citas izmaksas, vai, ja minētās izmaksas nevar pamatoti aprēķināt pirms līguma noslēgšanas, – norāde par to, kāda veida papildu izmaksas ceļotājam vēl varētu nākties segt;</li>
            <li>maksāšanas kārtība, tostarp jebkāda summa vai cenas procentuālā daļa, kas jāmaksā kā pirmais maksājums, un atlikušās daļas samaksas grafiks vai finanšu garantijas, kas ceļotājam jāmaksā vai jānodrošina;</li>
            <li>Par minimālo ceļojuma dalībnieku skaitu, kas nepieciešams kompleksā tūrisma pakalpojuma sniegšanai, – lūdzam interesēties individuāli, pirms pakalpojumu līgumu noslēgšanas. Tiklīdz ir sasniegts minimālais nepieciešamais dalībnieku skaits, pie ceļojuma programmā noradīto brīvo vietu skaita tiek pielikta atzīme "garantēts". Termiņš pirms kompleksā tūrisma pakalpojuma sākuma, kurā iespējams izbeigt kompleksā tūrisma pakalpojuma līgumu, ja minētais dalībnieku skaits nav sasniegts, norādīts līgumā. Kompleksā tūrisma pakalpojuma sākums ir brīdis, kad sāk sniegt tūrisma pakalpojumus, kas iekļauti kompleksajā tūrisma pakalpojumā.</li>
            <li>vispārīga informācija par galamērķa valsts pasu un vīzu režīmu, tostarp par to, cik ilgā laikā (aptuveni) var saņemt vīzu, un informācija par galamērķa valsts medicīniskajām formalitātēm;</li>
            <li>informācija par to, ka ceļotājs jebkurā brīdī pirms kompleksā tūrisma pakalpojuma sākuma var izbeigt kompleksā tūrisma pakalpojuma līgumu, samaksājot samērīgu līguma izbeigšanas maksu vai – attiecīgā gadījumā – tūrisma operatora pieprasīto standarta līguma izbeigšanas maksu;</li>
            <li>informācija par brīvprātīgu vai obligātu apdrošināšanu, lai segtu kompleksā tūrisma pakalpojuma līguma izbeigšanas izmaksas, ja līgumu izbeidz ceļotājs, vai palīdzības izmaksas (ieskaitot repatriāciju) negadījuma, slimības vai nāves gadījumā.</li>
          </ol>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-page {
      min-height: 100vh;
    }

    .policy-header {
      color: #5C4033;
      padding: 60px 0 40px;
    }

    .policy-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .policy-body {
      padding: 48px 16px 64px;
    }

    .policy-content {
      max-width: 860px;
    }

    .policy-content p {
      margin-bottom: 1rem;
      line-height: 1.7;
      color: #333;
    }

    .policy-content h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 2rem 0 0.75rem;
      color: #2c3e50;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 6px;
    }

    .policy-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.5rem;
      color: #34495e;
    }

    .policy-content ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    .policy-content ol li {
      margin-bottom: 0.75rem;
      line-height: 1.7;
      color: #333;
    }

    .policy-content a {
      color: #2c3e50;
      word-break: break-all;
    }

    .policy-content a:hover {
      color: #5C4033;
    }

    @media (max-width: 600px) {
      .policy-title {
        font-size: 1.6rem;
      }
    }
  `]
})
export class PirmsligumainformacijaComponent {}
