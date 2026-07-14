import type { Compound } from '../types'

/**
 * Biblioteca inicial — 12 compostos com ficha educacional.
 * defaultDoseMcg é SEMPRE null: o app nunca sugere dose. O usuário define
 * a própria dose no protocolo. Apenas para referência educacional.
 */
export const SEED_COMPOUNDS: Omit<Compound, 'id'>[] = [
  {
    name: '5-Amino-1MQ',
    category: 'Outro',
    halfLife: 'Não bem caracterizada',
    cycleNote: 'Uso oral em ciclos; observar resposta individual.',
    description:
      'Pequena molécula estudada por inibir a NNMT, enzima ligada ao metabolismo celular e à regulação de gordura. Interesse em composição corporal e vitalidade metabólica.',
    notes:
      'Costuma ser administrado por via oral (cápsula), sem reconstituição. Guardar em local seco e ao abrigo da luz.',
    route: 'Oral',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'AOD-9604',
    category: 'Metabólico',
    halfLife: '~20 min (plasma)',
    cycleNote: 'Frequentemente usado em jejum; ciclos contínuos.',
    description:
      'Fragmento do hormônio do crescimento (fração 176-191) estudado por seu papel na mobilização de gordura sem os efeitos sistêmicos amplos do GH.',
    notes:
      'Reconstituir com água bacteriostática e manter refrigerado. Sensível à agitação vigorosa.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Tesamorelina', 'CJC-1295 (no DAC)']
  },
  {
    name: 'BPC-157',
    category: 'Cicatrização',
    halfLife: '~4 h',
    cycleNote: 'Ciclos de reparo tecidual; pausas conforme objetivo.',
    description:
      'Peptídeo derivado de uma proteína gástrica, estudado por propriedades de reparo tecidual, angiogênese e proteção de tendões, ligamentos e mucosa.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Pode ser aplicado próximo à região-alvo ou de forma sistêmica.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['TB-500', 'GHK-Cu']
  },
  {
    name: 'Cerebrolysin',
    category: 'Cognitivo',
    halfLife: 'Ação neurotrófica prolongada',
    cycleNote: 'Aplicado em séries/ciclos; costuma seguir esquemas de dias.',
    description:
      'Mistura de peptídeos neurotróficos de baixo peso molecular estudada por suporte neuronal, plasticidade e função cognitiva.',
    notes:
      'Apresentação normalmente em ampola líquida pronta. Guardar conforme rótulo; proteger da luz.',
    route: 'Intramuscular / Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'CJC-1295 (no DAC)',
    category: 'GH',
    halfLife: '~30 min (sem DAC)',
    cycleNote: 'Costuma ser pulsado; frequentemente combinado com GHRP.',
    description:
      'Análogo de GHRH (versão sem Drug Affinity Complex) estudado por estimular pulsos de hormônio do crescimento respeitando o ritmo fisiológico.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. A versão sem DAC tem ação curta e é usada em pulsos.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Tesamorelina', 'AOD-9604']
  },
  {
    name: 'Dihexa',
    category: 'Cognitivo',
    halfLife: 'Prolongada (alta estabilidade)',
    cycleNote: 'Ciclos curtos; observar resposta cognitiva.',
    description:
      'Peptídeo derivado da angiotensina IV estudado por potente atividade sinaptogênica e interesse em memória e aprendizado.',
    notes:
      'Alta lipofilicidade. Seguir orientação de reconstituição/veículo do fornecedor; proteger da luz.',
    route: 'Oral / Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Epitalon',
    category: 'Outro',
    halfLife: 'Curta (ação sinalizadora)',
    cycleNote: 'Ciclos curtos e periódicos (ex.: séries de dias).',
    description:
      'Tetrapeptídeo (Epithalon) estudado por sua relação com a telomerase e a regulação do relógio biológico e do sono.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Costuma ser aplicado em séries curtas.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'GHK-Cu',
    category: 'Cicatrização',
    halfLife: 'Curta no plasma',
    cycleNote: 'Uso contínuo ou em ciclos de reparo/pele.',
    description:
      'Tripeptídeo de cobre estudado por remodelação de pele, cicatrização, produção de colágeno e efeito antioxidante.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Coloração azulada é característica do cobre.',
    route: 'Subcutânea / Tópica',
    defaultDoseMcg: null,
    stackWith: ['BPC-157', 'TB-500']
  },
  {
    name: 'Retatrutide',
    category: 'Metabólico',
    halfLife: 'Longa (aplicação semanal)',
    cycleNote: 'Titulação gradual; aplicação tipicamente semanal.',
    description:
      'Agonista triplo de receptores (GLP-1, GIP e glucagon) em estudo para controle de peso e regulação metabólica.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Titular de forma gradual conforme tolerância.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Selank',
    category: 'Cognitivo',
    halfLife: 'Curta (peptídeo)',
    cycleNote: 'Ciclos curtos; uso conforme necessidade.',
    description:
      'Peptídeo ansiolítico derivado da tuftsina, estudado por modulação de ansiedade, foco e equilíbrio imunológico sem sedação marcante.',
    notes:
      'Disponível em solução para uso subcutâneo ou intranasal. Refrigerar após reconstituição.',
    route: 'Subcutânea / Intranasal',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Tesamorelina',
    category: 'GH',
    halfLife: '~26-38 min',
    cycleNote: 'Uso contínuo; frequentemente noturno.',
    description:
      'Análogo estabilizado de GHRH estudado por estimular hormônio do crescimento, com interesse em gordura visceral.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Homogeneizar com movimentos suaves, sem agitar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['CJC-1295 (no DAC)', 'AOD-9604']
  },
  {
    name: 'TB-500',
    category: 'Cicatrização',
    halfLife: 'Prolongada (fração de timosina β4)',
    cycleNote: 'Fase de carga seguida de manutenção em muitos protocolos.',
    description:
      'Fração sintética da timosina beta-4 estudada por reparo tecidual, flexibilidade, angiogênese e migração celular.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Frequentemente combinado com BPC-157.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['BPC-157', 'GHK-Cu']
  },
  {
    name: 'Ipamorelin',
    category: 'GH',
    halfLife: '~2 h',
    cycleNote: 'Pulsado; frequentemente combinado com CJC-1295 / GHRH.',
    description:
      'GHRP seletivo considerado um dos mais "limpos" — estimula pulsos de GH com pouco efeito sobre cortisol e prolactina.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['CJC-1295 (no DAC)', 'Tesamorelina']
  },
  {
    name: 'Sermorelina',
    category: 'GH',
    halfLife: '~10-20 min',
    cycleNote: 'Uso contínuo; frequentemente noturno.',
    description:
      'Análogo de GHRH (fração 1-29) estudado por estimular a liberação natural de hormônio do crescimento.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Ipamorelin']
  },
  {
    name: 'GHRP-2',
    category: 'GH',
    halfLife: '~30 min',
    cycleNote: 'Pulsado; frequentemente com um GHRH.',
    description:
      'Peptídeo liberador de GH potente. Pode elevar levemente apetite, cortisol e prolactina.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['CJC-1295 (no DAC)']
  },
  {
    name: 'GHRP-6',
    category: 'GH',
    halfLife: '~15-30 min',
    cycleNote: 'Pulsado; conhecido pelo forte estímulo de apetite.',
    description:
      'GHRP que ativa fortemente a via da grelina, aumentando apetite além da liberação de GH.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['CJC-1295 (no DAC)']
  },
  {
    name: 'Hexarelina',
    category: 'GH',
    halfLife: '~20-30 min',
    cycleNote: 'Ciclos curtos; pode gerar tolerância com uso contínuo.',
    description:
      'GHRP potente. A resposta tende a diminuir com uso prolongado, então costuma ser ciclado.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'MK-677 (Ibutamoren)',
    category: 'GH',
    halfLife: '~24 h',
    cycleNote: 'Uso oral diário; ação prolongada.',
    description:
      'Secretagogo de GH ativo por via oral (mimético de grelina). Estimula GH e IGF-1 de forma sustentada.',
    notes:
      'Uso oral (cápsula/solução), sem reconstituição. Pode aumentar apetite e retenção de líquidos.',
    route: 'Oral',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'IGF-1 LR3',
    category: 'GH',
    halfLife: '~20-30 h',
    cycleNote: 'Ciclos definidos; ação prolongada.',
    description:
      'Análogo de IGF-1 de ação longa, estudado por sinalização anabólica e reparo tecidual.',
    notes: 'Reconstituir e refrigerar; sensível a calor e agitação.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Semaglutida',
    category: 'Metabólico',
    halfLife: 'Longa (~1 semana)',
    cycleNote: 'Aplicação semanal; titulação gradual.',
    description:
      'Agonista de GLP-1 amplamente estudado para controle de peso e glicemia por regular apetite e saciedade.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Náusea é comum no início; titular devagar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Tirzepatida',
    category: 'Metabólico',
    halfLife: '~5 dias',
    cycleNote: 'Aplicação semanal; titulação gradual.',
    description:
      'Agonista duplo de GIP e GLP-1, em estudo para perda de peso e controle metabólico com efeito robusto.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Titular de forma gradual conforme tolerância.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'MOTS-c',
    category: 'Metabólico',
    halfLife: 'Curta (peptídeo)',
    cycleNote: 'Ciclos periódicos.',
    description:
      'Peptídeo derivado da mitocôndria estudado por sensibilidade à insulina, metabolismo e desempenho.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'SS-31 (Elamipretida)',
    category: 'Metabólico',
    halfLife: 'Curta',
    cycleNote: 'Ciclos definidos.',
    description:
      'Peptídeo direcionado à mitocôndria (liga-se à cardiolipina), estudado por energia celular e função mitocondrial.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Semax',
    category: 'Cognitivo',
    halfLife: 'Curta',
    cycleNote: 'Ciclos curtos conforme necessidade.',
    description:
      'Peptídeo derivado do ACTH (origem russa) estudado por foco, memória, neuroproteção e recuperação neural.',
    notes: 'Disponível em solução intranasal ou subcutânea. Refrigerar após reconstituição.',
    route: 'Intranasal / Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Selank']
  },
  {
    name: 'Pinealon',
    category: 'Cognitivo',
    halfLife: 'Curta (peptídeo curto)',
    cycleNote: 'Ciclos curtos e periódicos.',
    description:
      'Peptídeo curto neuroprotetor estudado por memória, proteção neuronal e regulação do estresse oxidativo.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Epitalon']
  },
  {
    name: 'KPV',
    category: 'Cicatrização',
    halfLife: 'Curta',
    cycleNote: 'Uso conforme objetivo (intestino/pele).',
    description:
      'Tripeptídeo derivado do α-MSH com interesse anti-inflamatório, saúde intestinal e cicatrização.',
    notes: 'Reconstituir com água bacteriostática e refrigerar; também usado por via oral.',
    route: 'Subcutânea / Oral',
    defaultDoseMcg: null,
    stackWith: ['BPC-157']
  },
  {
    name: 'ARA-290 (Cibinetida)',
    category: 'Cicatrização',
    halfLife: 'Curta',
    cycleNote: 'Ciclos definidos.',
    description:
      'Derivado da eritropoetina (não hematopoiético) estudado por reparo tecidual e dor neuropática.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Thymosin Alpha-1',
    category: 'Outro',
    halfLife: '~2 h',
    cycleNote: 'Ciclos conforme objetivo imunológico.',
    description:
      'Peptídeo tímico imunomodulador, estudado por regular a resposta imune; aprovado em alguns países para essa finalidade.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'DSIP',
    category: 'Outro',
    halfLife: 'Curta',
    cycleNote: 'Uso à noite, conforme necessidade.',
    description:
      'Peptídeo indutor do sono profundo (Delta Sleep-Inducing Peptide) estudado por sono, estresse e regulação hormonal.',
    notes: 'Reconstituir com água bacteriostática e refrigerar. Costuma ser aplicado antes de dormir.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Epitalon']
  },
  {
    name: 'PT-141 (Bremelanotida)',
    category: 'Outro',
    halfLife: '~2-3 h',
    cycleNote: 'Uso conforme necessidade.',
    description:
      'Agonista de melanocortina estudado por libido e função sexual, agindo pelo sistema nervoso central.',
    notes: 'Reconstituir com água bacteriostática e refrigerar. Náusea e rubor podem ocorrer.',
    route: 'Subcutânea / Intranasal',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Melanotan II',
    category: 'Outro',
    halfLife: '~1 h',
    cycleNote: 'Fase de carga e manutenção; uso ciclado.',
    description:
      'Análogo de α-MSH estudado por pigmentação/bronzeamento da pele e efeitos sobre a libido.',
    notes:
      'Reconstituir com água bacteriostática e refrigerar. Pode causar náusea e escurecimento de pintas — acompanhamento da pele é prudente.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'Kisspeptina-10',
    category: 'Outro',
    halfLife: 'Curta',
    cycleNote: 'Uso conforme objetivo hormonal.',
    description:
      'Peptídeo que estimula o eixo reprodutivo (liberação de LH e testosterona), estudado por fertilidade e função hormonal.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Gonadorelina']
  },
  {
    name: 'Gonadorelina',
    category: 'Outro',
    halfLife: '~2-10 min',
    cycleNote: 'Pulsado; imita a liberação natural de GnRH.',
    description:
      'Análogo de GnRH estudado por estimular LH e FSH, com interesse na manutenção do eixo hormonal.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['Kisspeptina-10']
  },
  {
    name: 'Humanina',
    category: 'Outro',
    halfLife: 'Curta',
    cycleNote: 'Ciclos periódicos.',
    description:
      'Peptídeo mitocondrial estudado por citoproteção, metabolismo e longevidade.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['MOTS-c']
  },
  {
    name: 'Follistatina 344',
    category: 'Outro',
    halfLife: 'Curta',
    cycleNote: 'Ciclos curtos e definidos.',
    description:
      'Proteína que se liga à miostatina, estudada por interesse em massa e recuperação muscular.',
    notes: 'Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: []
  },
  {
    name: 'KLOW',
    category: 'Cicatrização',
    halfLife: 'Combina peptídeos de meia-vidas variadas',
    cycleNote: 'Ciclos de reparo; fase de carga seguida de manutenção é comum.',
    description:
      'Blend de recuperação com quatro peptídeos: GHK-Cu, BPC-157, TB-500 e KPV. Estudada pela sinergia em reparo tecidual, formação de colágeno/angiogênese e modulação da inflamação.',
    notes:
      'Vem liofilizada (frasco combinado, tipicamente ~80 mg: 50 GHK-Cu / 10 BPC-157 / 10 TB-500 / 10 KPV). Reconstituir com água bacteriostática e refrigerar.',
    route: 'Subcutânea',
    defaultDoseMcg: null,
    stackWith: ['BPC-157', 'TB-500', 'GHK-Cu', 'KPV']
  }
]

/** Nomes dos compostos da biblioteca (não editáveis — editar cria cópia). */
export const SEED_NAMES = new Set(SEED_COMPOUNDS.map((c) => c.name))

export function isSeedCompound(name: string): boolean {
  return SEED_NAMES.has(name)
}
