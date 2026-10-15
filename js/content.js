/* ==========================================================================
   Khyber-1 FLM Induction — CONTENT & SETTINGS
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to change the programme.
   - CONFIG   : rules (reading speed, pass mark, timer, attempts, admin code)
   - MODULES  : the reading material (HTML allowed in `body`)
   - QUESTIONS: the quiz bank. `answer` is the index (0-based) of the
                correct option. `module` links a question to the module it
                tests — each attempt draws questions evenly across modules.

   Source: "Induction Training Product Presentations\Khyber - 1"
   (Esso-NS.pptx, ESSO.ppt, Mionex.pptx, Pegalin CR training.pptx,
   Tepride training.pptx, pain killers.docx, detailing aids and dropcards).
   Khyber-1 portfolio: Esso 40mg Capsule, Esso-NS, Mionex Tablet,
   Pegalin-CR Tablet, Tepride Tablet.
   ========================================================================== */

window.CONFIG = {
  programmeTitle: "Khyber-1 First Line Manager Induction",
  teamName: "Khyber-1",
  companyName: "Shaigan Pharmaceuticals (Pvt.) Limited",

  // Minimum ACTIVE reading time per module is calculated from its word count.
  // Lower wpm = more time required. Each module also needs at least minSecondsPerModule.
  readingSpeedWpm: 200,
  minSecondsPerModule: 90,
  // Extra study time added to EVERY module's minimum (on top of the word-count time).
  extraSecondsPerModule: 90,

  // Team options offered at sign-up (managers can also type their own).
  teams: ["Khyber-1","Khyber-2","Khyber-3","Elantis"],

  // If the manager has no mouse/keyboard/scroll activity for this many seconds,
  // the timer pauses (stops people leaving a module open and walking away).
  idleTimeoutSeconds: 90,

  // FINAL ASSESSMENT — covers every module.
  quiz: {
    questionsPerAttempt: 50,   // drawn evenly across all modules from QUESTIONS
    timeLimitMinutes: 30,
    passPercent: 70,
    maxAttempts: 3,            // the admin portal can grant extra attempts per manager
    minSecondsPerQuestion: 4,  // answering faster than this on average is flagged as "rushed"
    // false = the clock keeps running if the manager closes the page mid-quiz
    // (stops people closing the quiz to look up answers). true = it pauses.
    timerPausesWhenClosed: false
  },

  // MODULE QUIZ — a short knowledge check unlocked as soon as a module's reading is complete.
  moduleQuiz: {
    questions: 10,             // per attempt, drawn from that module's questions
    secondsPerQuestion: 60,    // time limit = questions × this
    passPercent: 70,
    maxAttempts: 3,            // 0 = unlimited retakes
    timerPausesWhenClosed: true // resumes with the same time left after closing the page
  },

  // true = the final assessment also requires every module quiz to be passed
  // (otherwise the attempt is recorded as FAIL, like skipping the reading).
  requireModuleQuizzesForFinal: false,

  // How often progress is synced to the cloud while a manager is active (seconds).
  syncSeconds: 20,

  // Admin portal passcode — used ONLY in Local mode (no Firebase configured).
  // In Cloud mode admins sign in with their Firebase email + password instead.
  adminPasscode: "khyber1admin"
};

window.MODULES = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: "m1",
    title: "Welcome & the Khyber-1 Portfolio",
    summary: "The five Khyber-1 brands at a glance and how this induction works.",
    body: `
      <p>Welcome to the <strong>Khyber-1</strong> team of <strong>Shaigan Pharmaceuticals</strong>.
      As a First Line Manager you will coach your Territory Managers on these brands every day in the
      field, so you must know each product better than anyone in your team: its composition, how it
      works, who it is for, how it is dosed and why a doctor should choose it over the competition.</p>

      <p>This induction is built entirely on the official Khyber-1 product training presentations and
      detailing literature. Read every module carefully — the assessment at the end is drawn from all of them.</p>

      <h3>The Khyber-1 portfolio</h3>
      <table>
        <tr><th>Brand</th><th>Composition</th><th>Class / therapy area</th><th>Core use</th></tr>
        <tr><td><strong>Esso 40</strong> Capsule</td><td>Esomeprazole 40 mg</td><td>Proton pump inhibitor (PPI) — gastroenterology</td><td>GERD, peptic ulcer, NSAID-ulcer healing &amp; prevention, H. pylori</td></tr>
        <tr><td><strong>Esso-NS</strong> Tablet</td><td>Naproxen sodium + Esomeprazole (375/20 and 500/20 Forte)</td><td>NSAID + PPI fixed-dose combination — pain / rheumatology</td><td>OA, RA, ankylosing spondylitis, low back pain in patients at risk of NSAID ulcers</td></tr>
        <tr><td><strong>Mionex</strong> Tablet</td><td>Moxifloxacin 400 mg</td><td>Fluoroquinolone antibiotic (3rd generation)</td><td>Respiratory, skin and intra-abdominal infections</td></tr>
        <tr><td><strong>Pegalin-CR</strong> Tablet</td><td>Pregabalin controlled / extended release (82.5, 165, 330 mg)</td><td>α2δ ligand — neuropathic pain</td><td>Diabetic neuropathy, post-herpetic neuralgia, fibromyalgia, seizures (adjunct)</td></tr>
        <tr><td><strong>Tepride</strong> Tablet</td><td>Itopride hydrochloride 50 mg</td><td>Prokinetic — gastroenterology</td><td>Functional dyspepsia, GERD symptoms, bloating, early satiety, nausea/vomiting</td></tr>
      </table>

      <h3>How the brands connect</h3>
      <ul>
        <li><strong>Esso 40</strong> and <strong>Tepride</strong> both serve the gastroenterology / GP stomach-complaint patient — one controls acid, the other restores motility.</li>
        <li><strong>Esso-NS</strong> bridges pain and gastroprotection: it is the NSAID patient's painkiller with Esso's acid control built in.</li>
        <li><strong>Pegalin-CR</strong> covers the nerve-pain patient whom NSAIDs do not help — so pain specialists, orthopaedic surgeons, neurologists and diabetologists see both Esso-NS and Pegalin-CR.</li>
        <li><strong>Mionex</strong> is the team's anti-infective for chest physicians, ENT, GPs, surgeons and diabetic-foot clinics.</li>
      </ul>

      <h3>The brand taglines</h3>
      <ul>
        <li>Esso — <em>"Healthy Life, Healthy Stomach"</em></li>
        <li>Mionex — <em>"Ultimate Care"</em></li>
        <li>Pegalin-CR — <em>"Challenge Resolved"</em></li>
        <li>Tepride — <em>"Happy Tummy"</em></li>
      </ul>

      <h3>How this induction works</h3>
      <p>Modules 2 and 3 give the science you need (pain &amp; NSAIDs, stomach acid &amp; PPIs). Modules 4–8
      cover each brand. Each module has a minimum reading time and must be read to the end before the
      quiz. If you attempt the quiz without completing the reading, your attempt is recorded as a fail.</p>
    `
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: "m2",
    title: "Science Background: Pain, Inflammation & NSAIDs",
    summary: "Musculoskeletal disorders, the COX pathway and why NSAIDs damage the stomach.",
    body: `
      <h3>What are NSAIDs?</h3>
      <p>Non-steroidal anti-inflammatory drugs (NSAIDs) are among the most commonly used medicines in the
      world. They relieve pain, reduce inflammation and bring down fever, and are used for headaches,
      painful periods, sprains and strains. About <strong>17 million people</strong> use them regularly,
      around 50% of them over the age of 50–60, and the number is increasing. Of regular users,
      <strong>5% to 7% are admitted to hospital</strong>. Familiar NSAIDs include celecoxib, ibuprofen,
      naproxen, diclofenac and piroxicam.</p>

      <h3>The four main actions of NSAIDs</h3>
      <ul>
        <li><strong>Analgesic</strong> — effective against mild to moderate pain and do <em>not</em> cause dependence.</li>
        <li><strong>Anti-inflammatory</strong> — reduce inflammation (swelling).</li>
        <li><strong>Anti-pyretic</strong> — reduce fever.</li>
        <li><strong>Anti-platelet</strong> — prevent thromboxane production (derived from prostaglandins), which causes platelet aggregation.</li>
      </ul>
      <p>They are also useful in <strong>dysmenorrhoea</strong>, which is associated with increased prostaglandin synthesis and uterine contractility.</p>

      <h3>The musculoskeletal system</h3>
      <p>The skeletal system is the framework of <strong>206 bones</strong>, skeletal muscles, cartilage, tendons,
      joints and connective tissue. Joints are classed as immovable (fibrous), partly movable (cartilaginous)
      or movable (<strong>synovial</strong>). Synovial joints — knee, wrist, hip — allow the greatest flexibility.
      Synovial fluid reduces friction, absorbs shock and transports nutrients to and waste from bone.</p>
      <p>Symptoms of bone and joint disorders: pain, swelling, redness, heat, stiffness, joint noises, difficulty moving and loss of function.</p>

      <h3>Key pathologies (the Esso-NS patient)</h3>
      <table>
        <tr><th>Osteoarthritis (OA)</th><th>Rheumatoid arthritis (RA)</th></tr>
        <tr><td>Usually begins after age 40</td><td>Can begin after age 25</td></tr>
        <tr><td>Develops slowly, over several years</td><td>Often develops suddenly, within weeks or months</td></tr>
        <tr><td>Often starts on one side of the body</td><td>Usually affects the same joints on both sides (symmetrical)</td></tr>
        <tr><td>Usually little inflammation in the joint</td><td>Causes inflammation (redness, warmth, swelling)</td></tr>
        <tr><td>Affects weight-bearing joints; cartilage is progressively eroded and thinned</td><td>Starts in small joints; chronic systemic disease with progressive joint damage</td></tr>
        <tr><td>No general feeling of sickness</td><td>Often fatigue, weight loss and fever</td></tr>
      </table>
      <ul>
        <li><strong>Ankylosing spondylitis (AS)</strong> — arthritis of the spine; spinal joints and ligaments become inflamed and stiff, sometimes involving hips, shoulders, knees and ankles.</li>
        <li><strong>Gout</strong> — sudden, severe attacks of pain, swelling, redness and tenderness, usually in the big toe.</li>
        <li><strong>Low back pain</strong> — causes include heavy lifting, trauma, poor sitting posture, frequent bending forward, degenerative conditions/arthritis and non-mechanical disease (e.g. kidney stones).</li>
      </ul>

      <h3>Acute vs chronic pain</h3>
      <p>Pain is an unpleasant sensation due to tissue damage or injury. <strong>Acute pain</strong> has a sudden
      onset and lasts <strong>less than three months</strong> (e.g. gout). <strong>Chronic pain</strong> lasts
      <strong>longer than three months</strong> and is mild to moderate (e.g. OA, RA, AS).</p>

      <h3>How NSAIDs work — the COX pathway</h3>
      <p>After tissue injury, <strong>arachidonic acid</strong> is released from cell membranes. The enzyme
      <strong>cyclo-oxygenase (COX)</strong> converts it into <strong>prostaglandins</strong>, which cause
      vasodilation and increased vascular permeability — producing redness, swelling and pain. NSAIDs inhibit COX.
      There are two isoforms:</p>
      <table>
        <tr><th>COX-1 — "homeostatic"</th><th>COX-2 — "pathologic"</th></tr>
        <tr><td>Protects the gastric mucosa, supports platelet activation and maintains blood supply to the kidney</td><td>Drives inflammation, pain and fever</td></tr>
      </table>
      <p>So blocking <strong>COX-2</strong> gives the therapeutic effect, while blocking <strong>COX-1</strong> causes the
      unwanted side effects. Most traditional NSAIDs inhibit COX-1 more than COX-2. <strong>Aspirin</strong> is the only
      <em>irreversible</em> COX inhibitor (it acetylates the enzyme) — the basis of its use to prevent heart attacks;
      all other NSAIDs are reversible. Selective COX-2 inhibitors ("coxibs", e.g. celecoxib) spare COX-1 but have been linked
      to higher cardiovascular risk, because they unbalance thromboxane (platelet, COX-1) against prostacyclin (vessel wall, COX-2).</p>

      <h3>Why NSAIDs damage the stomach</h3>
      <p>By inhibiting prostaglandin synthesis, NSAIDs <strong>reduce bicarbonate and mucus production</strong> and
      leave <strong>HCl production uncontrolled</strong>, causing gastro-duodenal ulcers. Their acidic nature also
      directly injures the mucosal cells. GI adverse effects are <strong>dyspepsia, peptic ulcer disease and bleeding</strong>.
      Studies have shown a prevalence of <strong>14%–25% gastric and duodenal ulcers in NSAID users</strong>.</p>
      <p><strong>Key message:</strong> the patient on regular NSAIDs needs <em>an effective NSAID plus GI safety</em> — exactly what Esso-NS delivers.</p>
    `
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: "m3",
    title: "Science Background: Stomach Acid, PPIs & Acid Peptic Disorders",
    summary: "How the parietal cell makes HCl, how PPIs block it, and what goes wrong.",
    body: `
      <h3>Gastric secretions</h3>
      <p>Gastric juice is a mixture of water, <strong>hydrochloric acid (HCl)</strong>, electrolytes (Na⁺, K⁺, Ca²⁺,
      PO₄, SO₄, HCO₃⁻), mucus and pepsin. A <strong>mucosal lining and coating</strong> protects the gut wall from
      damage by HCl.</p>

      <h3>The HCl mechanism in the parietal cell</h3>
      <ol>
        <li>Deoxygenated blood is rich in CO₂, which diffuses into the <strong>parietal cell</strong> and reacts with water to form carbonic acid (H₂CO₃).</li>
        <li>The enzyme <strong>carbonic anhydrase</strong> splits carbonic acid into bicarbonate (HCO₃⁻) and a hydrogen ion (H⁺).</li>
        <li>The parietal cell carries receptors for <strong>gastrin, acetylcholine and histamine-2</strong>. When activated, they raise intracellular cAMP and calcium, which energise the <strong>proton pump (H⁺/K⁺-ATPase)</strong>.</li>
        <li>The proton pump pumps H⁺ out into the stomach lumen.</li>
        <li>Bicarbonate diffuses back into the blood; to keep the balance, chloride (Cl⁻) moves from the blood through the parietal cell into the lumen.</li>
        <li>H⁺ and Cl⁻ combine in the lumen to form <strong>HCl</strong>.</li>
      </ol>

      <h3>How proton pump inhibitors (PPIs) work</h3>
      <p>A PPI <strong>binds to the proton pump and blocks it</strong>, so H⁺ is no longer pumped into the lumen
      and HCl concentration falls. Because the proton pump is the <strong>final step</strong> of acid secretion,
      PPIs suppress acid whichever receptor (gastrin, acetylcholine or histamine) is driving it. The therapeutic
      target is to keep <strong>intragastric pH above 4</strong>.</p>

      <h3>Acid peptic disorders (APDs)</h3>
      <p>A peptic ulcer can form on the lining of the gut:</p>
      <ul>
        <li>Oesophagus — <strong>oesophagitis</strong></li>
        <li>Stomach — <strong>gastric ulcer</strong></li>
        <li>Duodenum — <strong>duodenal ulcer</strong></li>
      </ul>
      <p>Major causes include <strong>NSAIDs</strong> and <strong>Helicobacter pylori</strong>. Gastro-oesophageal
      reflux disease (<strong>GERD</strong>) is the commonest acid-related complaint in practice.</p>

      <h3>Treatment options for GI disorders</h3>
      <ul>
        <li>Lifestyle changes</li>
        <li>Antacids and antiflatulents</li>
        <li>H₂-receptor antagonists (e.g. cimetidine, ranitidine)</li>
        <li><strong>PPIs</strong> (e.g. esomeprazole — <strong>Esso</strong>)</li>
        <li><strong>Prokinetic agents</strong> (e.g. itopride — <strong>Tepride</strong>)</li>
        <li>Antidepressants (selected functional cases)</li>
      </ul>

      <h3>Lifestyle advice (non-pharmacological treatment)</h3>
      <p>Lifestyle modification alone helps about <strong>20% of patients</strong>:</p>
      <ul>
        <li>Weight loss and exercise; loose-fitting clothes; stop smoking.</li>
        <li>Avoid chocolate, alcohol, peppermint, fatty and spicy meals, citrus juices and cola.</li>
        <li>Eat smaller portions and avoid meals for 2 hours before lying down.</li>
        <li>Raise the head of the bed with a 6–8 inch block.</li>
      </ul>
    `
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: "m4",
    title: "Esso 40 Capsule (Esomeprazole 40 mg)",
    summary: "Strong, prolonged acid control — profile, indications, dosing and competitive edge.",
    body: `
      <figure><img src="assets/img/esso40-dropcard.jpg" alt="Esso 40 dropcard: strong and prolonged acid control, faster healing in GERD, pH above 4, once daily, triple-layer packaging" loading="lazy">
      <figcaption>Esso 40 dropcard — "Healthy Life, Healthy Stomach"</figcaption></figure>

      <h3>Product profile</h3>
      <table>
        <tr><th>Item</th><th>Esso 40</th></tr>
        <tr><td>Composition</td><td>Esomeprazole 40 mg capsule (esomeprazole magnesium trihydrate pellets)</td></tr>
        <tr><td>Pack</td><td>1 × 14 capsules, triple-layer packaging</td></tr>
        <tr><td>Category</td><td>Anti-secretory, proton pump inhibitor (PPI)</td></tr>
        <tr><td>Mode of action</td><td>Suppresses HCl secretion by specific inhibition of H⁺/K⁺-ATPase in the gastric parietal cell — blocks the <strong>final step</strong> of acid secretion</td></tr>
        <tr><td>T-max</td><td>1.5 hours</td></tr>
        <tr><td>Half-life</td><td>1–1.5 hours</td></tr>
        <tr><td>Bioavailability</td><td>Up to 90%</td></tr>
        <tr><td>Protein binding</td><td>97%</td></tr>
        <tr><td>Metabolism / excretion</td><td>Liver, CYP450 (CYP2C19, CYP3A4); excreted in urine; no accumulation with once-daily dosing</td></tr>
        <tr><td>Side effects</td><td>Epigastric pain, dyspepsia, allergic reaction</td></tr>
        <tr><td>Contra-indications</td><td>Known hypersensitivity to esomeprazole or to substituted benzimidazoles</td></tr>
        <tr><td>Renal impairment</td><td>No dose adjustment needed</td></tr>
        <tr><td>Hepatic impairment</td><td>No adjustment in mild/moderate; in <strong>severe hepatic insufficiency do not exceed 20 mg once daily</strong></td></tr>
        <tr><td>Pregnancy</td><td>Category B — no studies in women available</td></tr>
      </table>

      <h3>Why esomeprazole? The S-isomer advantage</h3>
      <p>Esomeprazole is the <strong>S-isomer</strong> of omeprazole (isomers share the same formula but are mirror
      images). Compared with omeprazole it has an advantageous metabolism:</p>
      <ul>
        <li>Decreased first-pass metabolism and decreased systemic clearance</li>
        <li>Enhanced delivery to the site of action</li>
        <li>Inhibition of <strong>more gastric proton pumps</strong></li>
      </ul>

      <h3>Comparison with other PPIs</h3>
      <table>
        <tr><th>Parameter</th><th>Esomeprazole</th><th>Lansoprazole</th><th>Omeprazole</th><th>Pantoprazole</th><th>Rabeprazole</th></tr>
        <tr><td>Bioavailability</td><td><strong>90%</strong></td><td>80%</td><td>30–40%</td><td>77%</td><td>52%</td></tr>
        <tr><td>T-max</td><td>1.5 h</td><td>1.7 h</td><td>0.5–3.5 h</td><td>2.5 h</td><td>2–5 h</td></tr>
        <tr><td>Half-life</td><td>1.2–1.5 h</td><td>&lt; 2 h</td><td>0.5–1 h</td><td>~1.9 h</td><td>1–2 h</td></tr>
        <tr><td>Protein binding</td><td>97%</td><td>97%</td><td>95%</td><td>98%</td><td>96.3%</td></tr>
      </table>

      <h3>Indications</h3>
      <ul>
        <li>Gastro-oesophageal reflux disease (GERD) — quick relief of symptoms, short-term treatment, severe reflux</li>
        <li>Gastric, duodenal and peptic ulcer</li>
        <li>Healing of gastric ulcers associated with NSAID therapy</li>
        <li>Prevention of gastric and duodenal ulcers associated with NSAIDs</li>
        <li>Helicobacter pylori–associated ulcer (as part of triple therapy)</li>
        <li>Zollinger-Ellison syndrome</li>
        <li>Emergency use: bleeding ulcer, stress-ulcer prophylaxis</li>
      </ul>

      <h3>Dosage with Esso 40</h3>
      <table>
        <tr><th>Indication</th><th>Esso 40 regimen</th></tr>
        <tr><td>GERD</td><td>40 mg once daily for 4–8 weeks</td></tr>
        <tr><td>Gastric / duodenal ulcer</td><td>40 mg once daily for 4–8 weeks</td></tr>
        <tr><td>Prevention of NSAID-induced ulcer</td><td>40 mg once daily for up to 6 months (20 mg is the alternative)</td></tr>
        <tr><td>H. pylori ulcer</td><td>40 mg once daily for 1 week <strong>plus clarithromycin 500 mg b.i.d. plus amoxicillin 1 g b.i.d.</strong> for 1 week — no follow-up therapy</td></tr>
      </table>

      <h3>What Esso 40 offers (key detailing messages)</h3>
      <ul>
        <li><strong>Strong and prolonged acid control</strong> in patients with acid peptic disorders (APDs)</li>
        <li><strong>Faster healing rates in GERD</strong></li>
        <li>Maintains <strong>intragastric pH &gt; 4 for longer duration</strong></li>
        <li><strong>Patient compliance with once-daily dosage</strong></li>
        <li><strong>Triple-layer packaging</strong> — PVC, Tropical Alu and Alu-Alu — offers long-lasting protection of the capsules</li>
      </ul>
    `
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: "m5",
    title: "Esso-NS (Naproxen Sodium + Esomeprazole)",
    summary: "The NSAID patients need, without the ulcer risk they fear.",
    body: `
      <figure><img src="assets/img/esso-ns-packs.jpg" alt="Esso-NS key advantages slide with 500/20 Forte and 375/20 packs" loading="lazy">
      <figcaption>Esso-NS 500/20 Forte and 375/20</figcaption></figure>

      <p><strong>Positioning:</strong> <em>"The pain relief NSAID patients need, without the ulcer risk they fear."</em></p>

      <h3>What patients need</h3>
      <p>Patients with chronic arthritis need <strong>an effective NSAID + GI safety</strong>. Esso-NS combines
      <strong>naproxen sodium</strong> (a powerful NSAID) with <strong>esomeprazole</strong> (the PPI in Esso) in one tablet.</p>

      <h3>Strengths</h3>
      <ul>
        <li><strong>Esso-NS 375/20</strong> — naproxen 375 mg + esomeprazole 20 mg</li>
        <li><strong>Esso-NS 500/20 Forte</strong> — naproxen 500 mg + esomeprazole 20 mg</li>
      </ul>

      <h3>The sequential-delivery tablet — the key technology</h3>
      <p>Each tablet combines an <strong>immediate-release esomeprazole magnesium outer layer</strong> with an
      <strong>enteric-coated, delayed-release naproxen core</strong>.</p>
      <ol>
        <li>Esomeprazole is released <strong>first, in the stomach</strong>, raising gastric pH above 4.</li>
        <li>The enteric coating <strong>prevents naproxen release at pH below 5</strong>, so naproxen dissolves later in the <strong>small intestine</strong>.</li>
        <li>Result: protection against the local gastric toxicity of naproxen, while still delivering full COX-1/COX-2 inhibition for pain and inflammation.</li>
      </ol>

      <h3>The two components</h3>
      <ul>
        <li><strong>Naproxen</strong> — a powerful NSAID that blocks both COX-1 and COX-2. It reduces pain and inflammation but may cause stomach ulcers, especially in patients with a history of acid peptic disorders.</li>
        <li><strong>Esomeprazole</strong> — a PPI that blocks acid production to maintain gastric pH above 4, reducing the risk of ulcers or GI bleeding that can occur with naproxen.</li>
      </ul>

      <h3>Indications</h3>
      <p><strong>Osteoarthritis, rheumatoid arthritis, ankylosing spondylitis and low back pain</strong> — in patients at
      risk of developing NSAID-associated peptic ulcers. (The combination is US FDA-approved for these arthritic conditions.)</p>

      <h3>Dosage &amp; administration</h3>
      <ul>
        <li>Best taken on an <strong>empty stomach, about 30 minutes before a meal</strong>.</li>
        <li>Naproxen dose may be increased up to 1500 mg/day for a limited time.</li>
        <li>Treatment may be continued for up to <strong>6 months</strong> in patients requiring higher levels of anti-inflammatory/analgesic activity.</li>
      </ul>

      <h3>Pharmacokinetics (naproxen)</h3>
      <ul>
        <li>Peak plasma level in <strong>3–5 hours</strong>; with food, C-max can be delayed up to 8 hours</li>
        <li>Pain relief lasts <strong>8–12 hours</strong></li>
        <li>Protein binding <strong>99%</strong>; half-life <strong>9–15 hours</strong></li>
      </ul>

      <h3>Clinical evidence</h3>
      <figure><img src="assets/img/esso-ns-studies.jpg" alt="Esso-NS studies: gastric ulcer incidence 9% vs 50% and 15% vs 51%; 63% patient satisfaction" loading="lazy">
      <figcaption>Gastric ulcer incidence and patient satisfaction with Esso-NS</figcaption></figure>
      <ul>
        <li>NSAIDs used alone: prevalence of <strong>14%–25%</strong> gastric and duodenal ulcers in users.</li>
        <li>Naproxen 500 mg + esomeprazole 20 mg b.i.d. vs enteric-coated naproxen 500 mg b.i.d. — incidence of gastric ulcer
        <strong>9% vs 50%</strong> (study 1) and <strong>15% vs 51%</strong> (study 2): superior GI protection.</li>
        <li>Quality of life: <strong>63%</strong> of patients rated treatment satisfactory, 12% unsatisfied, 24% no difference (Clinics in Orthopedic Surgery, 2020).</li>
      </ul>

      <h3>Contra-indications</h3>
      <ul>
        <li>Hypersensitivity to any ingredient</li>
        <li><strong>3rd trimester of pregnancy</strong></li>
        <li>GI ulceration</li>
      </ul>
      <p>Standard NSAID precautions apply — GI, renal and cardiovascular risk with long-term use. Avoid combining with other NSAIDs or blood thinners without close monitoring.</p>

      <h3>Esso-NS advantages (key detailing messages)</h3>
      <ul>
        <li><strong>Dual-action formula</strong> — effective pain relief <em>and</em> gastrointestinal protection</li>
        <li>Excellent GI protection and a better, long-term safety profile — <strong>suitable for long-term use</strong></li>
        <li>Fixed-dose combination: <strong>one tablet replaces the two-pill NSAID + PPI routine</strong> — simplified dosage improves compliance</li>
        <li>Improved quality of life, leading to increased doctor satisfaction</li>
        <li>Cost-effective</li>
        <li><strong>Competitive edge:</strong> where competitors require a separate PPI prescription, Esso-NS has gastroprotection built into the tablet itself.</li>
      </ul>
    `
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: "m6",
    title: "Mionex Tablet (Moxifloxacin 400 mg)",
    summary: "The once-daily respiratory quinolone — spectrum, mechanism, indications and dosing.",
    body: `
      <figure><img src="assets/img/mionex-dropcard.jpg" alt="Mionex dropcard with dosage chart and once-daily dose benefit" loading="lazy">
      <figcaption>Mionex dropcard — "Ultimate Care"</figcaption></figure>

      <h3>What is Mionex?</h3>
      <p>Mionex (moxifloxacin hydrochloride) is a synthetic <strong>fluoroquinolone</strong> with a
      <strong>broad spectrum</strong> of activity and a <strong>bactericidal</strong> mode of action. Because of its
      potent activity against the common respiratory pathogen <strong>Streptococcus pneumoniae</strong>, moxifloxacin
      is called a <strong>"respiratory quinolone"</strong>.</p>

      <h3>Quinolone generations</h3>
      <table>
        <tr><th>Generation</th><th>Molecules</th><th>Coverage</th></tr>
        <tr><td>1st</td><td>Nalidixic acid, cinoxacin</td><td>Gram-negative, but not Pseudomonas</td></tr>
        <tr><td>2nd</td><td>Norfloxacin, ciprofloxacin, enoxacin, ofloxacin</td><td>Gram-negative (including Pseudomonas), some Gram-positive (S. aureus) and some atypicals</td></tr>
        <tr><td><strong>3rd</strong></td><td>Levofloxacin, sparfloxacin, <strong>moxifloxacin</strong>, gemifloxacin, gatifloxacin</td><td>As 2nd generation, with <strong>extended Gram-positive and atypical coverage</strong></td></tr>
        <tr><td>4th</td><td>Trovafloxacin*</td><td>As 3rd generation, with broad anaerobic coverage</td></tr>
      </table>
      <p class="small muted">*Trovafloxacin was withdrawn from the market in 1999 due to liver toxicity and deaths.</p>

      <h3>Mechanism of action</h3>
      <p>Moxifloxacin has a <strong>concentration-dependent bactericidal</strong> effect. It interferes with bacterial
      <strong>DNA gyrase — specifically topoisomerase II and topoisomerase IV</strong>.</p>
      <ul>
        <li><strong>Topoisomerase II (DNA gyrase)</strong> relaxes supercoiled DNA during transcription and replication, preventing DNA breakage — needed for efficient bacterial cell division.</li>
        <li><strong>Topoisomerase IV</strong> is required to separate (segregate) the replicated chromosomal DNA into the two daughter cells during cell division.</li>
      </ul>
      <p>Blocking both stops bacterial DNA replication, repair and cell division. Mionex is active against
      <strong>Gram-positive, Gram-negative and atypical bacteria</strong>, as well as <strong>beta-lactamase–producing
      and macrolide-resistant strains</strong>. Atypicals covered include <em>Chlamydia pneumoniae</em> and <em>Mycoplasma pneumoniae</em>.</p>

      <h3>Distribution</h3>
      <p>Moxifloxacin reaches nasal and bronchial secretions, the mucosa of the sinuses and abdominal tissues — matching its indications.</p>

      <h3>Product profile</h3>
      <table>
        <tr><th>Item</th><th>Mionex</th></tr>
        <tr><td>Composition</td><td>Moxifloxacin 400 mg film-coated tablet</td></tr>
        <tr><td>Pack</td><td>5 tablets</td></tr>
        <tr><td>Category</td><td>Antibacterial, fluoroquinolone, broad spectrum</td></tr>
        <tr><td>T-max</td><td>1–3 hours</td></tr>
        <tr><td>Half-life</td><td>11.5–15.6 hours (allows <strong>once-daily</strong> dosing)</td></tr>
        <tr><td>Bioavailability</td><td><strong>90%</strong></td></tr>
        <tr><td>Protein binding</td><td>48%</td></tr>
        <tr><td>Excretion</td><td>Urine</td></tr>
        <tr><td>Side effects</td><td>Nausea, vomiting, diarrhoea, dyspepsia, dizziness; CNS effects such as headache, confusion, insomnia (rarely hallucinations, seizure)</td></tr>
        <tr><td>Contra-indications</td><td>Hypersensitivity to any quinolone</td></tr>
        <tr><td>Hepatic &amp; renal impairment</td><td>No dosage adjustment required</td></tr>
        <tr><td>Pregnancy &amp; lactation</td><td>Not studied</td></tr>
      </table>
      <p>Watch for rare tendon-related effects, particularly in older patients or those on corticosteroids.</p>

      <h3>Indications &amp; dosage — 400 mg once daily</h3>
      <table>
        <tr><th>Infection</th><th>Duration (as per Mionex dropcard)</th></tr>
        <tr><td>Community-acquired pneumonia (CAP)</td><td>7–14 days</td></tr>
        <tr><td>Acute exacerbation of chronic bronchitis (AECB)</td><td>5 days</td></tr>
        <tr><td>Acute bacterial sinusitis</td><td>10 days</td></tr>
        <tr><td>Complicated skin &amp; skin-structure infections</td><td>7–21 days</td></tr>
        <tr><td>Complicated intra-abdominal infections</td><td>5–14 days</td></tr>
      </table>

      <h3>What Mionex offers (key detailing messages)</h3>
      <ul>
        <li><strong>Effective and safe choice in community-acquired pneumonia</strong></li>
        <li><strong>Effective in treating diabetic foot infections</strong></li>
        <li><strong>Effective and well tolerated in uncomplicated PID</strong> (pelvic inflammatory disease)</li>
        <li><strong>O.D. dose benefit</strong> — once-daily dosing simplifies adherence</li>
        <li>High bioavailability (90%) supports reliable clinical response</li>
        <li><strong>Competitive edge:</strong> specific potency against <em>S. pneumoniae</em> for the respiratory infections most commonly seen in general practice.</li>
      </ul>
    `
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: "m7",
    title: "Pegalin-CR (Pregabalin Controlled Release)",
    summary: "Neuropathic pain, pregabalin's mechanism, and why once-daily CR matters.",
    body: `
      <figure><img src="assets/img/pegalin-cr-dropcard.jpg" alt="Pegalin CR dropcard: extended release 82.5, 165 and 330 mg; once daily dosing, efficacy and safety, cost-effective" loading="lazy">
      <figcaption>Pegalin-CR — "Challenge Resolved"</figcaption></figure>

      <h3>The nervous system — essentials</h3>
      <p>Humans have two complementary control systems: the <strong>nervous system</strong> (releases
      neurotransmitters) and the <strong>endocrine system</strong> (glands secrete hormones). The
      <strong>neuron</strong> is the basic unit of the nervous system — the brain has about 100 billion of them,
      and they transmit signals at up to 200 mph. A <strong>synapse</strong> is the gap between two neurons.</p>
      <p><strong>Neurotransmission:</strong> neurotransmitters stored in vesicles of the pre-synaptic neuron are released
      into the synaptic cleft in response to a stimulus, activate post-synaptic receptors, and are then removed by
      re-uptake or destroyed by enzymes. The nerve impulse itself is a flow of charge from movement of ions —
      <strong>Na⁺, K⁺ and Ca²⁺</strong> — across the neuron membrane.</p>

      <h3>Neuropathic pain conditions</h3>
      <ul>
        <li><strong>Peripheral neuropathy</strong> — a disorder of the peripheral nerves: tingling, numbness, unusual sensations, weakness, and stabbing, throbbing or burning pain. Causes include shingles, vitamin deficiency, autoimmune disease, cancer drugs and antibiotics.</li>
        <li><strong>Diabetic peripheral neuropathy (DPN)</strong> — nerve damage due to diabetes, from injury to the small blood vessels supplying the nerves: numbness/tingling and prickly, sharp pain in the feet, muscle weakness, loss of balance, palpitations, excessive sweating.</li>
        <li><strong>Post-herpetic neuralgia (PHN)</strong> — persistent nerve pain after <strong>shingles</strong> (herpes varicella-zoster, the virus that first causes chickenpox), usually in nerves of the chest and abdomen; burning, stabbing or shooting pain, extreme sensitivity to touch and temperature, itching, numbness. Can last for months.</li>
        <li><strong>Fibromyalgia</strong> — a syndrome of diffuse, widespread body pain; may develop due to stress, depression, repetitive injury or CNS disorder.</li>
        <li><strong>Sciatica</strong> — pain radiating along the sciatic nerve from the lower back through hips and buttocks down each leg, with inflammation and numbness.</li>
      </ul>

      <h3>Pregabalin's mechanism of action</h3>
      <p>In neuropathic pain the neuron is <strong>hyper-excited</strong>. Like gabapentin, pregabalin binds to the
      <strong>α2δ (alpha-2-delta) subunit of voltage-gated calcium channels (VGCC)</strong> in the CNS. This:</p>
      <ol>
        <li>Causes a conformational change in the calcium channel</li>
        <li>Decreases the influx of Ca²⁺ ions</li>
        <li>Decreases release of excitatory neurotransmitters — <strong>glutamate, noradrenaline and substance P</strong></li>
        <li>Decreases stimulation of post-synaptic receptors (NMDA, AMPA)</li>
        <li>Returns the neuron to a <strong>"normal" physiological state</strong></li>
      </ol>
      <p>Pregabalin also <strong>increases neuronal GABA</strong> by increasing the activity of glutamic acid decarboxylase
      (GAD), the enzyme that converts excitatory glutamate into inhibitory GABA in a single step.</p>

      <h3>Controlled release vs immediate release</h3>
      <table>
        <tr><th>Parameter</th><th>Pegalin-CR (controlled release)</th><th>Immediate-release pregabalin</th></tr>
        <tr><td>Elimination half-life</td><td>≈ 6.3 hours</td><td>≈ 6.3 hours (same)</td></tr>
        <tr><td>T-max (peak)</td><td><strong>≈ 8 hours</strong></td><td>≈ 3 hours</td></tr>
        <tr><td>Dosing</td><td><strong>Once daily</strong></td><td>Two or more times daily</td></tr>
      </table>
      <p>The CR formulation changes the <strong>rate of absorption</strong>, not the half-life — giving steadier plasma
      levels and allowing once-daily dosing. In a clinical trial (NCT03221907) of CR pregabalin in peripheral neuropathic
      pain, <strong>sleep, anxiety and depression improved with pain control</strong>, and once-daily administration
      maximised treatment effect through better compliance.</p>

      <h3>Strengths &amp; pack</h3>
      <p>Pegalin-CR extended-release tablets: <strong>82.5 mg, 165 mg and 330 mg</strong> (1 × 10 tablets).</p>

      <h3>Dose &amp; administration of pregabalin</h3>
      <table>
        <tr><th>Indication</th><th>Recommended dose/day</th><th>Initial dose</th><th>Maximum/day</th></tr>
        <tr><td>Diabetic peripheral neuropathy (DPN)</td><td>300 mg</td><td>150 mg/day</td><td>600 mg</td></tr>
        <tr><td>Post-herpetic neuralgia (PHN)</td><td>150–300 mg</td><td>150 mg/day</td><td>600 mg</td></tr>
        <tr><td>Fibromyalgia</td><td>300–450 mg</td><td>150 mg/day</td><td><strong>450 mg</strong></td></tr>
        <tr><td>Seizures (adjunct)</td><td>150–600 mg</td><td>150 mg/day</td><td>600 mg</td></tr>
      </table>

      <h3>Safety &amp; tolerability</h3>
      <p>Most common effects: <strong>drowsiness, dizziness and peripheral oedema</strong>. <strong>Taper gradually</strong> —
      do not stop abruptly.</p>

      <h3>Pegalin-CR advantages (key detailing messages)</h3>
      <ul>
        <li><strong>Once-daily dosing</strong> — convenience and compliance</li>
        <li>Enhances compliance and efficacy by maintaining <strong>consistent plasma concentrations</strong></li>
        <li>Improves safety by <strong>reducing daytime side effects such as dizziness and drowsiness</strong>, allowing higher dosage</li>
        <li>Demonstrated <strong>better reduction of mean daily pain scores</strong> compared with conventional pregabalin</li>
        <li><strong>Cost-effective</strong> convenience</li>
        <li><strong>Competitive edge:</strong> once-daily CR directly addresses the adherence gap seen with multiple-times-daily immediate-release pregabalin.</li>
      </ul>
    `
  },

  /* ------------------------------------------------------------------ 8 */
  {
    id: "m8",
    title: "Tepride Tablet (Itopride HCl 50 mg)",
    summary: "The cardiac-safe dual-action prokinetic for functional dyspepsia.",
    body: `
      <figure><img src="assets/img/tepride-dropcard.jpg" alt="Tepride dropcard: functional dyspepsia 70% in FGID patients in Pakistan, cardiac safety, 1 tablet three times a day" loading="lazy">
      <figcaption>Tepride dropcard — "Happy Tummy"</figcaption></figure>

      <h3>Prokinetics</h3>
      <p>Gastroprokinetics <strong>enhance gastrointestinal motility</strong> by increasing the frequency or strength of
      GI contractions <strong>without disrupting their rhythm</strong>. They are classified as dopaminergic,
      serotonergic or cholinergic agents.</p>

      <h3>Functional dyspepsia — the opportunity</h3>
      <p>In Pakistan, a hospital-based study using the Rome III questionnaire found functional dyspepsia in
      <strong>70% of patients with functional GI disorders (FGIDs)</strong>.</p>

      <h3>Dual mechanism of action</h3>
      <ol>
        <li><strong>Dopamine D2-receptor antagonism.</strong> Increased dopamine activity causes nausea, vomiting, hiccups,
        excessive salivation and a burning tongue, and dopamine suppresses acetylcholine release in the gut. Itopride's
        D2 antagonism gives an <strong>antiemetic</strong> action.</li>
        <li><strong>Acetylcholinesterase (AChE) inhibition.</strong> AChE breaks down acetylcholine into choline and acetate.
        By inhibiting it, Tepride <strong>increases acetylcholine concentration</strong> in the gut.</li>
      </ol>
      <p>More acetylcholine stimulates smooth-muscle contraction, increases GI peristalsis, increases <strong>lower
      oesophageal sphincter (LES) pressure</strong>, stimulates gastric motility, accelerates gastric emptying, improves
      gastro-duodenal coordination and increases intestinal secretions. Result: smooth gut motility → no dyspepsia.</p>

      <h3>Pharmacokinetics</h3>
      <ul>
        <li>C-max reached within <strong>35 minutes</strong></li>
        <li>Bioavailability <strong>60%</strong>; protein binding <strong>96%</strong>; half-life <strong>6 hours</strong></li>
        <li>Metabolised in the liver by <strong>N-oxidation via flavin-containing monooxygenase (FMO)</strong> to inactive metabolites — <strong>not by CYP450</strong></li>
        <li>Excreted mainly by the kidneys as metabolites and unchanged drug</li>
      </ul>

      <h3>Targeted indications</h3>
      <p>Functional dyspepsia, GERD, nausea &amp; vomiting, sensation of bloating, early satiety, anorexia and gastroparesis.</p>

      <h3>Dosage</h3>
      <p><strong>1 tablet (50 mg) three times a day</strong> on an empty stomach, before meals (the Tepride dropcard states
      30 minutes before a meal). Pack: 1 × 10 tablets.</p>

      <h3>Special populations &amp; safety</h3>
      <ul>
        <li><strong>Cardiac safety:</strong> itopride has <strong>no abnormal effect on the QT interval</strong> — a cardiac-safer prokinetic.</li>
        <li>Pregnancy: no adequate studies — should not be used. Lactation: not indicated.</li>
        <li>Children: safety <strong>under 16 years</strong> not established. Elderly: use with appropriate caution and monitoring.</li>
        <li>Interactions: because it is metabolised by FMO and not CYP450, interactions are few; take care with sustained-release/enteric-coated drugs and anti-ulcer drugs such as cimetidine and ranitidine.</li>
        <li>Adverse reactions: headache, dizziness, diarrhoea, constipation, galactorrhoea; rarely tremor, leucopenia, thrombocytopenia.</li>
      </ul>

      <h3>Tepride vs competitors</h3>
      <table>
        <tr><th></th><th>Tepride (itopride)</th><th>Domperidone</th><th>Levosulpiride</th><th>Cinitapride</th></tr>
        <tr><td>Mechanism</td><td>D2 antagonist <strong>+ AChE inhibitor</strong></td><td>D2 &amp; D3 antagonist</td><td>Antipsychotic; central D2, D3 &amp; D4 antagonist</td><td>5-HT1 &amp; 5-HT4 agonist, 5-HT2 antagonist (CNS-acting)</td></tr>
        <tr><td>Metabolism</td><td><strong>FMO (not CYP450)</strong></td><td>CYP3A4</td><td>Liver</td><td>CYP3A4 &amp; CYP2C8</td></tr>
        <tr><td>Interactions</td><td>Few</td><td>Extensive (antacids, antisecretory drugs)</td><td>Extensive (antacids, sucralfate, narcotics, analgesics, anticholinergics)</td><td>Extensive (antacids, antisecretory drugs)</td></tr>
        <tr><td>Protein binding / bioavailability</td><td>96% / 60%</td><td>91–93% / 46%</td><td>30–40% / 30%</td><td>Half-life 3–5 h (Tepride 6 h)</td></tr>
        <tr><td>Key side effects</td><td>Mild: dizziness, headache, diarrhoea, constipation</td><td>Tardive dyskinesia, parkinsonism, extrapyramidal effects; cardiac (QT) risk</td><td>Amenorrhoea, gynaecomastia, galactorrhoea, libido change, hypotension, sedation</td><td>Angioedema, gynaecomastia, hyperprolactinaemia, sedation, extrapyramidal spasm</td></tr>
      </table>

      <h3>Tepride key detailing messages</h3>
      <ul>
        <li>Good efficacy for <strong>postprandial fullness and early satiety</strong> in functional dyspepsia</li>
        <li><strong>Enhances gastric motility</strong>; effective treatment for functional dyspepsia</li>
        <li><strong>Does not prolong the QT interval — cardiac safety</strong></li>
        <li>Fewer drug interactions thanks to non-CYP450 (FMO) metabolism</li>
        <li><strong>Competitive edge:</strong> where domperidone carries cardiac risk and levosulpiride/cinitapride carry hormonal risks, Tepride offers comparable prokinetic benefit with a cleaner safety profile.</li>
      </ul>
    `
  }
];

window.QUESTIONS = [
  /* ---- m1 Portfolio */
  { module: "m1", q: "Which of these is NOT part of the Khyber-1 portfolio?",
    options: ["Esso 40 Capsule", "Pegalin-CR", "Tepride", "Bexus (levofloxacin)"], answer: 3 },
  { module: "m1", q: "Which Khyber-1 brand is a prokinetic?",
    options: ["Esso 40", "Tepride", "Mionex", "Pegalin-CR"], answer: 1 },
  { module: "m1", q: "Which brand's tagline is \"Challenge Resolved\"?",
    options: ["Esso", "Mionex", "Pegalin-CR", "Tepride"], answer: 2 },
  { module: "m1", q: "Which brand's tagline is \"Healthy Life, Healthy Stomach\"?",
    options: ["Esso", "Tepride", "Mionex", "Pegalin-CR"], answer: 0 },

  /* ---- m2 NSAIDs */
  { module: "m2", q: "Which COX isoform protects the gastric mucosa and maintains kidney blood supply?",
    options: ["COX-1", "COX-2", "Both equally", "Neither"], answer: 0 },
  { module: "m2", q: "Which NSAID is the only irreversible COX inhibitor?",
    options: ["Naproxen", "Diclofenac", "Aspirin", "Ibuprofen"], answer: 2 },
  { module: "m2", q: "Which statement describes rheumatoid arthritis rather than osteoarthritis?",
    options: ["Usually begins after age 40", "Affects the same joints on both sides of the body (symmetrical)", "Mainly affects weight-bearing joints", "No general feeling of sickness"], answer: 1 },
  { module: "m2", q: "Chronic pain is defined as pain lasting…",
    options: ["Longer than 1 week", "Longer than 1 month", "Longer than 3 months", "Longer than 1 year"], answer: 2 },
  { module: "m2", q: "What is the reported prevalence of gastric and duodenal ulcers in NSAID users?",
    options: ["1%–2%", "5%–7%", "14%–25%", "50%–60%"], answer: 2 },
  { module: "m2", q: "Why do NSAIDs cause gastro-duodenal ulcers?",
    options: ["They increase mucus production", "They inhibit prostaglandins, reducing bicarbonate and mucus and leaving HCl uncontrolled", "They block the proton pump", "They kill H. pylori"], answer: 1 },

  /* ---- m3 Acid & PPIs */
  { module: "m3", q: "Which enzyme in the parietal cell pumps H+ into the stomach lumen?",
    options: ["Carbonic anhydrase", "H+/K+-ATPase (proton pump)", "Cyclo-oxygenase", "Acetylcholinesterase"], answer: 1 },
  { module: "m3", q: "Which three receptors on the parietal cell stimulate acid secretion?",
    options: ["Dopamine, serotonin, GABA", "Gastrin, acetylcholine, histamine-2", "Insulin, glucagon, gastrin", "Histamine-1, adrenaline, dopamine"], answer: 1 },
  { module: "m3", q: "What intragastric pH is the target of PPI therapy?",
    options: ["Below 2", "Above 4", "Exactly 7", "Above 9"], answer: 1 },
  { module: "m3", q: "Lifestyle modification alone helps approximately what proportion of GI patients?",
    options: ["5%", "20%", "50%", "80%"], answer: 1 },
  { module: "m3", q: "A peptic ulcer in the duodenum is called a…",
    options: ["Gastric ulcer", "Duodenal ulcer", "Oesophagitis", "Gastroparesis"], answer: 1 },

  /* ---- m4 Esso 40 */
  { module: "m4", q: "Esomeprazole is which isomer of omeprazole?",
    options: ["R-isomer", "S-isomer", "Racemic mixture", "It is not related to omeprazole"], answer: 1 },
  { module: "m4", q: "Bioavailability of esomeprazole compared with omeprazole is…",
    options: ["90% vs 30–40%", "30% vs 90%", "52% vs 77%", "Equal"], answer: 0 },
  { module: "m4", q: "In severe hepatic insufficiency, the esomeprazole dose should not exceed…",
    options: ["20 mg once daily", "40 mg once daily", "40 mg twice daily", "No limit"], answer: 0 },
  { module: "m4", q: "The H. pylori regimen with Esso 40 is…",
    options: ["Esso 40 alone for 8 weeks", "Esso 40 OD + clarithromycin 500 mg b.i.d. + amoxicillin 1 g b.i.d. for 1 week", "Esso 40 + metronidazole for 1 month", "Esso 40 b.i.d. for 6 months"], answer: 1 },
  { module: "m4", q: "What is the usual Esso 40 regimen for GERD?",
    options: ["40 mg once daily for 4–8 weeks", "40 mg three times daily for 1 week", "40 mg once weekly", "40 mg once daily for 1 year"], answer: 0 },
  { module: "m4", q: "Which is a key Esso 40 detailing message?",
    options: ["Twice-daily dosing for faster action", "Maintains intragastric pH > 4 for longer duration with once-daily dosage", "Blocks dopamine receptors", "No need to take before meals"], answer: 1 },
  { module: "m4", q: "Esso 40's triple-layer packaging consists of…",
    options: ["Glass, foil and paper", "PVC, Tropical Alu and Alu-Alu", "Plastic bottle and cap", "Paper sachet"], answer: 1 },

  /* ---- m5 Esso-NS */
  { module: "m5", q: "Esso-NS combines which two molecules?",
    options: ["Diclofenac + omeprazole", "Naproxen sodium + esomeprazole", "Ibuprofen + famotidine", "Naproxen + misoprostol"], answer: 1 },
  { module: "m5", q: "In the Esso-NS sequential-delivery tablet, which component is released first in the stomach?",
    options: ["Naproxen", "Esomeprazole", "Both together", "Neither — both release in the colon"], answer: 1 },
  { module: "m5", q: "The enteric coating of the naproxen core prevents naproxen release at pH below…",
    options: ["2", "5", "7", "9"], answer: 1 },
  { module: "m5", q: "What are the two Esso-NS strengths?",
    options: ["250/20 and 500/40", "375/20 and 500/20 Forte", "500/40 and 750/40", "375/40 and 500/40"], answer: 1 },
  { module: "m5", q: "How should Esso-NS be taken?",
    options: ["With a heavy meal", "On an empty stomach about 30 minutes before a meal", "At bedtime with milk", "Only when pain is severe"], answer: 1 },
  { module: "m5", q: "Esso-NS is indicated in OA, RA, ankylosing spondylitis and low back pain in patients…",
    options: ["Under 12 years of age", "At risk of NSAID-associated peptic ulcers", "With active GI ulceration", "In the 3rd trimester of pregnancy"], answer: 1 },
  { module: "m5", q: "In the clinical studies, gastric ulcer incidence with naproxen + esomeprazole vs enteric-coated naproxen was…",
    options: ["50% vs 9%", "9% vs 50% and 15% vs 51%", "Equal in both groups", "25% vs 30%"], answer: 1 },
  { module: "m5", q: "Which is a contra-indication of Esso-NS?",
    options: ["Low back pain", "3rd trimester of pregnancy", "Osteoarthritis", "Age over 50"], answer: 1 },
  { module: "m5", q: "How long does naproxen pain relief last per dose?",
    options: ["1–2 hours", "3–4 hours", "8–12 hours", "48 hours"], answer: 2 },

  /* ---- m6 Mionex */
  { module: "m6", q: "Why is moxifloxacin called a \"respiratory quinolone\"?",
    options: ["It is inhaled", "Potent activity against Streptococcus pneumoniae", "It only works in the lungs", "It is a cough suppressant"], answer: 1 },
  { module: "m6", q: "Moxifloxacin kills bacteria by inhibiting…",
    options: ["Cell wall synthesis", "The 30S ribosomal subunit", "DNA gyrase (topoisomerase II) and topoisomerase IV", "Folic acid synthesis"], answer: 2 },
  { module: "m6", q: "Moxifloxacin belongs to which quinolone generation?",
    options: ["1st", "2nd", "3rd", "4th (withdrawn)"], answer: 2 },
  { module: "m6", q: "What is the Mionex dose for community-acquired pneumonia?",
    options: ["400 mg once daily for 7–14 days", "400 mg twice daily for 3 days", "200 mg three times daily", "400 mg once weekly"], answer: 0 },
  { module: "m6", q: "What is the bioavailability of Mionex?",
    options: ["30%", "48%", "60%", "90%"], answer: 3 },
  { module: "m6", q: "In which condition is Mionex detailed as \"effective in treating\"?",
    options: ["Diabetic foot infections", "Functional dyspepsia", "Fibromyalgia", "GERD"], answer: 0 },
  { module: "m6", q: "Dose adjustment of Mionex in hepatic or renal impairment is…",
    options: ["Halve the dose", "Not required", "Contra-indicated", "Double the dose"], answer: 1 },

  /* ---- m7 Pegalin-CR */
  { module: "m7", q: "Pregabalin binds to which target?",
    options: ["COX-2 enzyme", "α2δ subunit of voltage-gated calcium channels", "Dopamine D2 receptor", "Proton pump"], answer: 1 },
  { module: "m7", q: "Which neurotransmitters does pregabalin decrease the release of?",
    options: ["GABA only", "Glutamate, noradrenaline and substance P", "Acetylcholine and dopamine", "Histamine and gastrin"], answer: 1 },
  { module: "m7", q: "What are the Pegalin-CR strengths?",
    options: ["75, 150, 300 mg", "82.5, 165, 330 mg", "50, 100, 200 mg", "25, 50, 75 mg"], answer: 1 },
  { module: "m7", q: "Compared with immediate-release pregabalin, the CR formulation changes…",
    options: ["The half-life (much longer)", "The rate of absorption (T-max ≈ 8 h vs 3 h), allowing once-daily dosing", "The mechanism of action", "Nothing at all"], answer: 1 },
  { module: "m7", q: "What is the maximum daily pregabalin dose in fibromyalgia?",
    options: ["150 mg", "300 mg", "450 mg", "600 mg"], answer: 2 },
  { module: "m7", q: "Post-herpetic neuralgia follows infection with which virus?",
    options: ["Herpes varicella-zoster", "Influenza", "Hepatitis B", "HIV"], answer: 0 },
  { module: "m7", q: "How should pregabalin therapy be stopped?",
    options: ["Abruptly", "Taper gradually", "Double the dose then stop", "Switch to an NSAID"], answer: 1 },

  /* ---- m8 Tepride */
  { module: "m8", q: "Tepride (itopride) acts by…",
    options: ["Blocking the proton pump", "D2-receptor antagonism and acetylcholinesterase inhibition", "5-HT4 agonism only", "Blocking COX enzymes"], answer: 1 },
  { module: "m8", q: "Tepride is metabolised by…",
    options: ["CYP3A4", "CYP2C19", "Flavin-containing monooxygenase (FMO), not CYP450", "It is not metabolised"], answer: 2 },
  { module: "m8", q: "What is Tepride's cardiac safety advantage?",
    options: ["It lowers blood pressure", "No abnormal effect on the QT interval", "It slows heart rate", "It is a beta-blocker"], answer: 1 },
  { module: "m8", q: "What is the Tepride dosage?",
    options: ["50 mg once daily at bedtime", "1 tablet (50 mg) three times a day before meals", "100 mg twice daily after meals", "As needed only"], answer: 1 },
  { module: "m8", q: "In Pakistan, functional dyspepsia was found in what share of FGID patients?",
    options: ["10%", "35%", "70%", "95%"], answer: 2 },
  { module: "m8", q: "Which competitor is metabolised by CYP3A4 and carries extrapyramidal side effects?",
    options: ["Esomeprazole", "Domperidone", "Moxifloxacin", "Pregabalin"], answer: 1 },
  { module: "m8", q: "Safety of Tepride has not been established in children under…",
    options: ["2 years", "6 years", "16 years", "21 years"], answer: 2 },

  /* ======================= Extended bank (so each module quiz has 10+ questions) */

  /* ---- m1 Portfolio */
  { module: "m1", q: "Which Khyber-1 brand is an antibiotic?",
    options: ["Tepride", "Mionex", "Esso-NS", "Pegalin-CR"], answer: 1 },
  { module: "m1", q: "Which Khyber-1 brand is an NSAID + PPI fixed-dose combination?",
    options: ["Esso 40", "Esso-NS", "Tepride", "Mionex"], answer: 1 },
  { module: "m1", q: "What is Mionex's tagline?",
    options: ["Happy Tummy", "Challenge Resolved", "Ultimate Care", "Healthy Life, Healthy Stomach"], answer: 2 },
  { module: "m1", q: "What is Tepride's tagline?",
    options: ["Happy Tummy", "Ultimate Care", "Healthy Stomach", "Challenge Resolved"], answer: 0 },
  { module: "m1", q: "Pegalin-CR belongs to which therapy area?",
    options: ["Acid control", "Neuropathic pain", "Respiratory infections", "Gut motility"], answer: 1 },
  { module: "m1", q: "Which two Khyber-1 brands serve the stomach-complaint patient — one controls acid, the other restores motility?",
    options: ["Esso 40 and Tepride", "Mionex and Esso-NS", "Pegalin-CR and Tepride", "Esso-NS and Mionex"], answer: 0 },
  { module: "m1", q: "Which brand covers the nerve-pain patient whom NSAIDs do not help?",
    options: ["Esso-NS", "Pegalin-CR", "Mionex", "Esso 40"], answer: 1 },
  { module: "m1", q: "Which group of doctors is the main audience for Mionex?",
    options: ["Chest physicians, ENT, GPs, surgeons and diabetic-foot clinics", "Psychiatrists only", "Dermatologists only", "Dentists only"], answer: 0 },
  { module: "m1", q: "What is the composition of Tepride?",
    options: ["Itopride hydrochloride 50 mg", "Domperidone 10 mg", "Esomeprazole 40 mg", "Pregabalin 165 mg"], answer: 0 },

  /* ---- m2 NSAIDs */
  { module: "m2", q: "About how many people use NSAIDs regularly?",
    options: ["1 million", "5 million", "17 million", "100 million"], answer: 2 },
  { module: "m2", q: "What proportion of regular NSAID users are admitted to hospital?",
    options: ["Less than 1%", "5%–7%", "20%–25%", "50%"], answer: 1 },
  { module: "m2", q: "How many bones form the human skeletal framework?",
    options: ["106", "186", "206", "306"], answer: 2 },
  { module: "m2", q: "Which joints allow the greatest degree of flexibility?",
    options: ["Fibrous (immovable) joints", "Cartilaginous joints", "Synovial joints", "Sutures"], answer: 2 },
  { module: "m2", q: "Which is NOT a function of synovial fluid?",
    options: ["Reducing friction", "Shock absorption", "Transporting nutrients to bone", "Producing red blood cells"], answer: 3 },
  { module: "m2", q: "COX converts arachidonic acid into…",
    options: ["Histamine", "Prostaglandins", "Insulin", "Acetylcholine"], answer: 1 },
  { module: "m2", q: "Selective COX-2 inhibitors (coxibs) have been linked to higher…",
    options: ["Cardiovascular risk", "Bone fracture risk", "Liver failure", "Hearing loss"], answer: 0 },
  { module: "m2", q: "Gout typically causes sudden, severe pain in the…",
    options: ["Spine", "Big toe", "Jaw", "Shoulder blade"], answer: 1 },
  { module: "m2", q: "Ankylosing spondylitis is arthritis mainly affecting the…",
    options: ["Spine", "Fingers only", "Knees only", "Jaw"], answer: 0 },

  /* ---- m3 Acid & PPIs */
  { module: "m3", q: "Which enzyme splits carbonic acid into bicarbonate and H+ in the parietal cell?",
    options: ["Carbonic anhydrase", "Pepsin", "Cyclo-oxygenase", "Lipase"], answer: 0 },
  { module: "m3", q: "In the stomach lumen, HCl is formed from…",
    options: ["H+ and Cl− ions", "Na+ and K+ ions", "Ca2+ and HCO3−", "Pepsin and mucus"], answer: 0 },
  { module: "m3", q: "Why do PPIs suppress acid whichever receptor is driving it?",
    options: ["They block histamine only", "The proton pump is the final step of acid secretion", "They neutralise acid in the lumen", "They increase mucus"], answer: 1 },
  { module: "m3", q: "Inflammation or ulceration of the oesophagus is called…",
    options: ["Gastroparesis", "Oesophagitis", "Duodenitis", "Colitis"], answer: 1 },
  { module: "m3", q: "Patients with reflux should avoid meals for how long before lying down?",
    options: ["15 minutes", "2 hours", "6 hours", "12 hours"], answer: 1 },
  { module: "m3", q: "Lifestyle advice for reflux: raise the head of the bed by…",
    options: ["1–2 inches", "6–8 inches", "18–20 inches", "It should be kept flat"], answer: 1 },
  { module: "m3", q: "Two major causes of peptic ulcers are…",
    options: ["NSAIDs and Helicobacter pylori", "Vitamin C and calcium", "Exercise and water", "Antacids and milk"], answer: 0 },
  { module: "m3", q: "Cimetidine and ranitidine belong to which class?",
    options: ["Proton pump inhibitors", "H2-receptor antagonists", "Prokinetics", "Antacids"], answer: 1 },

  /* ---- m4 Esso 40 */
  { module: "m4", q: "What is the Esso 40 pack size?",
    options: ["1 × 10 capsules", "1 × 14 capsules", "2 × 10 capsules", "30 capsules"], answer: 1 },
  { module: "m4", q: "What is the T-max of esomeprazole?",
    options: ["15 minutes", "1.5 hours", "6 hours", "12 hours"], answer: 1 },
  { module: "m4", q: "Esomeprazole protein binding is…",
    options: ["48%", "60%", "97%", "99%"], answer: 2 },
  { module: "m4", q: "Esso is contraindicated in known hypersensitivity to esomeprazole or to…",
    options: ["Penicillins", "Substituted benzimidazoles", "Sulphonamides", "Quinolones"], answer: 1 },
  { module: "m4", q: "Dose adjustment of Esso in renal impairment is…",
    options: ["Not necessary", "Halve the dose", "Contra-indicated", "Double the dose"], answer: 0 },
  { module: "m4", q: "Which is an advantage of esomeprazole over omeprazole?",
    options: ["Inhibits more gastric proton pumps", "Works on dopamine receptors", "Needs three daily doses", "No liver metabolism"], answer: 0 },
  { module: "m4", q: "Esomeprazole is metabolised mainly by…",
    options: ["Flavin monooxygenase", "CYP2C19 and CYP3A4 in the liver", "The kidneys only", "Gut bacteria"], answer: 1 },
  { module: "m4", q: "In which pregnancy category is esomeprazole?",
    options: ["Category A", "Category B", "Category D", "Category X"], answer: 1 },

  /* ---- m5 Esso-NS */
  { module: "m5", q: "Where does the naproxen in Esso-NS dissolve?",
    options: ["In the mouth", "In the stomach", "In the small intestine", "In the colon"], answer: 2 },
  { module: "m5", q: "Naproxen peak plasma levels (without food) are reached in…",
    options: ["15 minutes", "3–5 hours", "12 hours", "24 hours"], answer: 1 },
  { module: "m5", q: "What is naproxen's half-life?",
    options: ["1–2 hours", "9–15 hours", "36 hours", "72 hours"], answer: 1 },
  { module: "m5", q: "For how long may Esso-NS treatment be continued in patients needing higher anti-inflammatory activity?",
    options: ["Up to 1 week", "Up to 1 month", "Up to 6 months", "Lifelong without review"], answer: 2 },
  { module: "m5", q: "In the quality-of-life study, what share of patients rated Esso-NS treatment satisfactory?",
    options: ["24%", "45%", "63%", "90%"], answer: 2 },
  { module: "m5", q: "Esso-NS's competitive edge over a separate NSAID + PPI prescription is…",
    options: ["Gastroprotection built into one tablet", "It contains an antibiotic", "It is taken once a week", "It needs no prescription"], answer: 0 },

  /* ---- m6 Mionex */
  { module: "m6", q: "What is the half-life of moxifloxacin?",
    options: ["1–2 hours", "6 hours", "11.5–15.6 hours", "48 hours"], answer: 2 },
  { module: "m6", q: "Protein binding of moxifloxacin is…",
    options: ["48%", "75%", "90%", "99%"], answer: 0 },
  { module: "m6", q: "Why was trovafloxacin withdrawn in 1999?",
    options: ["Poor efficacy", "Liver toxicity and deaths", "Too expensive", "Cardiac arrhythmias only"], answer: 1 },
  { module: "m6", q: "Topoisomerase IV is needed to…",
    options: ["Build the bacterial cell wall", "Separate replicated chromosomal DNA into daughter cells", "Make bacterial proteins at the ribosome", "Pump protons"], answer: 1 },
  { module: "m6", q: "Which atypical organisms does Mionex cover?",
    options: ["Chlamydia pneumoniae and Mycoplasma pneumoniae", "Only fungi", "Only viruses", "Only anaerobes"], answer: 0 },
  { module: "m6", q: "What is the Mionex duration for complicated skin and skin-structure infections?",
    options: ["3 days", "5 days", "7–21 days", "6 weeks"], answer: 2 },
  { module: "m6", q: "Mionex should be used with caution for tendon effects especially in…",
    options: ["Children under 5", "Older patients or those on corticosteroids", "Athletes only", "Patients on antacids"], answer: 1 },
  { module: "m6", q: "Mionex is detailed as effective and well tolerated in uncomplicated…",
    options: ["PID (pelvic inflammatory disease)", "GERD", "Migraine", "Gout"], answer: 0 },

  /* ---- m7 Pegalin-CR */
  { module: "m7", q: "What is the elimination half-life of Pegalin-CR?",
    options: ["About 1 hour", "About 6.3 hours (same as IR)", "About 24 hours", "About 72 hours"], answer: 1 },
  { module: "m7", q: "Pregabalin increases neuronal GABA by increasing the activity of…",
    options: ["Glutamic acid decarboxylase (GAD)", "Acetylcholinesterase", "Carbonic anhydrase", "COX-2"], answer: 0 },
  { module: "m7", q: "What are the most common side effects of pregabalin?",
    options: ["Drowsiness, dizziness and peripheral oedema", "Hair loss and rash", "Constipation and galactorrhoea", "Tendon rupture"], answer: 0 },
  { module: "m7", q: "What is the recommended daily pregabalin dose in diabetic peripheral neuropathy?",
    options: ["75 mg", "150 mg", "300 mg", "900 mg"], answer: 2 },
  { module: "m7", q: "Fibromyalgia is best described as…",
    options: ["A bacterial joint infection", "A syndrome of diffuse, widespread body pain", "A stomach ulcer", "Pain after shingles"], answer: 1 },
  { module: "m7", q: "In the CR pregabalin trial, which improved along with pain control?",
    options: ["Sleep, anxiety and depression", "Blood pressure only", "Vision", "Kidney function"], answer: 0 },
  { module: "m7", q: "Pegalin-CR enhances compliance and efficacy by maintaining…",
    options: ["Consistent plasma concentrations", "Very high peaks after each dose", "Zero absorption at night", "Gastric pH above 4"], answer: 0 },

  /* ---- m8 Tepride */
  { module: "m8", q: "How quickly does Tepride reach C-max?",
    options: ["Within 35 minutes", "Within 3 hours", "Within 8 hours", "After 24 hours"], answer: 0 },
  { module: "m8", q: "What is the half-life of Tepride?",
    options: ["1 hour", "6 hours", "13 hours", "24 hours"], answer: 1 },
  { module: "m8", q: "Increased acetylcholine from Tepride has which effect on the lower oesophageal sphincter (LES)?",
    options: ["Decreases LES pressure", "Increases LES pressure", "No effect", "Paralyses it"], answer: 1 },
  { module: "m8", q: "Prokinetics enhance GI motility…",
    options: ["By blocking all contractions", "Without disrupting the rhythm of contractions", "By neutralising acid", "By killing bacteria"], answer: 1 },
  { module: "m8", q: "Which competitor is linked to hormonal effects such as amenorrhoea, gynaecomastia and galactorrhoea?",
    options: ["Tepride", "Levosulpiride", "Esomeprazole", "Moxifloxacin"], answer: 1 },
  { module: "m8", q: "Cinitapride acts mainly on which receptors?",
    options: ["Serotonin (5-HT1, 5-HT4 agonist; 5-HT2 antagonist)", "Proton pump", "α2δ calcium channel", "COX-1"], answer: 0 },
  { module: "m8", q: "Should Tepride be used during pregnancy?",
    options: ["Yes, it is first choice", "No — no adequate studies, so it should not be used", "Only in the 3rd trimester", "Only at double dose"], answer: 1 }
];
