/**
 * Universal Study Search Database & Generator Engine
 * Resolves search queries into structured 10-part educational contents.
 */

const PREBUILT_TOPICS = {
  "electrostatics": {
    topic: "Electrostatics",
    overview: "Electrostatics is the branch of physics that deals with the study of electromagnetic phenomena where electric charges are at rest. It explores the behavior of electric charges, the forces between them, and the fields and potentials they create.",
    concepts: [
      { title: "Electric Charge", desc: "A fundamental property of matter. Charges can be positive (protons) or negative (electrons). Like charges repel; opposite charges attract." },
      { title: "Coulomb's Law", desc: "Quantifies the electrostatic force between two point charges, stating it is directly proportional to the product of charges and inversely proportional to the square of the distance between them." },
      { title: "Electric Field", desc: "A region around a charged particle within which a force would be exerted on other charged particles." }
    ],
    definitions: [
      { term: "Quantization of Charge", def: "The principle that electric charge is always an integral multiple of the basic elementary charge (q = ne)." },
      { term: "Permittivity (ε)", def: "A measure of the resistance encountered when forming an electric field in a medium." }
    ],
    formulas: [
      { name: "Coulomb's Law Force", eq: "F = k * (|q1 * q2|) / r^2", desc: "k = 1 / (4 * pi * ε0) ≈ 8.99 × 10^9 N·m²/C²" },
      { name: "Electric Field Intensity", eq: "E = F / q = k * Q / r^2", desc: "Force experienced per unit positive test charge." },
      { name: "Electrostatic Potential", eq: "V = k * Q / r", desc: "Work done per unit charge in bringing it from infinity to a point." }
    ],
    explanation: "Under electrostatics, charges do not flow as currents. Instead, they remain fixed on surfaces (like static cling on clothes or amber attracting straw). When charges accumulate, they build electric potential energy. If the potential difference becomes large enough, dielectric breakdown occurs, causing a sudden discharge (lightning is the most dramatic natural example of electrostatics at work).",
    examNotes: "💡 Always check the medium: if the medium is not vacuum, replace ε0 with ε = K*ε0, where K is the dielectric constant.\n💡 Coulomb's law is only applicable to static, point charges. Do not use it directly for extended charged bodies without integration.",
    mistakes: [
      { title: "Vector Addition Neglect", desc: "Adding electric fields or forces algebraically instead of resolving them as vectors using trigonometry." },
      { title: "Sign Confusion", desc: "Including charge signs directly in Coulomb's equation, leading to wrong force direction vectors." }
    ],
    revision: [
      "Charge is conserved, quantized, and additive.",
      "Electric field lines start at positive charges and end at negative charges. They never intersect.",
      "The electric field inside a charged conductor in electrostatic equilibrium is always zero."
    ],
    questions: [
      { q: "Two point charges, +2μC and -6μC, are separated by 3 meters. What is the magnitude of the force between them?", a: "F = (9e9 * 2e-6 * 6e-6) / 3^2 = (9e9 * 12e-12) / 9 = 0.012 Newtons (Attractive force)." },
      { q: "What is the electric potential at a distance of 10 cm from a point charge of 5μC in a vacuum?", a: "V = (9e9 * 5e-6) / 0.1 = 4.5e4 / 0.1 = 4.5e5 Volts (450,000 V)." }
    ],
    videos: [
      { title: "Electrostatics Complete Conceptual Review", channel: "Physics Universe", duration: "25 mins", videoId: "bg7OszEl5EE" },
      { title: "Coulomb's Law & Electric Fields Solved Numericals", channel: "Aspirant Guide", duration: "18 mins", videoId: "yA3iGki8L-o" }
    ]
  },
  "newton's laws": {
    topic: "Newton's Laws of Motion",
    overview: "Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics. They describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.",
    concepts: [
      { title: "Inertia", desc: "The inherent property of a body to resist any change in its state of rest or uniform motion in a straight line." },
      { title: "Momentum (p)", desc: "The quantity of motion possessed by a body, calculated as the product of mass and velocity (p = mv)." },
      { title: "Action-Reaction Pairs", desc: "Forces always occur in matched pairs. The action force and reaction force act on two different bodies, never on the same body." }
    ],
    definitions: [
      { term: "Force", def: "An external push or pull that changes or tends to change the state of rest or uniform motion of a body." },
      { term: "Impulse", def: "The product of average force and the time interval during which it acts (Impulse = F_avg * Δt = Δp)." }
    ],
    formulas: [
      { name: "Newton's Second Law", eq: "F_net = m * a = dp/dt", desc: "Acceleration is directly proportional to net force and inversely proportional to mass." },
      { name: "Linear Momentum", eq: "p = m * v", desc: "Vector quantity with direction same as velocity." },
      { name: "Impulse-Momentum Relation", eq: "J = F * dt = delta_p", desc: "Impulse equals change in linear momentum." }
    ],
    explanation: "Newton's Laws describe how objects move in our everyday world. The First Law states objects are lazy—they keep doing what they are doing unless forced to change. The Second Law quantifies how force causes acceleration (F=ma). The Third Law states forces are interactive—pushing a wall causes the wall to push back on you with equal strength but in the opposite direction.",
    examNotes: "💡 Always draw a Free Body Diagram (FBD) before setting up equations.\n💡 Force pairs in Newton's Third Law act on DIFFERENT bodies, so they never cancel each other out in a single body equilibrium analysis.",
    mistakes: [
      { title: "Incorrect Normal Force", desc: "Assuming the normal force N is always equal to m*g. On inclines or under pulling force, N = mg cos(theta) or mg - F sin(theta)." },
      { title: "Friction Direction Error", desc: "Drawing friction force in the direction of motion instead of opposing the relative sliding tendency." }
    ],
    revision: [
      "First Law = Law of Inertia.",
      "Second Law = Law of Force Calculation (F = ma).",
      "Third Law = Law of Action-Reaction (Equal and Opposite)."
    ],
    questions: [
      { q: "A 5 kg block is acted upon by a net force of 20 N. What is its acceleration?", a: "Using F = ma, a = F / m = 20 N / 5 kg = 4 m/s²." },
      { q: "Why doesn't a horse-cart system violate the third law if action and reaction are equal?", a: "Action-reaction pairs act on different bodies (horse pulls cart; cart pulls horse). The system moves because the horse pushes the ground backward, and the ground pushes the horse forward with a force greater than the friction on the cart." }
    ],
    videos: [
      { title: "Newton's Laws of Motion - Visual Demonstration", channel: "SciShow Physics", duration: "12 mins", videoId: "G0U9s7_J610" },
      { title: "How to Draw Free Body Diagrams Like a Pro", channel: "IIT Prep Engine", duration: "20 mins", duration: "20 mins", videoId: "dQw4w9WgXcQ" }
    ]
  },
  "accounting": {
    topic: "Introduction to Accounting",
    overview: "Accounting is the process of identifying, measuring, recording, and communicating financial information about an economic entity to help users make informed economic judgments and decisions.",
    concepts: [
      { title: "Double-Entry Bookkeeping", desc: "A system of accounting where every transaction affects at least two accounts—one is debited and the other is credited, keeping the equation in balance." },
      { title: "Accrual Basis", desc: "Recording revenues when earned and expenses when incurred, regardless of when cash is actually exchanged." },
      { title: "Business Entity Concept", desc: "The convention that a business entity is treated as separate and distinct from its owners for accounting purposes." }
    ],
    definitions: [
      { term: "Assets", def: "Economic resources owned or controlled by a business expected to yield future economic benefits." },
      { term: "Liabilities", def: "Financial obligations or debts owed by the entity to external parties." }
    ],
    formulas: [
      { name: "Accounting Equation", eq: "Assets = Liabilities + Owner's Equity (Capital)", desc: "The fundamental balance sheet equality." },
      { name: "Net income", eq: "Net Income = Revenues - Expenses", desc: "Shown on the Income Statement." }
    ],
    explanation: "Accounting acts as the 'language of business'. It translates transaction logs (buying inventory, paying salary, selling goods) into standardized financial statements: the Balance Sheet (financial position), Income Statement (profitability), and Cash Flow Statement. These reports are analyzed by managers, investors, tax agencies, and banks to evaluate performance.",
    examNotes: "💡 Under the Prudence/Conservatism concept, record all anticipated losses, but do not record anticipated profits until realized.\n💡 Capital expenses add long-term value; revenue expenses keep operations running.",
    mistakes: [
      { title: "Debit-Credit Reversals", desc: "Crediting asset increases or debiting liability increases. Remember: Debit increases Assets/Expenses; Credit increases Liabilities/Equity/Revenue." },
      { title: "Mixing Personal Expenses", desc: "Debiting the owner's personal fuel bill as business fuel expense instead of Drawings." }
    ],
    revision: [
      "Assets = Liabilities + Capital is always in equilibrium.",
      "Transactions are backed by source documents (invoices, receipts).",
      "Accrual accounting is preferred over cash accounting."
    ],
    questions: [
      { q: "If assets of a business are ₹5,00,000 and owner's equity is ₹3,00,000, what are the external liabilities?", a: "Liabilities = Assets - Equity = 5,00,000 - 3,00,000 = ₹2,00,000." },
      { q: "Under which concept is depreciation charged on fixed assets?", a: "Going Concern Concept (assuming business continues indefinitely, assets are written down over their useful lives) and Matching Concept (matching expense with corresponding revenue period)." }
    ],
    videos: [
      { title: "Accounting Basics Explained in 10 Minutes", channel: "Commerce Mentor", duration: "10 mins", videoId: "FasL7u-e6yI" }
    ]
  },
  "organic chemistry": {
    topic: "Basics of Organic Chemistry",
    overview: "Organic chemistry is the sub-discipline of chemistry focused on the structure, properties, composition, and reactions of carbon-containing compounds. Carbon's unique ability to form stable chains (catenation) creates immense molecular variety.",
    concepts: [
      { title: "Tetravalency of Carbon", desc: "Carbon has 4 valence electrons and forms 4 covalent bonds to complete its octet, arranging in tetrahedral geometries." },
      { title: "Isomerism", desc: "The phenomenon where compounds have identical molecular formulas but different structural arrangements or spatial configurations." },
      { title: "Resonance", desc: "The delocalization of electrons within a molecule represented by writing multiple contributing Lewis structures." }
    ],
    definitions: [
      { term: "Hydrocarbons", def: "Organic compounds composed entirely of hydrogen and carbon atoms (alkanes, alkenes, alkynes)." },
      { term: "Functional Group", def: "An atom or group of atoms within a molecule that has characteristic chemical behavior." }
    ],
    formulas: [
      { name: "Alkanes Gen Formula", eq: "C_n H_(2n+2)", desc: "Saturated hydrocarbons (single bonds)." },
      { name: "Alkenes Gen Formula", eq: "C_n H_(2n)", desc: "Unsaturated hydrocarbons with one double bond." },
      { name: "Alkynes Gen Formula", eq: "C_n H_(2n-2)", desc: "Unsaturated hydrocarbons with one triple bond." }
    ],
    explanation: "Organic chemistry is structural. We name compounds using IUPAC nomenclature based on carbon chains and functional priorities (e.g. Alcohols -ol, Carboxylic acids -oic acid). Compounds undergo reactions categorized as: substitution, addition, elimination, and rearrangement, driven by electron movements (inductive, electromeric, resonance effects).",
    examNotes: "💡 Electrophiles are electron-loving (positive/neutral, e.g., NO2+). Nucleophiles are nucleus-loving (negative/lone pair, e.g., OH-, NH3).\n💡 In electrophilic addition to unsymmetrical alkenes, follow Markovnikov's rule (hydrogen adds to carbon with more hydrogen atoms).",
    mistakes: [
      { title: "Catenation Limit Violations", desc: "Drawing a carbon atom with 5 bonds (pentavalent carbon). Double-check all carbon valencies are exactly 4." },
      { title: "Incorrect Chain Numbering", desc: "Numbering the IUPAC parent chain from the wrong end, failing to give substituents the lowest possible locant numbers." }
    ],
    revision: [
      "Carbon catenates due to small size and high C-C bond energy.",
      "Homologous series members differ by a -CH2- unit (14 amu).",
      "Resonance structures are imaginary; the actual molecule is a resonance hybrid."
    ],
    questions: [
      { q: "What is the IUPAC name of CH3-CH(OH)-CH3?", a: "The parent chain has 3 carbons (propane). Functional group is alcohol (-ol) at position 2. Name is Propan-2-ol." },
      { q: "Which carbocation is more stable: primary, secondary, or tertiary?", a: "Tertiary carbocation is most stable due to +I effect of three alkyl groups and hyperconjugation (more alpha-hydrogens)." }
    ],
    videos: [
      { title: "Organic Chemistry IUPAC Nomenclature Guide", channel: "ChemAcademy", duration: "22 mins", videoId: "9_wL4c-U2eE" }
    ]
  }
};

export const mockSearch = {
  /**
   * Search query resolver
   * @param {string} rawQuery 
   */
  resolve(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    
    // Check direct matching keywords
    let matchKey = Object.keys(PREBUILT_TOPICS).find(k => q.includes(k) || k.includes(q));
    
    if (matchKey) {
      return PREBUILT_TOPICS[matchKey];
    }

    // Dynamic Fallback Generator for other search queries
    return this.generateDynamicTopic(rawQuery);
  },

  generateDynamicTopic(query) {
    // Format title
    const topicTitle = query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
      topic: topicTitle,
      overview: `This study guide covers the fundamental concepts of ${topicTitle}. Explore its core principles, structured explanations, formula reviews, and quick assessments prepared by Vidyaverse AI.`,
      concepts: [
        { title: `Core Principle of ${topicTitle}`, desc: `The underlying framework that defines the behavior and properties of ${topicTitle} in academic settings.` },
        { title: `Secondary Mechanics`, desc: "Important subsidiary mechanisms observed during practical applications and numerical problems." }
      ],
      definitions: [
        { term: `${topicTitle} Definition`, def: `The formal academic statement defining the scope and parameters of ${topicTitle}.` },
        { term: "Standard Boundary Condition", def: "The specific constraints or assumptions under which these guidelines remain valid." }
      ],
      formulas: [
        { name: "Fundamental Relationship", eq: "Y = f(X) | Constant = K", desc: "The basic proportionality representing this topic's characteristics." }
      ],
      explanation: `To understand ${topicTitle}, we analyze its basic components step-by-step. In typical examinations, questions on this topic test your conceptual grasp of how variables interact, how equations are derived, and how principles are applied to solve real-world problems.`,
      examNotes: `💡 Double-check units and base definitions before attempting numeric solutions.\n💡 Always structure your theoretical answers with clear, labelled bullet points rather than dense paragraphs.`,
      mistakes: [
        { title: "Assumption Errors", desc: "Applying general equations without checking if the system meets the required assumptions." },
        { title: "Calculations Mistakes", desc: "Forgetting to convert variables to SI units before solving formulas." }
      ],
      revision: [
        `Review the core definitions of ${topicTitle} first.`,
        "Identify the primary formulas and constant terms.",
        "Practice drawing qualitative diagrams to consolidate understanding."
      ],
      questions: [
        { q: `What is the primary objective of studying ${topicTitle}?`, a: "To establish a clear qualitative and quantitative model of variables in this domain." },
        { q: "What is a common pitfall when solving problems in this topic?", a: "Failing to account for sign conventions or directional vectors during analysis." }
      ],
      videos: [
        { title: `${topicTitle} - Core Concepts Explained`, channel: "Vidyaverse AI Classroom", duration: "15 mins", videoId: "dQw4w9WgXcQ" }
      ]
    };
  }
};
