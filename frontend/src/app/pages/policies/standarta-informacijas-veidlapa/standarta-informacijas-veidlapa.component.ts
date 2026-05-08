import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standarta-informacijas-veidlapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="policy-page">
      <div class="policy-header text-center">
        <div class="container">
          <h1 class="policy-title">STANDARTA INFORMĀCIJAS VEIDLAPA</h1>
        </div>
      </div>

      <div class="container policy-body">
        <div class="policy-content mx-auto">

          <p>Jums piedāvātais tūrisma pakalpojumu kopums ir komplekss tūrisma pakalpojums Tūrisma likuma un Ministru kabineta 2018. gada 26. jūnija noteikumu Nr. 380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" izpratnē.</p>
          <p>Jūs varēsiet izmantot visas Tūrisma likumā un Ministru kabineta 2018. gada 26. jūnija noteikumos Nr. 380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" minētās tiesības, kas attiecas uz kompleksiem tūrisma pakalpojumiem.</p>
          <p>"Brīva Diena" SIA Reģ. Nr. 40203699357 būs pilnībā atbildīgs par kompleksā tūrisma pakalpojuma pienācīgu sniegšanu kopumā.</p>
          <p>Saskaņā ar tiesību aktu prasībām "Brīva Diena" SIA ir nodrošinājums, lai gadījumā, ja tas savu likviditātes problēmu dēļ nepilnīgi izpilda vai neizpilda savas saistības, atlīdzinātu Jūsu maksājumus un, ja kompleksajā tūrisma pakalpojumā ir ietverts transports, – nodrošinātu Jūsu repatriāciju.</p>
          <p>Plašāka informācija par Tūrisma likumā un Ministru kabineta 2018. gada 26. jūnija noteikumos Nr. 380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem" paredzētajām pamattiesībām šeit.</p>

          <h2>Pamattiesības saskaņā ar Tūrisma likumu un Ministru kabineta 2018. gada 26. jūnija noteikumiem Nr. 380</h2>
          <p>"Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumiem":</p>

          <ul>
            <li>ceļotājs pirms kompleksā tūrisma pakalpojuma līguma noslēgšanas saņem visu būtisko informāciju par komplekso tūrisma pakalpojumu;</li>
            <li>vienmēr ir vismaz viens tūrisma pakalpojuma sniedzējs, kurš ir atbildīgs par to, lai visi līgumā ietvertie tūrisma pakalpojumi tiktu sniegti pienācīgi;</li>
            <li>ceļotājam izsniedz tālruņa numuru saziņai ārkārtas gadījumos vai informāciju par kontaktpunktu, kurā viņš var sazināties ar tūrisma operatoru;</li>
            <li>ceļotājs, par to paziņojot saprātīgā termiņā, var nodot komplekso tūrisma pakalpojumu citai personai (par to var paredzēt pienākumu segt papildu izmaksas);</li>
            <li>kompleksā tūrisma pakalpojuma cenu var palielināt tikai tad, ja pieaug noteiktas izmaksas (piemēram, degvielas cenas) un ja tas ir skaidri paredzēts kompleksā tūrisma pakalpojuma līgumā, un jebkurā gadījumā ne vēlāk kā 20 dienas pirms kompleksā tūrisma pakalpojuma sākuma. Ja cenas palielinājums pārsniedz 8 % no kompleksā tūrisma pakalpojuma cenas, ceļotājs var izbeigt līgumu. Ja tūrisma operators sev patur tiesības palielināt cenu, ceļotājam ir tiesības uz cenas samazinājumu, ja samazinās attiecīgās izmaksas;</li>
            <li>ceļotājs var izbeigt kompleksā tūrisma pakalpojuma līgumu, nemaksājot nekādu izbeigšanas maksu, un saņemt veikto maksājumu pilnu atmaksu, ja ievērojami tiek mainīts jebkurš no kompleksā tūrisma pakalpojuma būtiskajiem elementiem, izņemot cenu. Ja pirms kompleksā tūrisma pakalpojuma sākuma par komplekso tūrisma pakalpojumu atbildīgais tūrisma pakalpojumu sniedzējs atceļ komplekso tūrisma pakalpojumu, ceļotājam ir tiesības saņemt atmaksu un – attiecīgā gadījumā – kompensāciju;</li>
            <li>ceļotājs ārkārtas gadījumos pirms kompleksā pakalpojuma sākuma var izbeigt kompleksā tūrisma pakalpojuma līgumu, nemaksājot nekādu izbeigšanas maksu, piemēram, ja galamērķa vietā pastāv nopietnas drošības problēmas, kuras, visticamāk, ietekmētu komplekso tūrisma pakalpojumu;</li>
            <li>ceļotājs jebkurā laikā pirms kompleksā tūrisma pakalpojuma sākuma var izbeigt līgumu, samaksājot samērīgu un pamatojamu izbeigšanas maksu;</li>
            <li>ja pēc kompleksā tūrisma pakalpojuma sākuma nozīmīgus kompleksā tūrisma pakalpojuma elementus nevar sniegt tā, kā paredz vienošanās, bez papildu maksas jāpiedāvā ceļotājam atbilstoši alternatīvi risinājumi. Ceļotājs var izbeigt kompleksā tūrisma pakalpojuma līgumu, nemaksājot izbeigšanas maksu, ja pakalpojumi netiek sniegti saskaņā ar līgumu un tas būtiski ietekmē kompleksā tūrisma pakalpojuma izpildi, un tūrisma operators nenovērš problēmu;</li>
            <li>ceļotājam ir tiesības uz cenas samazinājumu vai kompensāciju par zaudējumiem, ja tūrisma pakalpojumi netiek sniegti vai tiek sniegti neatbilstoši;</li>
            <li>ja ceļotājs nonāk grūtībās, tūrisma operatoram ir pienākums nodrošināt palīdzību;</li>
            <li>ja tūrisma operators savu likviditātes problēmu dēļ daļēji vai pilnībā nespēj pildīt savas saistības, ceļotāja veiktie maksājumi tiek atmaksāti. Ja tūrisma operators pēc kompleksā tūrisma pakalpojuma sākuma savu likviditātes problēmu dēļ daļēji vai pilnībā nespēj pildīt savas saistības un transports ir iekļauts kompleksajā tūrisma pakalpojumā, tiek nodrošināta ceļotāja repatriācija.</li>
          </ul>

          <p>"Brīva Diena" SIA ir nodrošinājums, ko gadījumā, ja tas savu likviditātes problēmu dēļ nepilnīgi izpilda vai neizpilda savas saistības, nodrošina "Swedbank" AS un Patērētāju tiesību aizsardzības centrs. Ja "Brīva Diena" SIA nespēj pilnībā vai daļēji pildīt savas saistības un sniegt attiecīgos pakalpojumus savu likviditātes problēmu dēļ, ceļotājs var sazināties ar Patērētāju tiesību aizsardzības centru Brīvības ielā 55, Rīgā, LV – 1010, <a href="mailto:pasts@ptac.gov.lv">pasts&#64;ptac.gov.lv</a>, tel. 65452554.</p>

          <p>Tūrisma likums un Ministru kabineta 2018.gada 26.jūnija noteikumi Nr. 380 "Noteikumi par kompleksa un saistīta tūrisma pakalpojuma sagatavošanas un sniegšanas kārtību un kompleksu un saistītu tūrisma pakalpojumu sniedzēju un ceļotāju tiesībām un pienākumi":
          <a href="https://www.likumi.lv" target="_blank" rel="noopener noreferrer">www.likumi.lv</a> –
          <a href="https://likumi.lv/doc.php?id=50026" target="_blank" rel="noopener noreferrer">Tūrisma likums</a> un
          <a href="https://likumi.lv/ta/id/300021-noteikumi-parkompleksa-un-saistita-turisma-pakalpojuma-sagatavosanas-un-sniegsanaskartibu-un-kompleksu-un-saistitu-turisma" target="_blank" rel="noopener noreferrer">Ministru kabineta 2018.gada 26.jūnija noteikumi Nr. 380</a>.</p>

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

    .policy-content ul {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    .policy-content ul li {
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
export class StandartatInformacijasVeidlapaComponent {}
